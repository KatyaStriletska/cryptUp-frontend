import { useWallet } from '@solana/wallet-adapter-react';
import { FC, FormEvent, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { AppRoutes } from '../../types/enums/app-routes.enum';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Link } from 'react-router-dom';
import { UserRoleEnum } from '../../types/enums/user-role.enum';
import { useAuth } from '../../hooks/auth.hooks';
import { GoogleIcon } from '../../components/atoms/Icons/Icons';
import cookies from 'js-cookie';
import * as jose from 'jose';
import axios from 'axios';
import Label from 'components/atoms/Label';
import TextInput from 'components/atoms/TextInput';
import SelectInput from 'components/atoms/SelectInput';
import Button from 'components/atoms/Button/Button';

interface CreateAccountFormState {
  data: {
    walletId: string;
    email: string;
    username: string;
    role: UserRoleEnum;
    password?: string;
    firstName?: string;
    lastName?: string;
  };
  error: string | null;
  withGoogle: boolean;
}

const initialState: CreateAccountFormState = {
  data: {
    walletId: '',
    email: '',
    username: '',
    role: UserRoleEnum.Startup,
    password: undefined,
    firstName: undefined,
    lastName: undefined,
  },
  error: null,
  withGoogle: false,
};

const SignUpPage: FC = () => {
  const [state, setState] = useState(initialState);
  const wallet = useWallet();
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSignUpWithGoogle = useCallback(async () => {
    const response = await axios.post('/oauth/google', {
      referer: window.location.toString(),
    });

    window.location.href = response.data.url;
  }, []);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!state.data.walletId) {
      setState({ ...state, error: 'The wallet was not chosen' });
      return;
    }

    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(state.data.email)) {
      setState({ ...state, error: 'Email must have the following format: example@gmail.com' });
      return;
    }

    if (!/^(\d|\w)+$/.test(state.data.username)) {
      setState({
        ...state,
        error: 'Username cannot be empty and must contain only latin letters, digits or underscore',
      });
      return;
    }

    if (
      state.data.password &&
      !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&\.])[A-Za-z\d@$!%*#?&_=\-+\.]{8,}$/.test(
        state.data.password,
      )
    ) {
      setState({
        ...state,
        error:
          'The password must be minimum 8 characters long and contain at least one latin letter, one digit and one special symbol',
      });
      return;
    }

    if (!state.error) {
      signUp(
        wallet,
        { ...state.data, role: [state.data.role] },
        {
          onSuccess: () => navigate(AppRoutes.Home),
          onError: ({ response }) => setState({ ...state, error: response.data.error }),
        },
      );
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    if (wallet.publicKey) {
      setState({ ...state, data: { ...state.data, walletId: wallet.publicKey.toBase58() } });
    } else {
      setState({ ...state, data: { ...state.data, walletId: '' } });
    }
  }, [wallet.publicKey]);

  useEffect(() => {
    if (cookies.get('auth.token')) {
      const authToken = cookies.get('auth.token') || '';
      cookies.remove('auth.token', { path: '/', domain: import.meta.env.VITE_COOKIE_DOMAIN_NAME });
      
      jose
        .jwtVerify(
          authToken,
          new TextEncoder().encode(import.meta.env.VITE_JWT_SECRET),
        )
        .then(result => {
          const payload = result.payload as any;

          if (payload.error) {
            setState({ ...state, error: payload.error });
          } else {
            const { email, firstName, lastName } = payload;
            setState({
              ...state,
              data: { ...state.data, email, firstName, lastName },
              withGoogle: true,
            });
          }
        });
    }
  }, []);

  return (
    <div className='flex flex-col min-h-screen'>
      <div className='flex flex-col items-center justify-center flex-1 py-10'>
        <img src='/logo.png' className='w-[10em] mb-12' />
        <form
          className='flex flex-col max-w-3xl w-full text-white border-gradient-primary before:rounded-2xl p-10 rounded-xl'
          onSubmit={onSubmit}
        >
          <h3 className='w-full font-bold text-2xl mb-1'>Create account</h3>
          <p className='text mb-4 text-gray-300 font-medium'>
            Fill in all the fields to complete the new account registration process
          </p>
          {state.error && (
            <span className='bg-rose-100 border border-rose-200 rounded-md p-2 font-mono text-sm'>
              {state.error}
            </span>
          )}
          <div className='flex flex-col gap-4 my-4'>
            <div className='flex flex-col'>
              <Label htmlFor='create_account_walletId'>Wallet ID:</Label>
              <div className='grid sm:grid-cols-[1fr_200px] gap-4 items-center'>
                <TextInput
                  type='text'
                  id='create_account_walletId'
                  defaultValue={state.data.walletId}
                  readOnly
                  className='!p-3 rounded-lg'
                />
                <WalletMultiButton>Choose a wallet</WalletMultiButton>
              </div>
            </div>
            <div className='flex flex-col'>
              <Label htmlFor='create_account_email'>Email:</Label>
              <TextInput
                disabled={state.withGoogle}
                className='!p-3 rounded-lg'
                type='email'
                id='create_account_email'
                placeholder='example@gmail.com'
                defaultValue={state.data.email}
                onChange={event =>
                  setState({
                    ...state,
                    data: { ...state.data, email: event.target.value },
                    error: null,
                  })
                }
              />
            </div>
            <div className='flex flex-col'>
              <Label htmlFor='create_account_username'>Username:</Label>
              <TextInput
                className='!py-3'
                type='text'
                id='create_account_username'
                defaultValue={state.data.username}
                placeholder='venturelaunch'
                onChange={event =>
                  setState({
                    ...state,
                    data: { ...state.data, username: event.target.value },
                    error: null,
                  })
                }
              />
            </div>
            <div className='flex flex-col'>
              <Label htmlFor='create_account_role'>Role:</Label>
              <SelectInput
                id='create_account_role'
                value={state.data.role}
                onChange={event =>
                  setState({
                    ...state,
                    data: { ...state.data, role: event.target.value as UserRoleEnum },
                    error: null,
                  })
                }
                className='py-3'
                options={Object.values(UserRoleEnum).map(item => ({
                  value: item,
                  label: item,
                }))}
              />
            </div>
          </div>
          <div className='flex flex-col'>
            <Label htmlFor='create_account_password'>Password (Optional):</Label>
            <span className='text-sm text-gray-300 mt-2 mb-3'>
              If you want to have an opportunity to sign in with email and password you have to fill
              in this field. You will also be able to set or change it on your profile page later.
              The password should be at least 8 characters long and contain at least one latin
              letter, one digit and one special symbol.
            </span>
            <TextInput
              className='!p-3'
              type='password'
              id='create_account_password'
              defaultValue={state.data.password}
              placeholder='Password'
              onChange={event =>
                setState({
                  ...state,
                  data: { ...state.data, password: event.target.value },
                  error: null,
                })
              }
            />
          </div>
          <Button
            type='submit'
            className='text-lg mt-8 inline-flex text-center justify-center items-center rounded-full px-10 py-3 font-bold'
          >
            Create account
          </Button>
          <div className='flex items-center justify-center my-8 h-[0px] bg-zinc-400 rounded-lg mx-0.5'>
          <span className='text-white text-2xl min-[1920px]:text-3xl text-center my-10'>
                or
              </span>
          </div>
          <button
            type='button'
            className='text-xl font-medium inline-flex text-center justify-center items-center secondary-green-button transition-all duration-300 rounded-full px-10 py-3'
            onClick={handleSignUpWithGoogle}
          >
            <GoogleIcon className='size-5 me-3' />
            Sign up with Google
          </button>
          <span className='block mt-8 text-center'>
            Already have a registered account?{' '}
            <Link
              to={AppRoutes.SignIn}
              state={{ walletDisconnect: true }}
              className='text-white underline underline-offset-2'
            >
              Sign in
            </Link>
          </span>
        </form>
        <img src='/solana-white-logo.png' className='w-40 mt-10' />
      </div>
    </div>
  );
};

export default SignUpPage;
