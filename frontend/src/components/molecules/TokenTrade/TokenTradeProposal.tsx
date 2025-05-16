import { AnchorProvider, Program, ProgramAccount, web3 } from '@coral-xyz/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import Button from 'components/atoms/Button/Button';
import useWeb3Auth from 'hooks/web3auth.hooks';
import { FC, useEffect, useMemo, useState } from 'react';
import { Escrow, P2pTradeProgram } from 'types/token-market.types';
import { buyTokens, cancelTrade } from 'utils/token.market.utils';
import idl from '../../../../tokenMarketIdl.json';
import { getMint } from '@solana/spl-token';
import { set } from '@coral-xyz/anchor/dist/cjs/utils/features';

type LotType = {
  id: string;
  title: string;
  description: string;
  amount: number;
  price: number;
};
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
};
export interface TokenTradeProposalProps {
  lot: LotDetails;
  onPurchaseSuccess: () => Promise<void>;
}
export const USDC_MINT = new web3.PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');

const TokenTradeProposal: FC<TokenTradeProposalProps> = ({ lot, onPurchaseSuccess }) => {
  const [expectedUsdcAmount, setExpectedUsdcAmount] = useState(0);
  const [tradeAmount, setTradeAmount] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { connection } = useConnection();
  const { connectWallet } = useWeb3Auth();

  const wallet = useWallet();

  const owner = lot.account.owner.toBase58();
  useEffect(() => {
    owner === wallet?.publicKey?.toBase58() ? setIsOwner(true) : setIsOwner(false);
  });

  useEffect(() => {
    const formatAmount = async () => {
      const decimal = await getMint(connection, lot.account.tradeTokenMint).then(
        mint => mint.decimals,
      );
      setTradeAmount(lot.account.tradeAmount.toNumber() / 10 ** decimal);

      const decimalUSDC = await getMint(connection, USDC_MINT).then(mint => mint.decimals);
      setExpectedUsdcAmount(lot.account.expectedAmount.toNumber() / 10 ** decimalUSDC);
    };
    formatAmount();
  }, [lot.account.tradeTokenMint, lot.account.expectedAmount, connection]);

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

  const handleBuyToken = async () => {
    if (!program) {
      return;
    }

    if (wallet && wallet.publicKey && wallet.signTransaction) {
      try {
        setIsLoading(true);
        const transaction = await buyTokens(
          program,
          lot.account.tradeId,
          wallet.publicKey,
          lot.account.owner,
          lot.account.tradeTokenMint,
        );
        if (!transaction) {
          console.error('Transaction not found!');
          return;
        }
        transaction.feePayer = wallet.publicKey;
        const latestBlockhash = await connection.getLatestBlockhash('confirmed');
        transaction.recentBlockhash = latestBlockhash.blockhash;
        transaction.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;

        const signedTransaction = await wallet.signTransaction(transaction);

        const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        });
        await connection.confirmTransaction(
          {
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            signature: signature,
          },
          'confirmed',
        );
        console.log('Transaction sent:', signature);
        await onPurchaseSuccess();
      } catch (error) {
        console.error('Error during transaction:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      connectWallet();
    }
  };

  const handleCancelTrade = async () => {
    if (!program) {
      return;
    }

    if (wallet && wallet.publicKey && wallet.signTransaction) {
      setIsLoading(true);
      try {
        const transaction = await cancelTrade(
          program,
          lot.account.tradeId,
          lot.account.tradeTokenMint,
        );
        if (!transaction) {
          console.error('Transaction not found!');
          return;
        }
        transaction.feePayer = wallet.publicKey;
        const latestBlockhash = await connection.getLatestBlockhash('confirmed');
        transaction.recentBlockhash = latestBlockhash.blockhash;
        transaction.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;

        const signedTransaction = await wallet.signTransaction(transaction);

        const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        });
        await connection.confirmTransaction(
          {
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            signature: signature,
          },
          'confirmed',
        );
        console.log('Transaction sent:', signature);
        await onPurchaseSuccess();
      } catch (error) {
        console.error('Error during transaction:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      connectWallet();
    }
  };

  return (
    <tr className='text-white border-b'>
      <td className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap'>
        <div className='text-white'>{lot.metadata?.name}</div>
        <div className='text-white'>Mint: {lot.account.tradeTokenMint.toBase58()}</div>
      </td>
      <td className='px-6 py-4'>{tradeAmount} PROTOKEN</td>
      <td className='px-6 py-4'>{expectedUsdcAmount} USDC</td>
      <td className='px-6 py-4 text-m'>{owner}</td>
      <td className='px-6 py-4 text-center'>
        {!isOwner &&
          (isLoading ? (
            <div className='flex items-center justify-center'>
              <button
                type='button'
                className='bg-green-300 rounded-lg text-white font-bold hover:bg-green-200 hover:cursor-not-allowed duration-[500ms,800ms]'
                disabled
              >
                <div className='flex items-center justify-center m-[10px]'>
                  <div className='h-5 w-5 border-t-transparent border-solid animate-spin rounded-full border-white border-4'></div>
                  <div className='ml-2'> Processing... </div>
                </div>
              </button>
            </div>
          ) : (
            <Button
              className=' text-m px-14 py-2.5 bg-green-500 hover:bg-green-600 rounded-lg text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed'
              onClick={handleBuyToken}
            >
              Buy
            </Button>
          ))}

        {isOwner &&
          (isLoading ? (
            <div className='flex items-center justify-center'>
              <button
                type='button'
                className='bg-red-300 rounded-lg text-white font-bold hover:bg-red-200 hover:cursor-not-allowed duration-[500ms,800ms]'
                disabled
              >
                <div className='flex items-center justify-center m-[10px]'>
                  <div className='h-5 w-5 border-t-transparent border-solid animate-spin rounded-full border-white border-4'></div>
                  <div className='ml-2'> Processing... </div>
                </div>
              </button>
            </div>
          ) : (
            <Button
              className='text-m px-6 py-2.5 bg-red-500 hover:bg-red-600 rounded-lg text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed'
              onClick={handleCancelTrade}
            >
              Cancel Trade
            </Button>
          ))}
      </td>
    </tr>
  );
};
export default TokenTradeProposal;
