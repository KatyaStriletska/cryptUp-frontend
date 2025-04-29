import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import * as web3 from '@solana/web3.js';
import { Project } from '../types/project.types';
import axios, { HttpStatusCode } from 'axios';
import idl from '../../mintTokenIdl.json';
import { Program, AnchorProvider, AnchorError, BN } from '@coral-xyz/anchor';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { NftMetadata } from 'types/nft.types';

const toBytesArray = (string: string) => new TextEncoder().encode(string);

const createDataForProgram = (metadataUrl: string, nftName: string) => {
  return Buffer.from(
    Uint8Array.of(
      0,
      ...[].slice.call(toBytesArray(metadataUrl)),
      ...[].slice.call(toBytesArray(',')),
      ...[].slice.call(toBytesArray(nftName)),
    ),
  );
};

export const createNftTransaction = async (
  connection: web3.Connection,
  programId: web3.PublicKey,
  payer: web3.PublicKey,
  metadataUrl: string,
  nftName: string,
) => {
  const TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey(
    import.meta.env.VITE_TOKEN_METADATA_PROGRAM_ID,
  );
  // Mint account
  const mintKeypair: web3.Keypair = web3.Keypair.generate();
  console.log(`New token mint addr: ${mintKeypair.publicKey}`);

  // Associated token address
  const tokenAddress = await getAssociatedTokenAddress(mintKeypair.publicKey, payer);

  // Derive the metadata and master edition addresses
  const metadataAddress = (
    await web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintKeypair.publicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    )
  )[0];
  console.log(`Metadata initialized, metadataAddress: ${metadataAddress}`);

  // Master Edition
  const masterEditionAddress = (
    await web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintKeypair.publicKey.toBuffer(),
        Buffer.from('edition'),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    )
  )[0];
  console.log(`Master edition metadata initialized, masterEditionAddress: ${masterEditionAddress}`);

  // Transact with the "mint" function in our on-chain program
  const transaction = new web3.Transaction();
  transaction.add(web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }));
  transaction.add(
    new web3.TransactionInstruction({
      keys: [
        // Mint Authority
        {
          pubkey: payer,
          isSigner: true,
          isWritable: false,
        },
        // Mint
        {
          pubkey: mintKeypair.publicKey,
          isSigner: true,
          isWritable: true,
        },
        // Metadata
        {
          pubkey: metadataAddress,
          isSigner: false,
          isWritable: true,
        },
        // Master Edition
        {
          pubkey: masterEditionAddress,
          isSigner: false,
          isWritable: true,
        },
        // Token Account
        {
          pubkey: tokenAddress,
          isSigner: false,
          isWritable: true,
        },
        // Rent
        {
          pubkey: web3.SYSVAR_RENT_PUBKEY,
          isSigner: false,
          isWritable: false,
        },
        // System program
        {
          pubkey: web3.SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
        // Token Program
        {
          pubkey: TOKEN_PROGRAM_ID,
          isSigner: false,
          isWritable: false,
        },
        // Associated token program
        {
          pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
          isSigner: false,
          isWritable: false,
        },
        // Token metadata program
        {
          pubkey: TOKEN_METADATA_PROGRAM_ID,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: programId,
      data: createDataForProgram(metadataUrl, nftName),
    }),
  );
  transaction.feePayer = payer;
  const latestBlock = await connection.getLatestBlockhash('finalized');
  transaction.recentBlockhash = latestBlock.blockhash;
  transaction.lastValidBlockHeight = latestBlock.lastValidBlockHeight;
  transaction.partialSign(mintKeypair);
  return transaction;
};

export const getIPFSUrlForProject = async (project: Project) => {
  const response = await axios.post(`projects/ipfs-url`, project);
  if (response.status === HttpStatusCode.Created) {
    return response.data.ipfsURL;
  }
};

export const burnNFT = async (
  connection: web3.Connection,
  investor: WalletContextState,
  nftMint: string,
) => {
  if (!investor.publicKey || !investor.signTransaction) {
    console.error('Wallet not connected!');
    return;
  }
  const provider = new AnchorProvider(connection, investor as any, AnchorProvider.defaultOptions());
  const programId = new web3.PublicKey('81gGjzAisknzmYv9mUMwYyEMY8xtGtX1GQ4xtwTTVNCR'); // TODO: add from env
  console.log('IDL:', idl);
  console.log('Program ID:', programId.toBase58());
  console.log('Provider Wallet:', provider.wallet.publicKey.toBase58());

  if (!idl) {
    console.error('IDL is not loaded!');
    return;
  }
  const program = new Program(idl as any, provider as any);
  try {
    const tx = await program.methods
      .burnNft()
      .accounts({
        investor: investor.publicKey,
        nftMint: new web3.PublicKey(nftMint),
      })
      .rpc({ commitment: 'confirmed' });
    console.log('Transaction Signature:', tx);
  } catch (error) {
    console.error('Error during burning NFT:', error);
    if (error instanceof AnchorError) {
      console.error('\nProgram Logs:', error.logs);
    }
    throw error;
  }
};

export const burnNFTAndStartVesting = async (
  connection: web3.Connection,
  investor: WalletContextState,
  nftMint: string,
) => {
  if (!investor.publicKey || !investor.signTransaction) {
    console.error('Wallet not connected!');
    return;
  }
  const provider = new AnchorProvider(connection, investor as any, AnchorProvider.defaultOptions());
  const programId = new web3.PublicKey('81gGjzAisknzmYv9mUMwYyEMY8xtGtX1GQ4xtwTTVNCR'); // TODO: add from env
  console.log('IDL:', idl);
  console.log('Program ID:', programId.toBase58());
  console.log('Provider Wallet:', provider.wallet.publicKey.toBase58());

  if (!idl) {
    console.error('IDL is not loaded!');
    return;
  }
  const program = new Program(idl as any, provider as any);
  try {
    const tx = await program.methods
      .burnNft()
      .accounts({
        investor: investor.publicKey,
        nftMint: new web3.PublicKey(nftMint),
      })
      .rpc({ commitment: 'confirmed' });
    console.log('Transaction Signature:', tx);
  } catch (error) {
    console.error('Error during burning NFT:', error);
    if (error instanceof AnchorError) {
      console.error('\nProgram Logs:', error.logs);
    }
    throw error;
  }
};

export const claimTokens = async (
  connection: web3.Connection,
  beneficiary: WalletContextState,
  tokenMintAddress: string,
) => {
  const provider = new AnchorProvider(
    connection,
    beneficiary as any,
    AnchorProvider.defaultOptions(),
  );

  if (!idl) {
    console.error('IDL is not loaded!');
    return;
  }
  const program = new Program(idl as any, provider as any);
  const transaction = new web3.Transaction();
  const beneficiaryPublicKey = beneficiary.publicKey;
  const mintPublicKey = new web3.PublicKey(tokenMintAddress);
  if (!beneficiaryPublicKey) {
    console.log('No beneficialy ');
    return;
  }
  const [vestingAccountPda] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from('vesting'), beneficiaryPublicKey.toBuffer(), mintPublicKey.toBuffer()],
    program.programId,
  );
  const [vaultAuthorityPda] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from('vault_authority'), beneficiaryPublicKey.toBuffer(), mintPublicKey.toBuffer()],
    program.programId,
  );
  const [vestingVaultPda] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), beneficiaryPublicKey.toBuffer(), mintPublicKey.toBuffer()],
    program.programId,
  );
  const beneficiaryTokenAccountAddress = getAssociatedTokenAddressSync(
    mintPublicKey,
    beneficiaryPublicKey,
  );

  console.log('Accounts for claim:', {
    beneficiary: beneficiaryPublicKey.toBase58(),
    vestingAccount: vestingAccountPda.toBase58(),
    vaultAuthority: vaultAuthorityPda.toBase58(),
    vestingVault: vestingVaultPda.toBase58(),
    beneficiaryTokenAccount: beneficiaryTokenAccountAddress.toBase58(),
  });
  try {
    const instruction = await program.methods
      .claimVestedTokens()
      .accountsStrict({
        beneficiary: beneficiaryPublicKey,
        vestingAccount: vestingAccountPda,
        vaultAuthority: vaultAuthorityPda,
        vestingVault: vestingVaultPda,
        beneficiaryTokenAccount: beneficiaryTokenAccountAddress,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
      })
      .instruction();
    transaction.add(instruction);
  } catch (error) {
    console.error('Error during burning NFT:', error);
    if (error instanceof AnchorError) {
      console.error('\nProgram Logs:', error.logs);
    }
    return null;
  }
  transaction.feePayer = beneficiaryPublicKey;
  try {
    const latestBlock = await connection.getLatestBlockhash('confirmed'); // Можна 'confirmed'
    transaction.recentBlockhash = latestBlock.blockhash;
    transaction.lastValidBlockHeight = latestBlock.lastValidBlockHeight;
  } catch (error) {
    console.error('Error fetching latest blockhash:', error);
    return null;
  }
  return transaction;
};

export const burnNFTs = async (
  connection: web3.Connection,
  investor: WalletContextState,
  nftCollection: NftMetadata[],
) => {
  if (!investor.publicKey || !investor.signTransaction) {
    console.error('Wallet not connected!');
    return;
  }
  const provider = new AnchorProvider(connection, investor as any, AnchorProvider.defaultOptions());
  if (!idl) {
    console.error('IDL is not loaded!');
    return;
  }
  const program = new Program(idl as any, provider as any);
  const transaction = new web3.Transaction();

  for (const nftAddress of nftCollection) {
    try {
      const burnNftInstruction = await program.methods
        .burnNft()
        .accounts({
          investor: investor.publicKey,
          nftMint: new web3.PublicKey(nftAddress),
        })
        .instruction();

      transaction.add(burnNftInstruction);
    } catch (error) {
      console.error('Error during burning NFT:', error);
      if (error instanceof AnchorError) {
        console.error('\nProgram Logs:', error.logs);
      }
      throw error;
    }
  }
  // start vesting
  transaction.feePayer = investor.publicKey;
  const latestBlock = await connection.getLatestBlockhash('finalized'); // це для того щоб транзакція не була вічною
  transaction.recentBlockhash = latestBlock.blockhash;
  transaction.lastValidBlockHeight = latestBlock.lastValidBlockHeight;

  return transaction;
};
