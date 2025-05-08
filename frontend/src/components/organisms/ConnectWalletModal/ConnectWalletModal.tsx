import { FC, FormEvent, useEffect, useState } from 'react';
import Modal, { ModalProps } from '../../molecules/Modal/Modal';
import { useAuth } from '../../../hooks/auth.hooks';
import { useAppDispatch } from '../../../hooks/redux.hooks';
import Button from 'components/atoms/Button/Button';
import { useWallet } from '@solana/wallet-adapter-react';
import { updateUser } from 'redux/slices/user.slice';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import TextInput from 'components/atoms/TextInput';
import Label from 'components/atoms/Label';

export interface ConnectWalletModalProps extends ModalProps {
}

export interface ConnectWalletModalState {
  data: {
    walletId: string;
  };
  error?: any;
}

const initialState: ConnectWalletModalState = {
  data: {
    walletId: '',
  },
  error: '',
};

const ConnectWalletModal: FC<ConnectWalletModalProps> = ({
  title,
  onClose,
  onProcess,
}) => {
  const [state, setState] = useState(initialState);
  const wallet = useWallet();
  const { authenticatedUser } = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (wallet.publicKey) {
      setState({ ...state, data: { ...state.data, walletId: wallet.publicKey.toBase58() } });
    } else {
      setState({ ...state, data: { ...state.data, walletId: '' } });
    }
  }, [wallet.publicKey]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!state.data.walletId) {
      setState({ ...state, error: 'You have not provided any wallet' });
      return;
    }
    const formData = new FormData(event.target as any);

    if (authenticatedUser) {
      formData.set('walletId', state.data.walletId);

      dispatch(
        updateUser(authenticatedUser.id, formData, {
          onError: ({ response }) => setState({ ...state, error: response.data.error }),
          onSuccess: () => onProcess?.(),
        }),
      );
    }
  };

  return (
    <Modal title={title} onClose={onClose} className='max-w-[896px]' allowClose={false}>
      <form className='flex flex-col px-6 py-8' onSubmit={handleSubmit}>
        {state.error && (
          <p className ='rounded-xl p-2 border border-red-500 bg-rose-200 text-red-500 mb-5'>{state.error}</p>
        )}
        <p className='text-white mb-8 text-justify'>
          Congratulation, you successfully migrated your account data from Ideaforge! In order to
          finish this process you need to provide your cryptowallet info. After that, you'll be able
          to fullfill missing data about your project and create it on invest platform.
        </p>
        <div className='flex flex-col text-white'>
          <Label htmlFor='create_account_walletId'>Wallet ID:</Label>
          <div className='grid sm:grid-cols-[1fr_200px] gap-4 items-center'>
            <TextInput
              type='text'
              id='create_account_walletId'
              value={state.data.walletId}
              readOnly
              className='!p-3 rounded-lg text-white'
            />
            <WalletMultiButton>Choose a wallet</WalletMultiButton>
          </div>
        </div>
        <div className='flex gap-4 mt-8'>
          <Button type='submit' className='rounded-xl w-full'>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ConnectWalletModal;
