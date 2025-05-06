import { FC, FormEvent, useEffect, useRef, useState } from 'react';
import Modal, { ModalProps } from '../../molecules/Modal/Modal';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux.hooks';
import { selectErrors, setError, updateUser } from '../../../redux/slices/user.slice';
import { User } from '../../../types/user.types';
import { RemoveIcon } from 'components/atoms/Icons/Icons';
import { resolveImage } from '../../../utils/file.utils';
import Spinner from 'components/atoms/Spinner/Spinner';
import Avatar from 'components/molecules/Avatar';
import Label from 'components/atoms/Label';
import TextInput from 'components/atoms/TextInput';
import TextareaInput from 'components/atoms/TextareaInput';
import Button from 'components/atoms/Button/Button';

export interface EditUserModalProps extends ModalProps {
  user: User;
}

interface EditUserModalState {
  data: {
    username?: string;
    email?: string;
    bio?: string | null;
    avatar?: File | null;
    password?: string;
    firstName?: string;
    lastName?: string;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: EditUserModalState = {
  data: {
    username: undefined,
    email: undefined,
  },
  isLoading: false,
  error: null,
};

const EditUserModal: FC<EditUserModalProps> = ({ user, title, onClose, onProcess, children }) => {
  const [state, setState] = useState({
    ...initialState,
    data: {
      ...initialState.data,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      bio: user.bio,
    },
  });
  const formRef = useRef<HTMLFormElement | null>(null);
  const dispatch = useAppDispatch();
  const errors = useAppSelector(selectErrors);

  useEffect(() => {
    dispatch(setError({ updateUser: null }));
  }, []);

  useEffect(() => {
    setState({ ...state, error: errors.updateUser });
  }, [errors.updateUser]);

  const isDataValid = (data: EditUserModalState['data']): boolean => {
    if (data.email && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(data.email)) {
      setState({ ...state, error: 'Email must have the following format: example@gmail.com' });
      return false;
    }

    if (data.firstName && !/^\w+$/.test(data.firstName)) {
      setState({
        ...state,
        error: 'First name cannot be empty and must contain only latin letters',
      });
      return false;
    }

    if (data.lastName && !/^\w+$/.test(data.lastName)) {
      setState({
        ...state,
        error: 'Last name cannot be empty and must contain only latin letters',
      });
      return false;
    }

    if (data.username && !/^(\d|\w)+$/.test(data.username)) {
      setState({
        ...state,
        error: 'Username cannot be empty and must contain only latin letters, digits or underscore',
      });
      return false;
    }

    if (
      data.password &&
      !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&\.])[A-Za-z\d@$!%*#?&_=\-+\.]{8,}$/.test(data.password)
    ) {
      setState({
        ...state,
        error:
          'The password must be minimum 8 characters long and contain at least one latin letter, one digit and one special symbol',
      });
      return false;
    }

    return true;
  };

  const onSubmit = () => {

    if (isDataValid(state.data)) {
      setState({ ...state, isLoading: true });
      const formData = new FormData();

      if (state.data.avatar) {
        formData.append('user-avatar', state.data.avatar);
      }

      Object.entries(state.data).forEach(([key, value]: [string, any]) => {
        if (value === null || value === '') {
          formData.append(key, '');
        } else if (value && !(value instanceof File)) {
          if (value instanceof Date) {
            formData.set(key, new Date(value).toISOString());
          } else if (value === Object(value)) {
            formData.set(key, JSON.stringify(value));
          } else {
            formData.set(key, value.toString());
          }
        }
      });

      dispatch(
        updateUser(user.id, formData, {
          onSuccess: () => {
            onProcess?.();
            setState({ ...state, isLoading: false });
          },
          onError: () => setState({ ...state, isLoading: false }),
        }),
      );
    }
  };

  return (
    <Modal
      title={title}
      onClose={onClose}
      className='max-w-[768px]'
      actions={
        !state.isLoading ? (
        <div className='mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <Button type='button' onClick={onSubmit as any} className='rounded-2xl'>
            Save changes
          </Button>
          <button
            type='button'
            className='secondary-green-button'
            onClick={onClose}
          >
            Cancel
          </button>
        </div>)
        : null
      }
    >
      {!state.isLoading ? (
        <>
          <form ref={formRef} className='flex flex-col px-10 py-8 gap-5'>
            {state.error && (
              <span className='bg-rose-100 border border-rose-200 p-2 rounded-md mb-3 font-mono text-sm'>
                {state.error}
              </span>
            )}
            <div className='flex items-center gap-4'>
              <div className='w-full flex flex-col items-center gap-4'>
                <Avatar
                  usersAvatar
                  src={
                    state.data.avatar
                      ? URL.createObjectURL(state.data.avatar)
                      : user.avatar
                        ? resolveImage(user.avatar!)
                        : undefined
                  }
                  onImageChange={file =>
                    setState({ ...state, data: { ...state.data, avatar: file } })
                  }
                />

                {/* {(user.avatar || state.data.avatar) && (
                  <div>
                    <button
                      onClick={() => setState({ ...state, data: { ...state.data, avatar: null } })}
                      className='p-2 secondary-red-button rounded-xl ms-2 text-center items-center flex justify-center'
                      type='button'
                    >
                      Remove photo
                    </button>
                  </div>
                )} */}
              </div>

              {/* {((!user.avatar && !state.data.avatar) || state.data.avatar === null) && (
                <div className='flex items-center justify-center bg-gray-300 w-[80px] rounded-full aspect-square'>
                  <UserIcon className='size-8' />
                </div>
              )}
              {user.avatar && state.data.avatar === undefined && (
                <img
                  src={resolveImage(user.avatar)}
                  alt='User profile image'
                  className='rounded-full w-[80px] aspect-square object-cover'
                />
              )}
              {state.data.avatar && (
                <img
                  src={URL.createObjectURL(state.data.avatar)}
                  alt='User profile image'
                  className='rounded-full w-[80px] aspect-square object-cover'
                />
              )} */}
            </div>
            <div className='text-white space-y-4'>
              <div className='flex flex-col '>
                <Label htmlFor='update_user_username'>Username</Label>
                <TextInput
                  id='update_user_username'
                  placeholder='username'
                  className='!py-2'
                  defaultValue={state.data.username}
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
                <Label htmlFor='update_user_email'>Email</Label>
                <TextInput
                  id='update_user_email'
                  type='email'
                  placeholder='aboba@gmail.com'
                  className='!py-2'
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
                <Label htmlFor='update_user_password'>Password</Label>
                <TextInput
                  type='password'
                  id='update_user_password'
                  placeholder='Password'
                  className='!py-2'
                  onChange={event =>
                    setState({
                      ...state,
                      data: { ...state.data, password: event.target.value },
                      error: null,
                    })
                  }
                />
              </div>
              <div className='flex flex-col'>
                <Label htmlFor='update_user_first_name'>First name</Label>
                <TextInput
                  type='text'
                  id='update_user_first_name'
                  placeholder='John'
                  className='!py-2'
                  defaultValue={state.data.firstName}
                  onChange={event =>
                    setState({
                      ...state,
                      data: { ...state.data, firstName: event.target.value },
                      error: null,
                    })
                  }
                />
              </div>
              <div className='flex flex-col'>
                <Label htmlFor='update_user_last_name'>Last name</Label>
                <TextInput
                  id='update_user_last_name'
                  placeholder='Doe'
                  className='!py-2'
                  value={state.data.lastName}
                  onChange={event =>
                    setState({
                      ...state,
                      data: { ...state.data, lastName: event.target.value },
                      error: null,
                    })
                  }
                />
              </div>
              <div className='flex flex-col'>
                <Label htmlFor='update_user_bio'>Bio</Label>
                <TextareaInput
                  id='update_user_bio'
                  defaultValue={state.data.bio || undefined}
                  placeholder='My biography ...'
                  className='mt-1'
                  onChange={value =>
                    setState({
                      ...state,
                      data: { ...state.data, bio: value },
                      error: null,
                    })
                  }
                />
              </div>
            </div>
          </form>
          {children}
        </>
      ) : (
        <div className='px-10 py-8 flex flex-col items-center justify-center min-h-[300px] gap-5'>
          <Spinner className='size-12 text-gray-200 animate-spin fill-zinc-900' />
          <p className='text-center text-white'>
            We are proceeding your request. Please, wait for some time
          </p>
        </div>
      )}
    </Modal>
  );
};

export default EditUserModal;
