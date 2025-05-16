import React, { FC, FormEvent, useEffect, useMemo, useState } from 'react';
import Modal, { ModalProps } from '../../molecules/Modal/Modal';
import { BN, web3 } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import Button from 'components/atoms/Button/Button';
import TextInput from 'components/atoms/TextInput';
import Label from 'components/atoms/Label';
import SelectInput from 'components/atoms/SelectInput';

interface TokenAccountInfo {
  pubkey: PublicKey;
  account: {
    data: web3.ParsedAccountData;
    executable: boolean;
    lamports: number;
    owner: PublicKey;
    rentEpoch?: number | undefined;
  };
}

export interface TradeFormData {
  userTokenAccount: TokenAccountInfo;
  amountToSell: string;
  expectedUsdcAmount: string;
}

export interface CreateTradeTokenModalProps extends Omit<ModalProps, 'onProcess'> {
  isOpen: boolean;
  userProTokens: TokenAccountInfo[];
  onProcessTrade: (data: TradeFormData) => Promise<void>;
  isSubmitting: boolean;
  submitError?: string | null;
}

interface CreateTradeTokenModalState {
  data: {
    selectedTokenAccountPubkey: string;
    amountToSell: string;
    expectedUsdcAmount: string;
  };
  localValidationError: string | null;
}

const initialState: CreateTradeTokenModalState = {
  data: {
    selectedTokenAccountPubkey: '',
    amountToSell: '',
    expectedUsdcAmount: '',
  },
  localValidationError: null,
};

const CreateTradeTokenModal: FC<CreateTradeTokenModalProps> = ({
  isOpen,
  title = 'Create Sell Proposal',
  onClose,
  userProTokens,
  onProcessTrade,
  isSubmitting,
  submitError,
  className,
  children,
}) => {
  const [state, setState] = useState<CreateTradeTokenModalState>(initialState);

  useEffect(() => {
    if (isOpen) {
      setState({ ...initialState, localValidationError: submitError ?? null });
    }
  }, [isOpen]);

  const selectedTokenAccountInfo = useMemo(() => {
    return userProTokens.find(
      token => token.pubkey.toBase58() === state.data.selectedTokenAccountPubkey,
    );
  }, [userProTokens, state.data.selectedTokenAccountPubkey]);

  const isDataValid = (data: CreateTradeTokenModalState['data']): boolean => {
    setState(prev => ({ ...prev, localValidationError: null }));
    if (!data.selectedTokenAccountPubkey) {
      setState(prev => ({ ...prev, localValidationError: 'Please select a token account.' }));
      return false;
    }

    const amountSell = parseFloat(data.amountToSell);
    if (isNaN(amountSell) || amountSell <= 0) {
      setState(prev => ({
        ...prev,
        localValidationError: 'Amount to sell must be a positive number.',
      }));
      return false;
    }

    if (selectedTokenAccountInfo) {
      const balanceStr =
        selectedTokenAccountInfo.account.data.parsed.info.tokenAmount.uiAmountString;
      const balanceNum = parseFloat(balanceStr);
      if (amountSell > balanceNum) {
        setState(prev => ({
          ...prev,
          localValidationError: `Amount exceeds balance (${balanceStr}).`,
        }));
        return false;
      }
    } else {
      setState(prev => ({
        ...prev,
        localValidationError: 'Selected token account info not found.',
      }));
      return false;
    }

    const amountUsdc = parseFloat(data.expectedUsdcAmount);
    if (isNaN(amountUsdc) || amountUsdc <= 0) {
      setState(prev => ({
        ...prev,
        localValidationError: 'Expected USDC amount must be a positive number.',
      }));
      return false;
    }

    return true;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (isDataValid(state.data) && selectedTokenAccountInfo) {
      if (isSubmitting) return;

      await onProcessTrade({
        userTokenAccount: selectedTokenAccountInfo,
        amountToSell: state.data.amountToSell,
        expectedUsdcAmount: state.data.expectedUsdcAmount,
      });
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    field: keyof CreateTradeTokenModalState['data'],
  ) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, [field]: event.target.value },
      localValidationError: null,
    }));
  };

  return (
    <Modal title={title} onClose={onClose} className={`max-w-[500px] ${className}`}>
      <form className='flex flex-col px-10 py-8' onSubmit={onSubmit}>
        {(state.localValidationError || submitError) && (
          <span className='bg-rose-100 border border-rose-200 p-2 rounded-md mb-6 font-mono text-sm'>
            {state.localValidationError || submitError}
          </span>
        )}

        <div className='flex flex-col gap-4'>
          {' '}
          <div className='flex flex-col'>
            <label
              htmlFor='tokenAccountSelectModal'
              className='mb-1.5 font-semibold text-white text-lg mx-0.5'
            >
              Sell From Account
            </label>
            <SelectInput
              id='tokenAccountSelectModal'
              value={state.data.selectedTokenAccountPubkey}
              onChange={e => handleInputChange(e, 'selectedTokenAccountPubkey')}
              className='p-3 rounded-lg font-mono'
              options={ [{value: '', label: 'Select Account' }, ...userProTokens.map(tokenInfo => {
                const info = tokenInfo.account.data.parsed.info;
                const balance = info.tokenAmount.uiAmountString;
                const address = tokenInfo.pubkey.toBase58();
                return { value: address, label: `Acc: ...${address.slice(-6)} (Bal: {balance})` };
              })]}
            >
            
            </SelectInput>
            {selectedTokenAccountInfo && (
              <div className='mt-1 text-sm text-gray-600'>
                Balance:{' '}
                {selectedTokenAccountInfo.account.data.parsed.info.tokenAmount.uiAmountString}{' '}
                (Decimals: {selectedTokenAccountInfo.account.data.parsed.info.tokenAmount.decimals})
              </div>
            )}
          </div>
          <div className='flex flex-col'>
            <Label htmlFor='amountToSellModal'>Amount to Sell ('protoken')</Label>
            <TextInput
              id='amountToSellModal'
              type='number'
              value={state.data.amountToSell}
              onChange={e => handleInputChange(e, 'amountToSell')}
              placeholder='e.g., 100'
              required
              min='0'
              step='any'
              className=' !p-3 rounded-lg'
            />
          </div>
          <div className='flex flex-col'>
            <Label htmlFor='expectedUsdcModal'>Expected Price (USDC)</Label>
            <TextInput
              id='expectedUsdcModal'
              type='number'
              value={state.data.expectedUsdcAmount}
              onChange={e => handleInputChange(e, 'expectedUsdcAmount')}
              placeholder='e.g., 50'
              required
              min='0'
              step='any'
              className=' !p-3 rounded-lg'
            />
          </div>
        </div>

        <div className='flex gap-4 mt-10'>
          <Button
            type='submit'
            disabled={isSubmitting || !!state.localValidationError}
            className='inline-flex text-center justify-center items-center text-white rounded-full py-2 px-10 font-sans font-medium text-lg disabled:opacity-60'
          >
            {isSubmitting ? 'Creating...' : 'Create'}
          </Button>
          <button
            type='button'
            className='inline-flex text-center justify-center items-center secondary-green-button rounded-full transition-all duration-300 py-2 px-10 font-sans font-medium text-lg'
            onClick={onClose}
            disabled={isSubmitting}
          >
            Close
          </button>
        </div>
      </form>
      {children}
    </Modal>
  );
};

export default CreateTradeTokenModal;
