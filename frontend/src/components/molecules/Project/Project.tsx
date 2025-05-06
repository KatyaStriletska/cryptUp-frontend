import { FC, HTMLAttributes, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppRoutes } from '../../../types/enums/app-routes.enum';
import Button from '../../atoms/Button/Button';
import {
  DotsIcon,
  EditIcon,
  EmptyLogoIcon,
  LockIcon,
  RemoveIcon,
  ShareIcon,
  StarIcon,
} from '../../atoms/Icons/Icons';
import { useOutsideClick } from '../../../hooks/dom.hooks';
import Modal from '../Modal/Modal';
import { useAppDispatch } from '../../../hooks/redux.hooks';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../hooks/auth.hooks';
import { UserRoleEnum } from '../../../types/enums/user-role.enum';
import { ProjectLaunch } from '../../../types/project-launch.types';
import {
  fetchAllProjectLaunches,
  removeProjectLaunch,
} from '../../../redux/slices/project-launch.slice';
import CreateInvestmentModal from '../../organisms/CreateInvestmentModal/CreateInvestmentModal';
import ProjectLaunchInfoModal from '../../organisms/ProjectLaunchInfoModal/ProjectLaunchInfoModal';
import ProgressBar from '../ProgressBar/ProgressBar';
import { resolveImage } from '../../../utils/file.utils';
import ApproveProjectLaunchModal from '../../organisms/ApproveProjectLaunchModal/ApproveProjectLaunchModal';
// import Image from 'components/atoms/Image/Image';
import EditProjectLaunchModal from 'components/organisms/EditProjectLaunchModal/EditProjectLaunchModal';
import Avatar from '../Avatar';
import { AvatarSize } from '../Avatar/Avatar';

export interface ProjectProps extends HTMLAttributes<HTMLDivElement> {
  project: ProjectLaunch;
  variant?: 'extended' | 'short' | 'tiny';
}

export const Project: FC<ProjectProps> = ({
  project: projectLaunch,
  variant = 'extended',
  ...props
}) => {
  const dispatch = useAppDispatch();
  const [isSettingsDropdownVisible, setIsSettingsDropdownVisible] = useState(false);
  const [isRemoveProjectModalVisible, setIsRemoveProjectModalVisible] = useState(false);
  const [isEditProjectModalVisible, setIsEditProjectModalVisible] = useState(false);
  const [isApproveProjectLaunchModalVisible, setIsApproveProjectLaunchModalVisible] =
    useState(false);
  const [
    isCreateProjectLaunchInvestmentModalVisible,
    setIsCreateProjectLaunchInvestmentModalVisible,
  ] = useState(false);
  const [isShowProjectLaunchInfoModalVisible, setIsShowProjectLaunchInfoModalVisible] =
    useState(false);
  const settingsDropdownRef = useOutsideClick(() => setIsSettingsDropdownVisible(false));
  const { authenticatedUser } = useAuth();

  const deleteProject = () => {
    dispatch(
      removeProjectLaunch(projectLaunch.id, {
        onSuccess: () => setIsRemoveProjectModalVisible(false),
      }),
    );
  };

  return (
    <>
      {isRemoveProjectModalVisible &&
        createPortal(
          <Modal
            title='Delete project'
            onClose={() => setIsRemoveProjectModalVisible(false)}
            className='max-w-[596px]'
          >
            <div className='py-7 px-3 flex flex-col'>
              <p className='font-mono text-white'>
                Are you sure you want to delete this project?{' '}
                <span className='font-semibold'>
                  You will not be able to restore the project after performing this operation.
                </span>
              </p>
              <div className='mt-8 flex justify-center items-center gap-4'>
                <Button className='rounded-2xl' onClick={() => deleteProject()}>
                  Delete
                </Button>
                <button
                  type='button'
                  className='secondary-purple-button px-4 py-2 w-36 h-full bg-gradient-white-purple rounded-2xl'
                  onClick={() => setIsRemoveProjectModalVisible(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>,
          document.getElementById('root')!,
        )}
      {isApproveProjectLaunchModalVisible &&
        createPortal(
          <ApproveProjectLaunchModal
            projectLaunch={projectLaunch}
            title={'Approve project launch'}
            onClose={() => setIsApproveProjectLaunchModalVisible(false)}
            onProcess={() => setIsApproveProjectLaunchModalVisible(false)}
          />,
          document.getElementById('root')!,
        )}
      {isCreateProjectLaunchInvestmentModalVisible &&
        createPortal(
          <CreateInvestmentModal
            title='Proceed with investment'
            onClose={() => setIsCreateProjectLaunchInvestmentModalVisible(false)}
            onProcess={() => {
              dispatch(
                fetchAllProjectLaunches({
                  where: { approver: { id: { not: null } } },
                  relations: { project: true },
                }),
              );
              setIsCreateProjectLaunchInvestmentModalVisible(false);
            }}
            projectLaunch={projectLaunch}
          />,
          document.getElementById('root')!,
        )}
      {isShowProjectLaunchInfoModalVisible &&
        createPortal(
          <ProjectLaunchInfoModal
            title='Project launch info'
            onClose={() => setIsShowProjectLaunchInfoModalVisible(false)}
            projectLaunch={projectLaunch}
            setIsCreateProjectLaunchInvestmentModalVisible={
              setIsCreateProjectLaunchInvestmentModalVisible
            }
          />,
          document.getElementById('root')!,
        )}
      {isEditProjectModalVisible &&
        createPortal(
          <EditProjectLaunchModal
            title='Edit project launch'
            onClose={() => setIsEditProjectModalVisible(false)}
            onProcess={() => setIsEditProjectModalVisible(false)}
            projectLaunch={projectLaunch}
          />,
          document.getElementById('root')!,
        )}
      <div
        className='flex flex-col justify-between items-start bg-gradient-white-purple py-7 px-14 rounded-xl'
        {...props}
      >
        <div className='flex flex-col w-full flex-1'>
          <div className='flex justify-between items-start pb-5'>
            <div className='flex w-full'>
              <Avatar
                isEditable={false}
                src={projectLaunch.logo ? resolveImage(projectLaunch.logo) : undefined}
                avatarSize={variant === 'tiny' ? AvatarSize.Medium : AvatarSize.Large}
              />
              {/* <Image
                src={projectLaunch.logo ? resolveImage(projectLaunch.logo) : undefined}
                emptySrcFallback={
                  <div
                    className={`${variant === 'tiny' ? 'max-w-[3.7em]' : 'max-w-[6em]'} w-full aspect-square rounded-xl object-cover border bg-stone-200 flex items-center justify-center`}
                  >
                    <EmptyLogoIcon className='size-8' />
                  </div>
                }
                className={`${variant === 'tiny' ? 'max-w-[3.7em]' : 'max-w-[6em]'} w-full aspect-square rounded-xl object-cover border`}
              /> */}
              <div
                className={`flex self-center flex-col w-full ${variant === 'tiny' ? 'ms-3' : 'ms-5'}`}
              >
                <h4
                  className={`text-white font-semibold ${variant === 'tiny' ? 'text-lg' : 'text-2xl'}`}
                >
                  {projectLaunch.name}
                </h4>
                {variant !== 'extended' && (
                  <div className={`flex items-center ${variant === 'tiny' ? '' : 'mt-3 gap-1.5'}`}>
                    {projectLaunch.approver !== null && !projectLaunch.isFundraised ? (
                      <span className='font-medium text-white bg-red rounded-full text-xs bg-blue-500 px-2 py-0.5'>
                        Approved
                      </span>
                    ) : projectLaunch.approver !== null &&
                      projectLaunch.isFundraised &&
                      projectLaunch.project?.isFinal ? (
                      <span className='font-medium text-white bg-red rounded-full text-xs bg-emerald-500 px-2 py-0.5'>
                        Submitted
                      </span>
                    ) : projectLaunch.approver !== null && projectLaunch.isFundraised ? (
                      <span className='whitespace-nowrap font-medium text-white bg-red rounded-full text-xs bg-orange-500 px-2 py-0.5'>
                        Funds raised
                      </span>
                    ) : (
                      <span className='whitespace-nowrap font-medium text-white bg-red rounded-full text-xs bg-slate-500 px-2 py-0.5'>
                        Under review
                      </span>
                    )}
                    <button
                      type='button'
                      className={`h-full rounded-full transition-all duration-300 aspect-square w-[32px] inline-flex items-center justify-center hover:text-green-primary text-white ${variant === 'tiny' ? 'w-[26px] ms-1' : 'w-[32px] ms-2'} inline-flex items-center justify-center`}
                    >
                      <StarIcon className={variant === 'tiny' ? 'size-5' : 'size-6'} />
                    </button>
                    <button
                      type='button'
                      className={`h-full rounded-full transition-all duration-300 aspect-square w-[32px] inline-flex items-center justify-center hover:text-green-primary text-white ${variant === 'tiny' ? 'w-[26px]' : 'w-[32px]'} inline-flex items-center justify-center`}
                    >
                      <ShareIcon className={variant === 'tiny' ? 'size-4' : 'size-5'} />
                    </button>
                    {authenticatedUser?.id ===
                      (projectLaunch.author?.id ?? projectLaunch.authorId ?? '') &&
                      authenticatedUser.role.includes(UserRoleEnum.Startup) && (
                        <div className='relative'>
                          <button
                            className='h-full rounded-full aspect-square w-[32px] hover:text-green-primary text-white transition-all  duration-300 inline-flex items-center justify-center'
                            onClick={() => setIsSettingsDropdownVisible(true)}
                          >
                            <DotsIcon className='size-7' />
                          </button>
                          {isSettingsDropdownVisible && (
                            <div
                              ref={settingsDropdownRef}
                              className='absolute backdrop-blur-xl bg-grey-primary  mt-1 right-0 shadow p-1 rounded-md flex flex-col z-50 text-white'
                            >
                              <button
                                className='inline-flex items-center hover:bg-grey-primary px-2 py-1 rounded-md font-medium'
                                onClick={() => {
                                  setIsRemoveProjectModalVisible(true);
                                  setIsSettingsDropdownVisible(false);
                                }}
                              >
                                <RemoveIcon className='size-4 me-2' />
                                Remove
                              </button>
                              {!projectLaunch.isFundraised && (
                                <button
                                  className='inline-flex items-center hover:bg-grey-primary px-2 py-1 rounded-md font-medium'
                                  onClick={() => {
                                    setIsEditProjectModalVisible(true);
                                    setIsSettingsDropdownVisible(false);
                                  }}
                                >
                                  <EditIcon className='size-4 me-2' />
                                  Edit
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                )}
              </div>
              {variant !== 'extended' && (
                <div className='grid auto-cols-max gap-2 items-start'>
                  {projectLaunch.isFundraised &&
                    projectLaunch.approver !== null &&
                     (
                      <Link
                        to={AppRoutes.DetailsProject.replace(':id', projectLaunch.project!.id)}
                        className={`inline-flex text-center justify-center items-center font-medium font-sans hover:border-transparent hover:bg-zinc-900 bg-transparent border-2 border-zinc-900 text-zinc-900 hover:text-white transition-all duration-300 rounded-full ${variant === 'tiny' ? 'text-sm px-4 py-0.5' : 'text-lg px-10 py-1'}`}
                      >
                        Details
                      </Link>
                    )}
                  <Button
                    className={`inline-flex text-center justify-center items-center font-medium text-white  rounded-full ${variant === 'tiny' ? 'text-sm px-2 py-0.5' : 'text-lg px-10 py-1'}`}
                    onClick={() => setIsShowProjectLaunchInfoModalVisible(true)}
                  >
                    Launch info
                  </Button>
                  {!projectLaunch.isFundraised && (
                    <>
                      {!projectLaunch.approver &&
                        authenticatedUser?.role.find(
                          role => role === UserRoleEnum.BusinessAnalyst,
                        ) && (
                          <Button
                            className={`rounded-full ${variant === 'tiny' ? 'text-sm px-4 py-0.5' : 'text-lg px-10 py-1'}`}
                            onClick={() => setIsApproveProjectLaunchModalVisible(true)}
                          >
                            Approve
                          </Button>
                        )}
                      {authenticatedUser?.role.find(
                        role => role === UserRoleEnum.Investor || role === UserRoleEnum.Startup,
                      ) &&
                        projectLaunch.approver !== null && (
                          <div className='inline-flex mt-4 w-full'>
                            <div className='group/invest-button relative h-auto w-full'>
                              <Button
                                disabled={!projectLaunch.dao}
                                className='inline-flex text-center items-center gap-2 font-medium justify-center text-white px-5 py-2 rounded-full w-full h-full text-lg disabled:cursor-pointer'
                                onClick={() => setIsCreateProjectLaunchInvestmentModalVisible(true)}
                              >
                                {!projectLaunch.dao && <LockIcon className='size-5 stroke-2' />}{' '}
                                Invest Now
                              </Button>
                              {!projectLaunch.dao && (
                                <div className='group-hover/invest-button:flex hidden absolute w-[115%] z-50 bg-[#4f16b4] group-hover:!opacity-80  rounded-xl text-gray-300 text-xs bottom-full mb-3 shadow-[0_0_15px_-7px_grey] p-2 before:content-[""] before:flex before:w-[16px] before:aspect-square before:bg-[#4f16b4] before:shadow-[0_0_30px_-15px_grey] before:absolute before:rotate-45 before:top-full before:-translate-y-[80%] before:-z-50 before:left-1/2 before:-translate-x-1/2'>
                                  The investment opportunity is temporarily unavailable due to the
                                  creation of a DAO for this project on Solana Blockchain. Please
                                  try again later
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                    </>
                  )}
                </div>
              )}
            </div>
            {variant === 'extended' && (
              <div className='flex items-center gap-1.5'>
                {projectLaunch.approver !== null && !projectLaunch.isFundraised ? (
                  <span className='font-medium text-white bg-red rounded-full text-xs bg-blue-500 px-2 py-0.5'>
                    Approved
                  </span>
                ) : projectLaunch.approver !== null &&
                  projectLaunch.isFundraised &&
                  projectLaunch.project?.isFinal ? (
                  <span className='font-medium text-white bg-red rounded-full text-xs bg-emerald-500 px-2 py-0.5'>
                    Submitted
                  </span>
                ) : projectLaunch.approver !== null && projectLaunch.isFundraised ? (
                  <span className='whitespace-nowrap font-medium text-white bg-red rounded-full text-xs bg-orange-500 px-2 py-0.5'>
                    Funds raised
                  </span>
                ) : (
                  <span className='whitespace-nowrap font-medium text-white bg-red rounded-full text-xs bg-slate-600 px-2 py-0.5'>
                    Under review
                  </span>
                )}
                <button
                  type='button'
                  className='ms-2 h-full rounded-full transition-all duration-300 aspect-square w-[32px] inline-flex items-center justify-center hover:text-green-primary text-white'
                >
                  <StarIcon className='size-6' />
                </button>
                <button
                  type='button'
                  className='rounded-full transition-all duration-300 aspect-square w-[32px] inline-flex items-center justify-center hover:text-green-primary text-white'
                >
                  <ShareIcon className='size-6' />
                </button>
                {authenticatedUser?.id ===
                  (projectLaunch.author?.id ?? projectLaunch.authorId ?? '') &&
                  authenticatedUser.role.includes(UserRoleEnum.Startup) && (
                    <div className='relative'>
                      <button
                        className='transition-all duration-300 inline-flex items-center justify-center hover:text-green-primary text-white'
                        onClick={() => setIsSettingsDropdownVisible(true)}
                      >
                        <DotsIcon className='size-7' />
                      </button>
                      {isSettingsDropdownVisible && (
                        <div
                          ref={settingsDropdownRef}
                          className='absolute backdrop-blur-xl bg-grey-primary  mt-1 right-0 shadow p-1 rounded-md flex flex-col z-50 text-white'
                        >
                          <button
                            className='inline-flex items-center hover:bg-grey-primary px-2 py-1 rounded-md font-medium'
                            onClick={() => {
                              setIsRemoveProjectModalVisible(true);
                              setIsSettingsDropdownVisible(false);
                            }}
                          >
                            <RemoveIcon className='size-4 me-2' />
                            Remove
                          </button>
                          {!projectLaunch.isFundraised && (
                            <button
                              className='inline-flex items-center hover:bg-grey-primary px-2 py-1 rounded-md font-medium'
                              onClick={() => {
                                setIsEditProjectModalVisible(true);
                                setIsSettingsDropdownVisible(false);
                              }}
                            >
                              <EditIcon className='size-4 me-2' />
                              Edit
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
              </div>
            )}
          </div>
          {variant === 'extended' && (
            <>
              <hr />
              <div className='py-5 text-white flex flex-1 whitespace-pre-wrap'>
                {projectLaunch.description}
              </div>
              <hr />
              {/* TODO: Replace hidden to grid when partners logic will be implemented */}
              <div className='hidden sm:grid-cols-2 md:grid-cols-3 gap-4 mt-5'>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className='border rounded p-5 relative'>
                    <div className='w-full h-[40px] rounded bg-neutral-200 mb-3 flex justify-center items-center'>
                      <EmptyLogoIcon className='size-5 text-neutral-400' />
                    </div>
                    <h4 className='font-sans font-bold text-xs'>Mocked Technology partner</h4>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className={`${variant === 'tiny' ? '' : 'py-5'} flex`}>
            <ProgressBar
              variant={variant === 'tiny' || variant === 'extended' ? variant : undefined}
              className='w-full'
              progress={projectLaunch.fundraiseProgress}
              goal={projectLaunch.fundraiseAmount}
              deadline={new Date(projectLaunch.fundraiseDeadline)}
            />
          </div>
        </div>
        {variant === 'extended' && (
          <div className='grid w-full gap-6 grid-flow-col auto-cols-fr'>
            {
              projectLaunch.approver !== null &&
              (
                <Link
                  to={AppRoutes.DetailsProject.replace(':id', projectLaunch.project!.id)}
                  className='inline-flex justify-center items-center text-white bg-primary-gradient bg-[length:200%_200%] bg-[0%_0%] hover:bg-[100%_100%] font-mono transition-all duration-1000 px-10 py-3 text-lg rounded-full'
                >
                  Details
                </Link>
              )}
            <Button
              className='rounded-full'
              onClick={() => setIsShowProjectLaunchInfoModalVisible(true)}
            >
              Launch info
            </Button>
            {!projectLaunch.isFundraised && (
              <>
                {!projectLaunch.approver &&
                  authenticatedUser?.role.find(role => role === UserRoleEnum.BusinessAnalyst) && (
                    <Button
                      className='rounded-full'
                      onClick={() => setIsApproveProjectLaunchModalVisible(true)}
                    >
                      Approve
                    </Button>
                  )}
                {authenticatedUser?.role.find(
                  role => role === UserRoleEnum.Investor || role === UserRoleEnum.Startup,
                ) &&
                  projectLaunch.approver !== null && (
                    <div className='inline-flex h-full'>
                      <div className='group/invest-button relative h-auto w-full'>
                        <Button
                          disabled={!projectLaunch.dao}
                          className='w-full inline-flex text-center items-center gap-2 font-medium justify-center text-white px-5 py-2 rounded-full h-full text-lg disabled:cursor-pointer'
                          onClick={() => setIsCreateProjectLaunchInvestmentModalVisible(true)}
                        >
                          {!projectLaunch.dao && <LockIcon className='size-5 stroke-2' />} Invest
                          Now
                        </Button>
                        {!projectLaunch.dao && (
                          <div className='group-hover/invest-button:flex hidden absolute w-[115%] z-50 bg-[#4f16b4] group-hover:!opacity-80  rounded-xl text-gray-300 text-xs bottom-full mb-3 shadow-[0_0_15px_-7px_grey] p-2 before:content-[""] before:flex before:w-[16px] before:aspect-square before:bg-[#4f16b4] before:shadow-[0_0_30px_-15px_grey] before:absolute before:rotate-45 before:top-full before:-translate-y-[80%] before:-z-50 before:left-1/2 before:-translate-x-1/2'>
                            The investment opportunity is temporarily unavailable due to the
                            creation of a DAO for this project on Solana Blockchain. Please try
                            again later
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};
