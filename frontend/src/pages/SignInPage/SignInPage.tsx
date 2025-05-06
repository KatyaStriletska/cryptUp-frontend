import { useWallet } from '@solana/wallet-adapter-react';
import { FC, FormEvent, useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../hooks/auth.hooks';
import { useLocation, useNavigate } from 'react-router';
import { AppRoutes } from '../../types/enums/app-routes.enum';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Link } from 'react-router-dom';
import { GoogleIcon } from '../../components/atoms/Icons/Icons';
import axios from 'axios';
import cookies from 'js-cookie';
import { SignInMethod } from '../../types/auth.types';
import * as jose from 'jose';
import TextInput from 'components/atoms/TextInput';
import Button from 'components/atoms/Button/Button';

export interface SignInFormState {
  data: {
    email: string;
    password: string;
  };
  error?: string; 
  isLoaded: boolean;
  isLoggedIn: boolean;
  isLoading: false;
}

const initialState: SignInFormState = {
  data: {
    email: '',
    password: '',
  },
  isLoaded: false,
  isLoggedIn: false,
  isLoading: false,
};

const SignInPage: FC = () => {
  const [state, setState] = useState(initialState);
  const { signIn, signOut } = useAuth();
  const wallet = useWallet();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignInWithGoogle = useCallback(async () => {
    const response = await axios.post('/oauth/google', {
      referer: window.location.toString(),
    });

    window.location.href = response.data.url;
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(state.data.email)) {
      setState({ ...state, error: 'Email must have the following format: example@gmail.com' });
      return;
    }

    if (
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

    signIn(
      SignInMethod.Credentials,
      { email: state.data.email, password: state.data.password },
      {
        onSuccess: () => navigate(AppRoutes.Home),
        onError: ({ response }) => setState({ ...state, error: response.data.error }),
      },
    );
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    if (!state.isLoaded) {
      signOut();
      setState({ ...state, isLoaded: true });
    }
  }, [state.isLoaded]);

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

          if (payload.accessToken) {
            signIn(
              SignInMethod.Google,
              { googleAccessToken: payload.accessToken },
              {
                onSuccess: () => navigate(AppRoutes.Home),
                onError: ({ response }) => setState({ ...state, error: response.data.error }),
              },
            );
          } else {
            setState({ ...state, error: payload.error });
          }
        });
    }
  }, []);

  useEffect(() => {
    if (state.isLoaded) {
      if (wallet.publicKey && location.state?.walletDisconnect) {
        wallet.publicKey = null;
        wallet.disconnect();
        sessionStorage.removeItem('wallet');
        location.state.walletDisconnect = false;
        return;
      }

      if (wallet.publicKey && wallet.signMessage && !state.isLoggedIn) {
        setState({ ...state, isLoggedIn: true });
        signIn(
          SignInMethod.Wallet,
          { wallet },
          {
            onSuccess: () => {
              navigate(AppRoutes.Home);
              sessionStorage.setItem('wallet', wallet.publicKey!.toString());
              setState({ ...state, isLoggedIn: false });
            },
            onError: () => {
              setState({
                ...state,
                error: 'The user with such Wallet ID does not exist!',
                isLoggedIn: false,
              });
              wallet.disconnect();
            },
          },
        );
      }
    }
  }, [wallet.publicKey, wallet.signMessage, state.isLoaded, state.isLoggedIn]);

  return (
    <div className='flex flex-col min-h-screen'>
      <div className='flex flex-col items-center justify-center flex-1 py-10'>
        <div className='flex-1 flex flex-col items-center justify-center w-full'>
          <img src='/logo.png' className='w-[10em] mb-12' />
          <form
            className='max-w-xl flex flex-col w-full text-white p-10 rounded-xl'
            onSubmit={handleSubmit}
          >
            <h5 className='text-3xl text-center text-white'>
              Sign in or{' '}
              <Link to={AppRoutes.SignUp} className='underline'>
                Create account
              </Link>
            </h5>

            <div className='flex flex-col gap-4 mb-4 mt-10'>
            {state.error && (
              <span className='mb-6 inline-flex items-center justify-between px-3 py-2 text-red-500 border border-red-200 rounded-lg bg-red-50'>
                {state.error}
              </span>
            )}
              <TextInput
                className='!p-4 py-px rounded-[20px] !text-4xl !font-mono !font-normal'
                type='email'
                id='sign_in_email'
                defaultValue={state.data.email}
                placeholder='E-mail'
                onChange={event =>
                  setState({
                    ...state,
                    data: { ...state.data, email: event.target.value },
                    error: undefined,
                  })
                }
              />
              <TextInput
                className='!p-4 py-px rounded-[20px] !text-4xl !font-mono !font-normal'
                type='password'
                id='sign_in_password'
                defaultValue={state.data.password}
                placeholder='Password'
                onChange={event =>
                  setState({
                    ...state,
                    data: { ...state.data, password: event.target.value },
                    error: undefined,
                  })
                }
              />
            </div>
            <Button type='submit' uppercase className='mt-4 !rounded-2xl !text-4xl' size='lg'>
              Sign in
            </Button>
            <div className='flex items-center justify-center my-10 h-0 bg-zinc-400 rounded-lg mx-0.5'>
              <span className='text-white text-2xl min-[1920px]:text-3xl text-center my-10'>
                or
              </span>
            </div>
            <div className='flex flex-col gap-3'>
              <WalletMultiButton style={{ fontSize: '1.125rem', lineHeight: '1.75rem' }}>
                Continue with Solana Wallet
              </WalletMultiButton>
              <button
                type='button'
                className='text-lg inline-flex text-center justify-center items-center secondary-green-button  px-10 py-2 font-medium'
                onClick={handleSignInWithGoogle}
              >
                <GoogleIcon className='size-5 me-2' />
                Continue with Google
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className='md:left-20 bottom-20 absolute w-full md:w-auto inline-flex justify-center'>
        <img src='/solana-white-logo.png' className='w-72' />
      </div>
    </div>

    // <main className='flex flex-col items-center bg-white dark:bg-dark-primary'>
    //   <form
    //     onSubmit={event => {
    //       if (!state.isLoading) {
    //         handleSubmit(event);
    //       }
    //     }}
    //     className='flex flex-col flex-1 w-full max-w-xl p-10 mt-10 rounded-2xl'
    //   >
    //     <h5 className='text-3xl text-center text-white'>
    //     {formatMessage({id:"sign.inOr"})}{' '}
    //       <Link to={ApplicationRoutes.SignUp} className='underline'>
    //       {formatMessage({id:"create.account"})}
    //       </Link>
    //     </h5>
    //     <div className='flex flex-col mt-10 space-y-4'>
    //       {state.error?.message && (
    //         <span className='inline-flex items-center justify-between px-3 py-2 text-red-500 border border-red-200 rounded-lg bg-red-50'>
    //           {state.error?.message}
    //           <span
    //             className='inline-flex p-2 transition-all duration-300 cursor-pointer hover:text-red-600'
    //             onClick={() => setState({ ...state, error: null })}
    //           >
    //             <XMarkIcon className='size-3 stroke-[5px]' />
    //           </span>
    //         </span>
    //       )}
    //       <TextInput
    //         type='email'
    //         className='!p-4 text-2xl min-[1920px]:text-3xl font-mono font-normal'
    //         placeholder={formatMessage({ id: 'email' })}
    //         value={state.data.email}
    //         onChange={e =>
    //           setState(prevState => ({
    //             ...prevState,
    //             data: { ...prevState.data, email: e.target.value },
    //           }))
    //         }
    //       />
    //       <TextInput
    //         type='password'
    //         className='!p-4 text-2xl min-[1920px]:text-3xl font-mono font-normal'
    //         placeholder={formatMessage({ id: 'password' })}
    //         value={state.data.password}
    //         onChange={e =>
    //           setState(prevState => ({
    //             ...prevState,
    //             data: { ...prevState.data, password: e.target.value },
    //           }))
    //         }
    //       />
    //     </div>
    //     <div className='grid grid-cols-1'>
    //       <Button
    //         type='submit'
    //         size='lg'
    //         className='mt-10 rounded-3xl'
    //         uppercase
    //         isLoading={state.isLoading}
    //       >
    //        {formatMessage({id:"sign.in"})}
    //       </Button>
    //     </div>
    //     <h5 className='text-white text-2xl min-[1920px]:text-3xl text-center my-10'>{formatMessage({ id: 'or' })}</h5>
    //     <div className='flex flex-col self-center text-white gap-7'>
    //       <span
    //         className='inline-flex items-center gap-5 cursor-pointer'
    //         onClick={() => handleSignInWithOAuthProvider(OAuth2Providers.Google)}
    //       >
    //         <GoogleIcon className='size-8' />
    //         <span className='text-white text-2xl font-[400] underline'>{formatMessage({id:"continue.google"})}</span>
    //       </span>
    //     </div>
    //   </form>
    // </main>
  );
};

export default SignInPage;
