import { FC, FormEvent, useEffect, useRef, useState } from 'react';
import Modal, { ModalProps } from '../../molecules/Modal/Modal';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux.hooks';
import { useAuth } from '../../../hooks/auth.hooks';
import {
  createProjectLaunch,
  selectErrors,
  setError,
} from '../../../redux/slices/project-launch.slice';
import Button from '../../atoms/Button/Button';
import {
  FileIcon,
  ImageIcon,
  PlusIcon,
  RemoveIcon,
  VideoIcon,
} from '../../atoms/Icons/Icons';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { USDC_MINT, createVaultTx, programId } from '../../../utils/venture-launch.utils';
import useWeb3Auth from '../../../hooks/web3auth.hooks';
import Spinner from 'components/atoms/Spinner/Spinner';
import Label from 'components/atoms/Label';
import TextInput from 'components/atoms/TextInput';
import TextareaInput from 'components/atoms/TextareaInput';
import Avatar from 'components/molecules/Avatar';
import SelectInput from 'components/atoms/SelectInput';
import cookies from 'js-cookie';

export interface LaunchProjectModalProps extends ModalProps {}

interface LaunchProjectModalState {
  data: {
    name?: string;
    description?: string;
    fundraiseAmount?: number;
    fundraiseDeadline?: Date;
    image?: File;
    documents?: File[];
    team: {
      image?: File;
      name?: string;
      linkedInUrl?: string;
      position?: string;
      bio?: string;
    }[];
    businessModel?: string;
    tokenomics?: string;
    externalId?: string;
    roundDetails: {
      ticketSize: {
        from?: number;
        to?: number;
      };
      round?: 'seed' | 'pre-seed' | 'private';
      dealStructure?: 'SAFT' | 'SAFE';
      tokenPrice?: number;
      valuation?: number;
      unlockAtTGE?: number;
      lockup?: number;
      vesting?: number;
    };
    milestoneNumber?: number;
  };
  error: string | null;
  isLoading: boolean;
}

const initialState: LaunchProjectModalState = {
  data: {
    name: undefined,
    description: undefined,
    fundraiseAmount: undefined,
    fundraiseDeadline: undefined,
    image: undefined,
    team: [],
    businessModel: 'empty',
    externalId: '',
    tokenomics: 'empty',
    roundDetails: {
      ticketSize: {
        from: undefined,
        to: undefined,
      },
      round: 'seed',
      dealStructure: 'SAFT',
      tokenPrice: undefined,
      valuation: undefined,
      unlockAtTGE: undefined,
      lockup: undefined,
      vesting: undefined,
    },
  },
  error: null,
  isLoading: false,
};

const LaunchProjectModal: FC<LaunchProjectModalProps> = ({ title, onClose, children, ...props }) => {
  const { authenticatedUser } = useAuth();
  const [state, setState] = useState(initialState);
  const formRef = useRef<HTMLFormElement | null>(null);
  const dispatch = useAppDispatch();
  const errors = useAppSelector(selectErrors);
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { connectWallet } = useWeb3Auth();

  useEffect(() => {
    dispatch(setError({ createProjectLaunch: null }));

    const projectCookieName = 'project-to-migrate';
    const projectDataCookie = cookies.get(projectCookieName) || '';
    if (projectDataCookie) {
      cookies.remove(projectCookieName, { path: '/', domain: import.meta.env.VITE_COOKIE_DOMAIN_NAME });
      const projectDataAsObject = JSON.parse(projectDataCookie);
      state.data.name = projectDataAsObject.name;
      state.data.description = projectDataAsObject.description;
      state.data.externalId = projectDataAsObject.id;
      setState({
        ...state
      });
    }
  }, []);

  useEffect(() => {
    setState({ ...state, error: errors.createProjectLaunch });
  }, [errors.createProjectLaunch]);

  const isDataValid = (data: LaunchProjectModalState['data']): boolean => {
    if (!data.name?.trim()) {
      setState({ ...state, error: 'Project launch name cannot be empty.' });
      return false;
    }

    if (!data.description?.trim()) {
      setState({ ...state, error: 'Project launch description cannot be empty.' });
      return false;
    }

    if ((data.milestoneNumber ?? 0) <= 0) {
      setState({ ...state, error: 'Project launch number of milestones must be greater than 0.' });
      return false;
    }

    if ((data.fundraiseAmount ?? 0) <= 0) {
      setState({ ...state, error: 'Project launch fundraise amount must be greater than 0.' });
      return false;
    }

    if (new Date(data.fundraiseDeadline ?? 0).getTime() <= Date.now()) {
      setState({
        ...state,
        error: 'Project launch fundraise deadline cannot be earlier than current time.',
      });
      return false;
    }

    if (!data.businessModel?.trim()) {
      setState({ ...state, error: 'Project launch business model cannot be empty.' });
      return false;
    }

    if (!data.tokenomics?.trim()) {
      setState({ ...state, error: 'Project launch tokenomics cannot be empty.' });
      return false;
    }

    if ((data.roundDetails.ticketSize.from ?? 0) <= 0) {
      setState({ ...state, error: 'Project launch ticket size min value must be greater than 0.' });
      return false;
    }

    if ((data.roundDetails.ticketSize.to ?? 0) <= 0) {
      setState({ ...state, error: 'Project launch ticket size max value must be greater than 0.' });
      return false;
    }

    if ((data.roundDetails.ticketSize.from ?? 0) >= (data.roundDetails.ticketSize.to ?? 0)) {
      setState({
        ...state,
        error: 'Project launch ticket size min value must be less than max value.',
      });
      return false;
    }

    if (data.roundDetails.tokenPrice && data.roundDetails.tokenPrice <= 0) {
      setState({ ...state, error: 'Project launch token price must be greater than 0.' });
      return false;
    }

    if (data.roundDetails.valuation && data.roundDetails.valuation <= 0) {
      setState({ ...state, error: 'Project launch valuation must be greater than 0.' });
      return false;
    }

    if (data.roundDetails.unlockAtTGE && data.roundDetails.unlockAtTGE <= 0) {
      setState({ ...state, error: 'Project launch unlock at TGE must be greater than 0.' });
      return false;
    }

    if (data.roundDetails.lockup && data.roundDetails.lockup <= 0) {
      setState({ ...state, error: 'Project launch lockup must be greater than 0.' });
      return false;
    }

    if (data.roundDetails.vesting && data.roundDetails.vesting <= 0) {
      setState({ ...state, error: 'Project launch vesting must be greater than 0.' });
      return false;
    }

    if (
      data.team &&
      data.team.find(
        member =>
          !member.name?.trim() ||
          !member.linkedInUrl?.trim() ||
          !member.bio?.trim() ||
          !member.position?.trim(),
      )
    ) {
      setState({ ...state, error: 'One of the team members has incomplete information.' });
      return false;
    }

    return true;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setState({ ...state, isLoading: true });

    const dataIsValid = isDataValid(state.data);

    if (!dataIsValid && formRef.current?.parentElement) {
      formRef.current.parentElement.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (formRef.current && dataIsValid && authenticatedUser) {
      const formData = new FormData(formRef.current);
      formData.delete('project-documents');

      state.data.documents?.forEach(document => {
        formData.append('project-documents', document);
      });

      console.log('state.data', state.data)

      Object.entries({
        ...state.data,
        team: state.data.team?.map(member => ({ ...member, image: member.image?.name || '' })),
      }).forEach(([key, value]) => {
        if (value && !(value instanceof File)) {
          if (value instanceof Date) {
            formData.set(key, new Date(value).toISOString());
          } else if (value === Object(value)) {
            formData.set(key, JSON.stringify(value));
          } else {
            formData.set(key, value.toString());
          }
        }
      });

      if (authenticatedUser && publicKey && signTransaction) {
        formData.append('authorId', authenticatedUser.id);
        let [tx, vaultTokenAccount, cryptoTrackerAccount] = await createVaultTx(
          connection,
          programId,
          publicKey,
          USDC_MINT,
        );

        try {
          tx = await signTransaction(tx);
          await connection.sendRawTransaction(tx.serialize());

          formData.set('vaultTokenAccount', vaultTokenAccount.toBase58());
          formData.set('cryptoTrackerAccount', cryptoTrackerAccount.toBase58());

          dispatch(
            createProjectLaunch(
              formData,
              {
                onSuccess: () => {
                  setState({ ...state, isLoading: false });
                  props.onProcess?.();
                  onClose?.();
                },
                onError: () =>
                  setState({
                    ...state,
                    isLoading: false,
                    error:
                      'Cannot create project launch. The launch with such name already exists for this user or the invalid data was provided',
                  }),
              },
              true,
            ),
          );
        } catch (error: any) {
          setState({ ...state, isLoading: false, error: error.toString() });
        }
      } else {
        setState({ ...state, isLoading: false });
        connectWallet();
      }
    }
  };

  return (
    <Modal
      title={title}
      onClose={onClose}
      className='max-w-[868px] !max-h-[90%]'
      closeOnOutsideClick={false}
      {...props}
    >
      {!state.isLoading ? (
        <>
          <form ref={formRef} className='flex flex-col' onSubmit={onSubmit}>
            <div className='flex flex-col mx-10 mt-8 mb-14 text-white'>
              {state.error && (
                <span className='border-red-500 text-red-500 bg-rose-100 border p-2 rounded-md mb-5'>
                  {state.error}
                </span>
              )}
              <h3 className='text-2xl mb-5  sm:col-span-2 font-semibold'>General info</h3>
              <div className='grid sm:grid-cols-[180px_1fr] gap-8 mb-5 sm:mb-10'>
                <div className='flex flex-col'>
                  <div className='mt-10 mb-10'>
                    <Avatar
                      onImageChange={file =>
                        setState({
                          ...state,
                          data: { ...state.data, image: file! },
                        })
                      }
                    />
                    {/* {state.data.image ? (
                      <img
                        src={URL.createObjectURL(state.data.image)}
                        alt='Project launch image'
                        className='rounded-xl aspect-square object-cover'
                      />
                    ) : (
                      <div className='bg-neutral-200 flex items-center justify-center aspect-square rounded-lg'>
                        <EmptyLogoIcon className='stroke-2 text-neutral-500' />
                      </div>
                    )} */}
                  </div>
                  {/* <label
                    htmlFor='launch_project_logo'
                    className='cursor-pointer border-2 border-dashed font-sans font-medium rounded-full  border-zinc-900 inline-flex py-2 text-center justify-center items-center hover:border-solid hover:bg-zinc-900 hover:text-white transition-all duration-300'
                  >
                    Upload logo
                  </label>
                  <input
                    type='file'
                    name='project-logo'
                    id='launch_project_logo'
                    className='border p-2 rounded-md mb-5 hidden font-sans'
                    accept='image/*'
                    onChange={event =>
                      setState({
                        ...state,
                        data: { ...state.data, image: event.target.files?.[0] },
                      })
                    }
                  /> */}
                </div>
                <div className='flex flex-col gap-3'>
                  <div>
                    <Label htmlFor='launch_project_name'>Name</Label>
                    <TextInput
                      id='launch_project_name'
                      value={state.data.name}
                      className='!py-2'
                      onChange={event =>
                        setState({
                          ...state,
                          data: { ...state.data, name: event.target.value },
                          error: null,
                        })
                      }
                    />
                  </div>
                  {/* <input
                    type='text'
                    id='launch_project_name'
                    className='border border-stone-400 p-3 rounded-lg font-sans text-stone-800 placeholder:text-stone-400 mb-5 sm:mb-3'
                    placeholder='New project'
                    defaultValue={state.data.name}
                    onChange={event =>
                      setState({
                        ...state,
                        data: { ...state.data, name: event.target.value },
                        error: null,
                      })
                    }
                  /> */}
                  <div>
                    <Label htmlFor='launch_project_description'>Description</Label>
                    <TextareaInput
                      id='launch_project_description'
                      defaultValue={state.data.description}
                      className='w-full min-h-[110px] resize-none mt-1'
                      onChange={value =>
                        setState({
                          ...state,
                          data: { ...state.data, description: value },
                          error: null,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className='grid sm:grid-cols-2 gap-x-8 gap-y-5'>
                <div className='flex flex-col'>
                  <Label htmlFor='launch_project_milestones_number'>Number of milestones</Label>

                  <TextInput
                    id='launch_project_milestones_number'
                    type='number'
                    value={state.data.milestoneNumber}
                    className='!py-2'
                    onChange={event =>
                      setState({
                        ...state,
                        data: {
                          ...state.data,
                          milestoneNumber: event.target.value
                            ? Number(event.target.value)
                            : undefined,
                        },
                        error: null,
                      })
                    }
                  />
                </div>
                <div className='flex flex-col'>
                  <Label htmlFor='launch_project_fundraise_amount'>Fundraise amount (in USD)</Label>
                  <TextInput
                    id='launch_project_fundraise_amount'
                    type='number'
                    value={state.data.fundraiseAmount}
                    className='!py-2'
                    onChange={event =>
                      setState({
                        ...state,
                        data: {
                          ...state.data,
                          fundraiseAmount: event.target.value
                            ? Number(event.target.value)
                            : undefined,
                        },
                        error: null,
                      })
                    }
                  />
                </div>
                <div className='flex flex-col sm:col-span-2'>
                  <Label htmlFor='launch_project_fundraise_deadline'>Fundraise deadline</Label>
                  <TextInput
                    type='datetime-local'
                    id='launch_project_fundraise_deadline'
                    className='!py-2 text-white before:text-white'
                    defaultValue={
                      state.data.fundraiseDeadline
                        ? state.data.fundraiseDeadline.toISOString().slice(0, 19)
                        : undefined
                    }
                    onChange={event =>
                      setState({
                        ...state,
                        data: {
                          ...state.data,
                          fundraiseDeadline: event.target.value
                            ? new Date(event.target.value)
                            : undefined,
                        },
                        error: null,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <hr />
            <div className='flex flex-col mx-10 my-14 text-white'>
              <h3 className='text-2xl mb-5  sm:col-span-2 font-semibold'>Team</h3>
              <div className='flex flex-col items-start'>
                {state.data.team.length > 0 ? (
                  state.data.team.map((member, index) => (
                    <div
                      key={index}
                      className='flex flex-col mb-5 w-full border-gradient-primary p-10 before:rounded-[20px] !text-white'
                    >
                      <div className='flex items-center  justify-between mb-5'>
                        <h4 className='text-xl font-semibold'>Team member {index + 1}</h4>

                        <div>
                          <button
                            className='p-3 rounded-full secondary-red-button aspect-square'
                            type='button'
                            onClick={() =>
                              setState({
                                ...state,
                                data: {
                                  ...state.data,
                                  team: state.data.team.filter(m => m !== member),
                                },
                              })
                            }
                          >
                            <RemoveIcon className='size-7' />
                          </button>
                        </div>
                      </div>
                      <div className='grid grid-cols-[150px_1fr] gap-4 items-center'>
                        {/* <div className='flex flex-col'>
                          {state.data.team[index].image ? (
                            <img
                              src={URL.createObjectURL(state.data.team[index].image!)}
                              alt='Project launch team member image'
                              className='aspect-square rounded-full object-cover'
                            />
                          ) : (
                            <div className='flex items-center justify-center aspect-square rounded-full object-cover bg-neutral-300'>
                              <UserCircleIcon className='stroke-2 size-8 text-neutral-500' />
                            </div>
                          )}
                        </div> */}
                        <div>
                          <Avatar
                            onImageChange={file =>
                              setState({
                                ...state,
                                data: {
                                  ...state.data,
                                  team: state.data.team.map((m, i) =>
                                    i === index ? { ...m, image: file! } : m,
                                  ),
                                },
                              })
                            }
                          />
                        </div>
                        <div className='grid sm:grid-cols-1 gap-4 items-center'>
                          <div className='flex flex-col mb-2'>
                            <Label htmlFor={`launch_project_team_${index}_name`}>Name:</Label>
                            <TextInput
                              id={`launch_project_team_${index}_name`}
                              className='!py-2'
                              defaultValue={member.name}
                              onChange={event =>
                                setState({
                                  ...state,
                                  data: {
                                    ...state.data,
                                    team: state.data.team.map((m, i) =>
                                      i === index
                                        ? {
                                            ...m,
                                            name: event.target.value,
                                          }
                                        : m,
                                    ),
                                  },
                                  error: null,
                                })
                              }
                            />
                          </div>
                          <div className='flex flex-col mb-2'>
                            <Label htmlFor={`launch_project_team_${index}_position`}>
                              Position:
                            </Label>
                            <TextInput
                              id={`launch_project_team_${index}_position`}
                              className='!py-2'
                              defaultValue={member.position}
                              onChange={event =>
                                setState({
                                  ...state,
                                  data: {
                                    ...state.data,
                                    team: state.data.team.map((m, i) =>
                                      i === index
                                        ? {
                                            ...m,
                                            position: event.target.value,
                                          }
                                        : m,
                                    ),
                                  },
                                  error: null,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <div className='grid'>
                        <div className='flex flex-col'>
                          <Label htmlFor={`launch_project_team_${index}_bio`}>Bio:</Label>
                          <TextareaInput
                            id={`launch_project_team_${index}_bio`}
                            className='w-full min-h-[110px] resize-none mt-1 mb-4'
                            defaultValue={member.bio}
                            onChange={value =>
                              setState({
                                ...state,
                                data: {
                                  ...state.data,
                                  team: state.data.team.map((m, i) =>
                                    i === index
                                      ? {
                                          ...m,
                                          bio: value,
                                        }
                                      : m,
                                  ),
                                },
                                error: null,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className='grid grid-cols-[1fr_52px] sm:grid-cols-[1fr_200px_52px] items-end gap-4'>
                        <div className='flex flex-col col-span-2 sm:col-span-1'>
                          <Label htmlFor={`launch_project_team_${index}_linkedIn_url`}>
                            LinkedIn URL:{' '}
                          </Label>
                          <TextInput
                            id={`launch_project_team_${index}_linkedIn_url`}
                            className='!py-2'
                            defaultValue={member.linkedInUrl}
                            onChange={event =>
                              setState({
                                ...state,
                                data: {
                                  ...state.data,
                                  team: state.data.team.map((m, i) =>
                                    i === index
                                      ? {
                                          ...m,
                                          linkedInUrl: event.target.value,
                                        }
                                      : m,
                                  ),
                                },
                                error: null,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <span className='text-stone-500 font-sans'>
                    No team member has been added yet
                  </span>
                )}
                <button
                  className='p-3 secondary-green-button flex items-center gap-2 mt-4'
                  type='button'
                  onClick={() =>
                    setState({
                      ...state,
                      data: {
                        ...state.data,
                        team: [
                          ...state.data.team,
                          {
                            name: undefined,
                            linkedInUrl: undefined,
                            position: undefined,
                            bio: undefined,
                          },
                        ],
                      },
                    })
                  }
                >
                  <div>Add team member</div>
                  <PlusIcon className='stroke-2 size-7' />
                </button>
              </div>
            </div>
            <hr />
            <div className='flex flex-col mx-10 my-14 text-white'>
              <h3 className='text-2xl mb-5  sm:col-span-2 font-semibold'>Documents</h3>
              <div className='flex flex-col items-start'>
                {(state.data.documents?.length ?? 0) > 0 ? (
                  state.data.documents?.map((document, index) => (
                    <div
                      key={index}
                      className='flex bg-grey-tertiary backdrop-blur-xl px-2 py-2 rounded-lg items-center w-full mb-4 text-white'
                    >
                      <div className='me-3'>
                        {document.type.startsWith('image') ? (
                          <ImageIcon className='stroke size-6' />
                        ) : document.type.startsWith('video') ? (
                          <VideoIcon className='stroke size-6' />
                        ) : (
                          <FileIcon className='stroke size-6' />
                        )}
                      </div>
                      <span className='rounded-md text-sm w-full font-sans font-medium'>
                        {document.name}
                      </span>
                      <button
                        type='button'
                        className='p-1.5 secondary-red-button rounded-full ms-2 text-center items-center flex justify-center'
                        onClick={() =>
                          setState({
                            ...state,
                            data: {
                              ...state.data,
                              documents: state.data.documents?.filter((_, i) => index !== i),
                            },
                          })
                        }
                      >
                        <RemoveIcon className='size-5' />
                      </button>
                    </div>
                  ))
                ) : (
                  <span className='text-stone-500'>No project documents has been added yet</span>
                )}
                <label
                  htmlFor='project_launch_documents'
                  className='cursor-pointer mt-5 inline-flex secondary-green-button p-2'
                >
                  Upload files
                </label>
                <input
                  type='file'
                  id='project_launch_documents'
                  name='project-documents'
                  multiple
                  className='hidden'
                  onChange={event =>
                    setState({
                      ...state,
                      data: {
                        ...state.data,
                        documents: [
                          ...(state.data.documents || []),
                          ...Array.from(event.target.files || []),
                        ],
                      },
                    })
                  }
                />
              </div>
            </div>
            <hr />
            <div className='flex flex-col mx-10 my-8 text-white'>
              <h3 className='text-2xl mb-5  sm:col-span-2 font-semibold'>Round details</h3>
              <div className='grid sm:grid-cols-2 gap-8'>
                <div className='flex flex-col'>
                  <Label htmlFor='launch_project_round_details_ticket_size'>Ticket size</Label>
                  <div className='grid grid-cols-[1fr_20px_1fr] gap-1'>
                    <div className='flex'>
                      <TextInput
                        type='number'
                        id='launch_project_round_details_ticket_size_from'
                        className='!p-2'
                        placeholder='From'
                        value={state.data.roundDetails.ticketSize.from}
                        onChange={event =>
                          setState({
                            ...state,
                            data: {
                              ...state.data,
                              roundDetails: {
                                ...state.data.roundDetails,
                                ticketSize: {
                                  ...state.data.roundDetails.ticketSize,
                                  from: event.target.value ? Number(event.target.value) : undefined,
                                },
                              },
                            },
                            error: null,
                          })
                        }
                      />
                    </div>
                    <div className='flex justify-center items-center'>-</div>
                    <div className='flex'>
                      <TextInput
                        type='number'
                        id='launch_project_round_details_ticket_size_to'
                        className='!p-2'
                        placeholder='To'
                        value={state.data.roundDetails.ticketSize.to}
                        onChange={event =>
                          setState({
                            ...state,
                            data: {
                              ...state.data,
                              roundDetails: {
                                ...state.data.roundDetails,
                                ticketSize: {
                                  ...state.data.roundDetails.ticketSize,
                                  to: event.target.value ? Number(event.target.value) : undefined,
                                },
                              },
                            },
                            error: null,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className='flex flex-col'>
                  <Label htmlFor='launch_project_round_details_round'>Round</Label>
                  <SelectInput
                    value={state.data.roundDetails.round}
                    onChange={event =>
                      setState({
                        ...state,
                        data: {
                          ...state.data,
                          roundDetails: {
                            ...state.data.roundDetails,
                            round: event.target.value as 'seed' | 'pre-seed' | 'private',
                          },
                        },
                        error: null,
                      })
                    }
                    options={[
                      {
                        value: 'seed',
                        label: 'Seed',
                      },
                      {
                        value: 'pre-seed',
                        label: 'Pre-seed',
                      },
                      {
                        value: 'private',
                        label: 'Private',
                      },
                    ]}
                  />
                </div>
                <div className='flex flex-col'>
                  <Label htmlFor='launch_project_round_details_deal_structure'>
                    Deal structure
                  </Label>
                  <SelectInput
                    className='outline-none font-[600] text-lg !p-2'
                    value={state.data.roundDetails.dealStructure}
                    onChange={event =>
                      setState({
                        ...state,
                        data: {
                          ...state.data,
                          roundDetails: {
                            ...state.data.roundDetails,
                            dealStructure: event.target.value as 'SAFT' | 'SAFE',
                          },
                        },
                        error: null,
                      })
                    }
                    options={[
                      {
                        value: 'SAFT',
                        label: 'SAFT',
                      },
                      {
                        value: 'SAFE',
                        label: 'SAFE',
                      },
                    ]}
                  />
                </div>
                <div className='flex flex-col'>
                  <Label htmlFor='launch_project_round_details_token_price'>
                    Token price (in USD)(Optional)
                  </Label>
                  <TextInput
                    type='number'
                    id='launch_project_round_details_token_price'
                    className='!p-2'
                    placeholder='0.01'
                    step={0.01}
                    min={0}
                    value={state.data.roundDetails.tokenPrice}
                    onChange={event =>
                      setState({
                        ...state,
                        data: {
                          ...state.data,
                          roundDetails: {
                            ...state.data.roundDetails,
                            tokenPrice: event.target.value ? Number(event.target.value) : undefined,
                          },
                        },
                        error: null,
                      })
                    }
                  />
                </div>
                <div className='flex flex-col'>
                  <Label htmlFor='launch_project_round_details_valuation'>
                    Valuation (in USD)(Optional)
                  </Label>
                  <TextInput
                    type='number'
                    id='launch_project_round_details_valuation'
                    className='!p-2'
                    placeholder='100000'
                    min={0}
                    value={state.data.roundDetails.valuation}
                    onChange={event =>
                      setState({
                        ...state,
                        data: {
                          ...state.data,
                          roundDetails: {
                            ...state.data.roundDetails,
                            valuation: event.target.value ? Number(event.target.value) : undefined,
                          },
                        },
                        error: null,
                      })
                    }
                  />
                </div>
                <div className='flex flex-col'>
                  <Label htmlFor='launch_project_round_details_token_price'>
                    Unlock at TGE (in %)(Optional)
                  </Label>
                  <TextInput
                    type='number'
                    id='launch_project_round_details_unlock_at_tge'
                    className='!p-2'
                    placeholder='5'
                    min={0}
                    value={state.data.roundDetails.unlockAtTGE}
                    onChange={event =>
                      setState({
                        ...state,
                        data: {
                          ...state.data,
                          roundDetails: {
                            ...state.data.roundDetails,
                            unlockAtTGE: event.target.value
                              ? Number(event.target.value)
                              : undefined,
                          },
                        },
                        error: null,
                      })
                    }
                  />
                </div>
                <div className='flex flex-col'>
                  <Label htmlFor='launch_project_round_details_lockup'>
                    Lockup (Months)(Optional)
                  </Label>
                  <TextInput
                    type='number'
                    id='launch_project_round_details_lockup'
                    className='!p-2'
                    placeholder='1'
                    min={0}
                    step={0.5}
                    value={state.data.roundDetails.lockup}
                    onChange={event =>
                      setState({
                        ...state,
                        data: {
                          ...state.data,
                          roundDetails: {
                            ...state.data.roundDetails,
                            lockup: event.target.value ? Number(event.target.value) : undefined,
                          },
                        },
                        error: null,
                      })
                    }
                  />
                </div>
                <div className='flex flex-col'>
                  <Label htmlFor='launch_project_round_details_vesting'>
                    Vesting (Months)(Optional)
                  </Label>
                  <TextInput
                    type='number'
                    id='launch_project_round_details_vesting'
                    className='!p-2'
                    placeholder='1'
                    min={0}
                    step={0.5}
                    value={state.data.roundDetails.vesting}
                    onChange={event =>
                      setState({
                        ...state,
                        data: {
                          ...state.data,
                          roundDetails: {
                            ...state.data.roundDetails,
                            vesting: event.target.value ? Number(event.target.value) : undefined,
                          },
                        },
                        error: null,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div className='mx-10 mb-8'>
              <Button type='submit' className='rounded-2xl w-full font-semibold text-xl'>
                Launch
              </Button>
            </div>
          </form>
          {children}
        </>
      ) : (
        <div className='px-10 py-8 flex flex-col items-center justify-center min-h-[300px] gap-5'>
          <Spinner className='size-12 text-gray-200' />
          <p className='text-center text-white'>
            We are proceeding the creation of project launch. You may need to perform some
            additional steps and it may take some time to process your request
          </p>
        </div>
      )}
    </Modal>
  );
};

export default LaunchProjectModal;
