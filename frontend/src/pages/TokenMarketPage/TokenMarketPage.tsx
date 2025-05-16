import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { createOrder, getAllPrposals } from '../../utils/token.market.utils';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { AnchorProvider, BN, Program, ProgramAccount, web3 } from '@coral-xyz/anchor';
import { P2pTradeProgram } from 'types/token-market.types';
import idl from '../../../tokenMarketIdl.json';
import { Escrow } from 'types/token-market.types';
import { Metaplex } from '@metaplex-foundation/js';
import useWeb3Auth from '../../hooks/web3auth.hooks';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import Button from 'components/atoms/Button/Button';
import CreateTradeTokenModal, {
  TradeFormData,
} from 'components/organisms/CreateTradeTokenModal/CreateTradeTokenModal';
import TokenTradeProposal from 'components/molecules/TokenTrade/TokenTradeProposal';
import Spinner from 'components/atoms/Spinner/Spinner';
import Title from 'components/atoms/Title';

interface TokenAccountInfo {
  pubkey: web3.PublicKey;
  account: {
    data: web3.ParsedAccountData;
    executable: boolean;
    lamports: number;
    owner: web3.PublicKey;
    rentEpoch?: number | undefined;
  };
}

interface TokenDisplayMetadata {
  symbol?: string;
  name?: string;
  imageUri?: string;
  decimals?: number;
}

export type LotDetails = {
  publicKey: web3.PublicKey;
  account: Escrow;
  metadata: TokenDisplayMetadata | null;
  // expectedTokenMeta: TokenDisplayMetadata | null;
};
const TokenMarketPage: FC = () => {
  const { connection } = useConnection();
  const { connectWallet } = useWeb3Auth();

  const [proposals, setProposals] = useState<LotDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [proposalError, setProposalError] = useState<string | null>(null);

  const [isLoadingTokens, setIsLoadingTokens] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);
  const [usersTokens, setUsersTokens] = useState<TokenAccountInfo[]>([]);

  const wallet = useWallet();

  const program = useMemo(() => {
    if (connection && wallet.publicKey) {
      const provider = new AnchorProvider(
        connection,
        wallet as any,
        AnchorProvider.defaultOptions(),
      );
      return new Program<P2pTradeProgram>(idl as any, provider);
    }
    return null;
  }, [connection, wallet?.publicKey, wallet?.signTransaction]);

  const loadProposals = useCallback(async () => {
    if (!wallet) connectWallet();
    if (program && metaplex) {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedProposals = await getAllPrposals(program);
        let proposalsWithMetadata: LotDetails[] = [];
        for (const proposal of fetchedProposals) {
          try {
            const mint = proposal.account.tradeTokenMint;
            const nft = await metaplex.nfts().findByMint({ mintAddress: mint });
            const metadataJson = await fetch(nft.uri).then(res => res.json());
            const tokenMetadata: TokenDisplayMetadata = {
              name: metadataJson.name,
              imageUri: metadataJson.image,
              symbol: metadataJson.symbol,
            };

            proposalsWithMetadata.push({
              publicKey: proposal.publicKey,
              account: proposal.account,
              metadata: tokenMetadata,
            });
          } catch (err) {
            console.warn(
              'Could not load metadata for:',
              proposal.account.tradeTokenMint.toBase58(),
              err,
            );
          }
        }
        setProposals(proposalsWithMetadata);
      } catch (err: any) {
        console.error('Failed to fetch proposals:', err);
        setError(err.message || 'Failed to fetch proposals');
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log('Program object not ready yet.');
      setProposals([]);
      setIsLoading(false);
      setError(null);
    }
  }, [program]);

  useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  const metaplex = useMemo(() => {
    if (connection) {
      return Metaplex.make(connection);
    }
    return null;
  }, [connection]);

  useEffect(() => {
    const fetchAndFilterUserTokens = async () => {
      if (!metaplex) {
        console.error('Metaplex is not initialized.');
        return;
      }
      if (!wallet?.publicKey) {
        setUsersTokens([]);
        return;
      }
      if (!connection) {
        return;
      }
      try {
        const parsedTokenAccounts = await connection.getParsedTokenAccountsByOwner(
          wallet.publicKey,
          {
            programId: TOKEN_PROGRAM_ID,
          },
          'confirmed',
        );
        const accountsWithValidBalance = parsedTokenAccounts.value.filter(accountInfo => {
          const parsedInfo = accountInfo.account.data?.parsed?.info;
          return parsedInfo && parsedInfo.tokenAmount && parsedInfo.tokenAmount.amount !== '0';
        });

        if (accountsWithValidBalance.length === 0) {
          console.log('Accounts with balance > 0 not found.');
          setUsersTokens([]);
        }

        let foundProTokens: TokenAccountInfo[] = [];
        for (const accountInfo of accountsWithValidBalance) {
          const mintString = accountInfo.account.data.parsed.info.mint;

          if (!mintString) {
            continue;
          }

          try {
            const mintPublicKey = new web3.PublicKey(mintString);
            const metadata = await metaplex.nfts().findByMint({ mintAddress: mintPublicKey });

            if (metadata?.symbol === 'PROTOKEN') {
              foundProTokens.push(accountInfo);
            }
          } catch (error: any) {
            console.error(
              `Could not fetch/process metadata for mint ${mintString}:`,
              error.message,
            );
          }
        }
        setUsersTokens(foundProTokens);
      } catch (error) {
        console.error('Failed to fetch or filter token accounts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndFilterUserTokens();
  }, [connection, wallet?.publicKey?.toBase58(), metaplex]);

  console.log('Users tokens:', usersTokens);

  const handleProcessTradeCallback = useCallback(
    async (data: TradeFormData) => {
      if (!program || !wallet.publicKey || !wallet.signTransaction) {
        setProposalError('Wallet or program not ready');
        return;
      }

      const { userTokenAccount, amountToSell, expectedUsdcAmount } = data;

      setIsSubmittingProposal(true);
      setProposalError(null);

      if (wallet.publicKey && wallet.signTransaction) {
        if (
          isNaN(Number(amountToSell)) ||
          Number(amountToSell) <= 0 ||
          isNaN(Number(expectedUsdcAmount)) ||
          Number(expectedUsdcAmount) <= 0
        ) {
          throw new Error('Invalid amounts entered.');
        }
        const tokenForSaleMint = new web3.PublicKey(userTokenAccount.account.data.parsed.info.mint);
        try {
          const transactionCreateOrder = await createOrder(
            connection,
            wallet,
            tokenForSaleMint,
            Number(amountToSell),
            Number(expectedUsdcAmount),
          );

          if (!transactionCreateOrder) throw new Error('Failed to create transaction object.');

          const transaction = await wallet.signTransaction(transactionCreateOrder);
          console.log(transaction);

          const dataAccountHash = await connection.sendRawTransaction(transaction.serialize(), {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
          });

          const latestBlockHash = await connection.getLatestBlockhash();
          await connection.confirmTransaction(
            {
              blockhash: latestBlockHash.blockhash,
              lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
              signature: dataAccountHash,
            },
            'confirmed',
          );
          setIsModalOpen(false);
          await loadProposals();
        } catch (error) {
          console.error('Error creating proposal:', error);
        } finally {
          setIsSubmittingProposal(false);
        }
      } else {
        connectWallet();
      }
    },
    [program, wallet, connection],
  );

  return (
    <div className='min-h-screen mx-5'>
      <div className='flex justify-between items-center mb-4 px-6 min-h-full'>
        <Title>Token Market</Title>
        <Button
          className='inline-flex border-transparent bg-zinc-900 hover:bg-transparent border-2 hover:border-zinc-900 hover:text-zinc-900 text-white px-10 py-1.5 transition-all duration-300 rounded-full font-sans font-medium'
          onClick={() => {
            setIsModalOpen(true);
            loadProposals();
          }}
          disabled={isLoadingTokens || usersTokens.length === 0 || !wallet.publicKey}
        >
          {usersTokens.length === 0 && !isLoadingTokens
            ? 'No "protoken" to sell'
            : 'Create New Sell Proposal'}
        </Button>
      </div>
      {isLoading && (
        <div className='max-w-[1440px] flex flex-col items-center justify-center flex-1 gap-5 w-full'>
          <Spinner className='size-12 animate-spin text-white' />
          <p className='text-center font-mono'>Loading the active proposal for you</p>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!program && !isLoading && <p>Connect wallet to see proposals.</p>}
      {program && !isLoading && !error && proposals.length === 0 && (
        <p>No active proposals found.</p>
      )}

      {!isLoadingTokens && !isLoading && !proposalError && proposals.length > 0 && (
        <div className=' bg-gradient-white-purple rounded-xl overflow-x-auto text-white'>
          <table className='w-full text-sm text-left '>
            <thead className='text-base uppercase text-white'>
              <tr>
                <th scope='col' className='px-6 py-3'>
                  Sell Token
                </th>
                <th scope='col' className='px-6 py-3'>
                  Amount
                </th>
                <th scope='col' className='px-6 py-3'>
                  Asking Price
                </th>
                <th scope='col' className='px-6 py-3'>
                  Seller
                </th>
                <th scope='col' className='px-6 py-3 text-center'>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {proposals.map(p => (
                <TokenTradeProposal
                  key={p.account.tradeId.toString()}
                  lot={p}
                  onPurchaseSuccess={loadProposals}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <CreateTradeTokenModal
          isOpen={isModalOpen}
          title='Create Sell Proposal'
          onClose={() => {
            setIsModalOpen(false);
            setProposalError(null);
          }}
          userProTokens={usersTokens}
          onProcessTrade={handleProcessTradeCallback}
          isSubmitting={isSubmittingProposal}
          submitError={proposalError}
        />
      )}
    </div>
  );
};
export default TokenMarketPage;
