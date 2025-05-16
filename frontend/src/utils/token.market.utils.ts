import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import * as web3 from '@solana/web3.js';
import BN from 'bn.js';
import { P2pTradeProgram } from '../types/token-market.types';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Wallet, WalletContextState } from '@solana/wallet-adapter-react';
import idl from '../../tokenMarketIdl.json';
export const USDC_MINT = new web3.PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');
export const programId = new web3.PublicKey('CixfUytaZUwNF29aXs1CnyjSXB9UTTaU4Hvf5qye9x4G');
import { getMint } from '@solana/spl-token';

export async function getAllPrposals(program: Program<P2pTradeProgram>) {
  try {
    const allEscrowAccounts = await program.account.escrow.all();

    console.log(`Found ${allEscrowAccounts.length} total escrow accounts.`);

    const activeTrades = allEscrowAccounts.filter(escrow => {
      return 'readyExchange' in escrow.account.stage;
    });

    console.log(`Found ${allEscrowAccounts.length} active trade offers.`);

    allEscrowAccounts.forEach(trade => {
      const stageName = Object.keys(trade.account.stage)[0];
      console.log(`Trade PDA: ${trade.publicKey.toBase58()}`);
      console.log(` Owner: ${trade.account.owner.toBase58()}`);

      console.log(` Trade ID: ${trade.account.tradeId.toString()}`);
      console.log(` Stage: ${stageName}`);
      console.log(` Token for Sale Mint: ${trade.account.tradeTokenMint.toBase58()}`);
      console.log(` Amount for Sale: ${trade.account.tradeAmount.toString()}`);
      console.log(` Received Token Mint: ${trade.account.receivedTokenMint.toBase58()}`);
      console.log(` Expected Amount: ${trade.account.expectedAmount.toString()}`);
    });

    return activeTrades;
  } catch (error) {
    console.error('Error during fetching proposals:', error);
    return [];
  }
}

export async function createOrder(
  connection: web3.Connection,
  creator: WalletContextState,
  tokenForSale: web3.PublicKey,
  tradeAmount: number,
  expectedAmount: number,
) {
  if (!idl) {
    throw Error('Idl not found');
  }
  if (!creator || !creator.publicKey) {
    throw Error('Creator not found');
  }

  const provider = new AnchorProvider(connection, creator as any, AnchorProvider.defaultOptions());
  const program = new Program(idl as any, provider as any);

  const tradeId = new BN(Math.floor(Date.now() / 1000));
  const decimal = await getMint(connection, tokenForSale).then(mint => mint.decimals);
  const tradeAmountBN = new BN(tradeAmount * 10 ** decimal);

  const decimalUSDC = await getMint(connection, USDC_MINT).then(mint => mint.decimals);
  const expectedAmountBN = new BN(expectedAmount * 10 ** decimalUSDC);

  const params: any = {
    tradeId: tradeId,
    tradeAmount: tradeAmountBN,
    expectedAmount: expectedAmountBN,
    recipient: null,
  };
  const creatorAtaForSale = await getAssociatedTokenAddressSync(tokenForSale, creator.publicKey);
  const transaction = new web3.Transaction();

  try {
    const tx = await program.methods
      .createTrade(params)
      .accounts({
        creator: creator.publicKey,
        receivedTokenMintAccount: USDC_MINT,
        tokenForSale: tokenForSale,
        creatorAtaForSale: creatorAtaForSale,
      })
      .instruction();
    transaction.add(tx);
    console.log('Transaction signature', tx);
  } catch (e) {
    console.error('Error during burning NFT:', e);
    return null;
  }
  transaction.feePayer = creator.publicKey;
  try {
    const latestBlock = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = latestBlock.blockhash;
    transaction.lastValidBlockHeight = latestBlock.lastValidBlockHeight;
  } catch (error) {
    console.error('Error fetching latest blockhash:', error);
    return null;
  }
  return transaction;
}
export async function buyTokens(
  program: Program<P2pTradeProgram>,
  tradeId: BN,
  buyerKeypair: web3.PublicKey,
  owner: web3.PublicKey,
  tokenForSaleMint: web3.PublicKey,
) {
  try {
    const transaction = await program.methods
      .exchange(tradeId)
      .accounts({
        buyer: buyerKeypair,
        owner: owner,
        tradeTokenMint: tokenForSaleMint,
        receivedTokenMint: USDC_MINT,
      } as any)
      .transaction();
    console.log('Transaction signature', transaction);
    return transaction;
  } catch (e) {
    console.error('Error during buying tokens:', e);
    return null;
  }
}

export async function cancelTrade(
  program: Program<P2pTradeProgram>,
  tradeId: BN,
  // owner: web3.PublicKey,
  tokenForSaleMint: web3.PublicKey,
) {
  try {
    const transaction = await program.methods
      .cancel(tradeId)
      .accounts({
        // owner: owner,
        tradeTokenMint: tokenForSaleMint,
      })
      .transaction();
    console.log('Transaction signature', transaction);
    return transaction;
  } catch (e) {
    console.error('Error during canceling trade:', e);
    return null;
  }
}
