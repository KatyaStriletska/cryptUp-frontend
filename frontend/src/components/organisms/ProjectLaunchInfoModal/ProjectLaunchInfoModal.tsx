import { FC, useEffect, useState } from 'react';
import Modal, { ModalProps } from '../../molecules/Modal/Modal';
import { ProjectLaunch } from '../../../types/project-launch.types';
import Button from '../../atoms/Button/Button';
import axios, { HttpStatusCode } from 'axios';
import {
  EmptyLogoIcon,
  FileIcon,
  ImageIcon,
  LinkedInIcon,
  LockIcon,
  PlanetIcon,
  ShareIcon,
  StarIcon,
  UserIcon,
  VideoIcon,
} from '../../atoms/Icons/Icons';
import { Link } from 'react-router-dom';
import { resolveImage } from '../../../utils/file.utils';
import ProgressBar from '../../molecules/ProgressBar/ProgressBar';
import { AppRoutes } from '../../../types/enums/app-routes.enum';
import Avatar from 'components/molecules/Avatar';
import { AvatarSize } from 'components/molecules/Avatar/Avatar';

export interface ProjectLaunchInfoModalProps extends ModalProps {
  projectLaunch: ProjectLaunch;
  setIsCreateProjectLaunchInvestmentModalVisible: (...args: any[]) => any;
}

const ProjectLaunchInfoModal: FC<ProjectLaunchInfoModalProps> = ({
  projectLaunch,
  title,
  onClose,
  children,
  setIsCreateProjectLaunchInvestmentModalVisible,
}) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [projectDocuments, setProjectDocuments] = useState<(File | undefined)[]>([]);
  console.log('projectLaunch', projectLaunch)
  const projectLaunchTeam =
    typeof projectLaunch?.team === 'string'
      ? JSON.parse(projectLaunch?.team || '[]')
      : projectLaunch?.team || [];

  useEffect(() => {
    const interval = setInterval(() => {
      const difference = Math.max(
        0,
        new Date(projectLaunch.fundraiseDeadline).getTime() - Date.now(),
      );
      setTimeLeft({
        days: Math.floor(difference / (24 * 60 * 60 * 1000)),
        hours: Math.floor((difference % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)),
        minutes: Math.floor((difference % (60 * 60 * 1000)) / (60 * 1000)),
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const request = async () => {
      setProjectDocuments(
        await Promise.all(
          projectLaunch.projectDocuments.map(document =>
            axios
              .get(`file?file=${document}`, {
                responseType: 'blob',
              })
              .then(response => {
                if (response.status === HttpStatusCode.Ok) {
                  return new File([response.data], document, response.data);
                }
              }),
          ),
        ),
      );
    };

    request().catch(console.log);
  }, []);

  return (
    <Modal title={title} onClose={onClose} className='max-w-[1124px] max-h-[90%]'>
      <div className='px-10 pt-4 pb-8 text-white'>
        <div className='flex justify-end gap-3 mb-4'>
          <button type='button' className='hover:text-green-primary transition-all duration-300'>
            <StarIcon className='size-6' />
          </button>
          <button type='button' className='hover:text-green-primary transition-all duration-300'>
            <ShareIcon className='size-6' />
          </button>
        </div>
        <div className='grid md:grid-cols-2 gap-5'>
          <div className='flex flex-col flex-1 justify-between'>
            <div className='flex flex-col'>
              <div className='flex items-center mb-5'>
                <Avatar
                  src={projectLaunch.logo ? resolveImage(projectLaunch.logo) : undefined}
                  isEditable={false}
                />
                {/* <Image
                  src={projectLaunch.logo ? resolveImage(projectLaunch.logo) : undefined}
                  emptySrcFallback={
                    <div className='w-[6em] aspect-square rounded-xl object-cover bg-stone-200 flex items-center justify-center'>
                      <EmptyLogoIcon className='size-8' />
                    </div>
                  }
                  className='w-[6em] aspect-square rounded-xl object-cover'
                /> */}
                <div className='flex flex-col ms-5'>
                  <h4 className='font-medium text-2xl '>{projectLaunch.name}</h4>
                </div>
              </div>
              {!projectLaunch.isFundraised ? (
                <>
                  <div className='space-y-2'>
                    <div className='space-x-2'>
                      <span className='font-bold  text-lg mt-[5px]'>Time left:</span>
                      <span className='font-medium text-lg'>
                        {timeLeft.days < 10 && '0'}
                        {timeLeft.days}d • {timeLeft.hours < 10 && '0'}
                        {timeLeft.hours}h • {timeLeft.minutes < 10 && '0'}
                        {timeLeft.minutes}m
                      </span>
                    </div>
                    <div className='space-x-2'>
                      <span className='font-bold  text-lg mt-[5px]'>Imported from Ideaforge:</span>
                      <span className='font-medium text-lg'>
                        {projectLaunch.externalId ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                  {projectLaunch.approver && !projectLaunch.isFundraised && (
                    <div className='inline-flex mt-4'>
                      <div className='group/invest-button relative h-auto'>
                        <Button
                          disabled={!projectLaunch.dao}
                          className='inline-flex text-center items-center gap-2 font-medium justify-center text-white px-5 py-2 rounded-full max-w-[260px] text-lg disabled:cursor-pointer'
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
              ) : (
                <span className='text-gray-500 text-sm font-mono'>
                  The money for this project has already been raised
                </span>
              )}
            </div>
            <div className='grid min-[568px]:grid-cols-2 gap-2 mt-5'>
              <Link
                to={AppRoutes.DetailsUser.replace(':id', projectLaunch.author.id)}
                className='inline-flex before:rounded-xl border-gradient-primary items-center p-2 rounded-xl transition-all duration-300 hover:bg-grey-tertiary'
              >
                {projectLaunch.author.avatar ? (
                  <img
                    src={resolveImage(projectLaunch.author.avatar)}
                    alt='User profile image'
                    className='w-[48px] rounded-full aspect-square object-cover'
                  />
                ) : (
                  <div className='inline-flex items-center justify-center bg-gray-300 w-[48px] rounded-full aspect-square'>
                    <UserIcon className='size-8' />
                  </div>
                )}
                <div className='inline-flex flex-col ms-2 truncate'>
                  <span className=' font-semibold text-white truncate'>
                    {projectLaunch.author.username}
                  </span>
                  {(projectLaunch.author.firstName || projectLaunch.author.lastName) && (
                    <span className='text-xs font-bold  text-nowrap text-gray-300'>
                      (
                      {[projectLaunch.author.firstName, projectLaunch.author.lastName]
                        .filter(item => item)
                        .join(' ')}
                      )
                    </span>
                  )}
                  <span className='text-gray-300 text-xs mt-1'>Author</span>
                </div>
              </Link>
              {projectLaunch.approver ? (
                <Link
                  to={AppRoutes.DetailsUser.replace(':id', projectLaunch.approver.id)}
                  className='inline-flex before:rounded-xl border-gradient-primary items-center p-2 rounded-xl transition-all duration-300 hover:bg-grey-tertiary'
                >
                  {projectLaunch.approver.avatar ? (
                    <img
                      src={resolveImage(projectLaunch.approver.avatar)}
                      alt='User profile image'
                      className='w-[48px] rounded-full aspect-square object-cover'
                    />
                  ) : (
                    <div className='inline-flex items-center justify-center bg-gray-300 w-[48px] rounded-full aspect-square'>
                      <UserIcon className='size-8' />
                    </div>
                  )}
                  <div className='inline-flex flex-col ms-2 text-white'>
                    <span className=' font-semibold truncate'>
                      {projectLaunch.approver.username}
                    </span>
                    {(projectLaunch.approver.firstName || projectLaunch.approver.lastName) && (
                      <span className='text-xs font-bold  text-nowrap text-white'>
                        (
                        {[projectLaunch.approver.firstName, projectLaunch.approver.lastName]
                          .filter(item => item)
                          .join(' ')}
                        )
                      </span>
                    )}
                    <span className='font-mono text-gray-300 text-xs mt-1'>Approver BA</span>
                  </div>
                </Link>
              ) : (
                <div className='rounded-xl border-2 border-dashed inline-flex items-center justify-center px-5 font-semibold text-slate-300 border-slate-200'>
                  <span className='font-mono text-xs text-center'>
                    Here will be shown business analyst who approved project launch
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className='flex flex-col h-full flex-1 justify-between'>
            <div className='border-gradient-primary before:rounded-2xl text-white mb-5 font-medium rounded-lg px-8 py-5 w-full flex flex-col text-lg gap-y-2'>
              <div className='grid grid-cols-[1fr_130px]'>
                <span className='font-mono'>Deal structure</span>
                <span>Token</span>
              </div>
              <div className='grid grid-cols-[1fr_130px]'>
                <span className='font-mono'>Funding goal</span>
                <span>
                  <span className='me-[2px]'>$</span>
                  {Number(projectLaunch.fundraiseAmount).toLocaleString('uk')}
                </span>
              </div>
              <div className='grid grid-cols-[1fr_130px]'>
                <div className='font-mono'>Round name</div>
                <span>{JSON.parse(projectLaunch.roundDetails).round} round</span>
              </div>
              <div className='grid grid-cols-[1fr_130px]'>
                <div className='w-1/2 font-mono'>Valuation</div>
                <span>
                  <span className='me-[2px]'>$</span>
                  {Number(JSON.parse(projectLaunch.roundDetails).valuation).toLocaleString('uk')}
                </span>
              </div>
            </div>
            <ProgressBar
              progress={projectLaunch.fundraiseProgress}
              goal={projectLaunch.fundraiseAmount}
              deadline={projectLaunch.fundraiseDeadline}
              variant='tiny'
            />
          </div>
        </div>
        {/* TODO: Replace hidden to grid when partners logic will be implemented */}
        <h3 className='hidden font-serif font-semibold text-2xl my-10'>Backers & Partners</h3>
        <div className='hidden sm:grid-cols-2 md:grid-cols-3 gap-4'>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className='border rounded-2xl p-5 text-sm relative'>
              <div className='w-3/4 h-[40px] rounded-lg bg-neutral-200 mb-3 flex justify-center items-center'>
                <EmptyLogoIcon className='size-5 text-neutral-400' />
              </div>
              <h4 className=' font-bold'>Partner name</h4>
              <p className=' leading-5 mt-1'>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              </p>
              <Link to='https://google.com' className='absolute top-2 right-2'>
                <PlanetIcon className='size-5 text-neutral-600' />
              </Link>
            </div>
          ))}
        </div>
        <h3 className='font-semibold text-2xl my-10'>Description</h3>
        <div className='mb-10'>
          <p className='font-serif whitespace-pre-wrap'>{projectLaunch.description}</p>
        </div>
        <hr />
        <h3 className='font-semibold text-2xl my-10'>3x Capital Review</h3>
        <div className='mb-10'>
          {projectLaunch.businessAnalystReview ? (
            <p className='font-serif whitespace-pre-wrap'>{projectLaunch.businessAnalystReview}</p>
          ) : (
            <p className='font-mono text-gray-300 text-base'>
              Business analyst has not given the review for this project launch yet
            </p>
          )}
        </div>
        <hr />
        <h3 className='text-2xl my-10 font-semibold'>Team</h3>
        <div className='mb-10'>
          <div className='grid sm:grid-cols-2 md:grid-cols-3 gap-3'>
            {!projectLaunch.team?.length ? (
              <span className='text-base text-gray-300 col-span-2 font-mono'>
                No information about team members was added for this project
              </span>
            ) : (
              projectLaunchTeam.map((member: any, index: number) => (
                <div
                  className='border-gradient-primary before:rounded-xl text-white rounded-2xl p-3 flex justify-start items-start relative'
                  key={index}
                >
                  <Link to={member.linkedInUrl} className='absolute top-2 right-4'>
                    <LinkedInIcon className='size-4 text-gray-200 hover:text-green-primary transition-all duration-300' />
                  </Link>
                  <Avatar
                    usersAvatar
                    avatarSize={AvatarSize.Medium}
                    src={member.image ? resolveImage(member.image) : undefined}
                    isEditable={false}
                  />
                  <div className='flex flex-col flex-1 text-start ml-4'>
                    <h5 className='font-bold'>{member.name}</h5>
                    <p className='font-semibold text-sm'>{member.position}</p>
                    <hr className='border-b border-white h-full w-0 my-0.5' />
                    <p className='text-xs whitespace-pre-wrap'>{member.bio}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <hr />
        <h3 className='font-semibold text-2xl my-10'>Data room</h3>
        <div className='mb-10'>
          {!projectLaunch.projectDocuments?.length && (
            <span className='text-base text-gray-300 font-mono'>
              No documents have been added for this project.
            </span>
          )}
          <div className='grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-8'>
            {projectDocuments.map((file, index) => (
              <div className='flex flex-col' key={index}>
                <div
                  className='border border-zinc-900 p-2 rounded-xl cursor-pointer hover:bg-slate-100 mb-2 aspect-square flex items-center justify-center'
                  onClick={async () => {
                    if (file) {
                      const url = window.URL.createObjectURL(file);
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute(
                        'download',
                        file?.name.split('/')[file?.name.split('/').length - 1],
                      );

                      document.body.appendChild(link);
                      link.click();
                      if (link.parentNode) {
                        link.parentNode.removeChild(link);
                      }
                    }
                  }}
                >
                  {file?.type.startsWith('image') ? (
                    <ImageIcon className='stroke size-10' />
                  ) : file?.type.startsWith('video') ? (
                    <VideoIcon className='stroke size-10' />
                  ) : (
                    <FileIcon className='stroke size-10' />
                  )}
                </div>
                <span className='text-center break-all'>
                  {file?.name.split('/')[file?.name.split('/').length - 1]}
                </span>
              </div>
            ))}
          </div>
        </div>
        <hr />
        <h3 className='font-semibold text-2xl my-10'>Business model</h3>
        <div className='mb-10'>
          <p className='font-serif whitespace-pre-wrap'>{projectLaunch.businessModel}</p>
        </div>
        <hr />
        <h3 className='font-semibold text-2xl my-10'>Tokenomics</h3>
        <div className='mb-10'>
          <p className='font-serif whitespace-pre-wrap'>{projectLaunch.tokenomics}</p>
        </div>
        <hr />
        <div>
          <h3 className='font-bold text-xl mb-5 mt-5'>Round details</h3>
          <div className='grid md:grid-cols-2'>
            <div className='px-10 py-5 font-medium rounded-lg border-gradient-primary before:rounded-xl text-white'>
              <div className='flex'>
                <div className='w-1/2'>Ticket size: </div>
                <div className='w-1/2 text-end'>
                  <span>
                    <span className='me-[2px]'>$</span>
                    {Number(JSON.parse(projectLaunch.roundDetails).ticketSize.from).toLocaleString(
                      'uk',
                    )}
                  </span>{' '}
                  -{' '}
                  <span>
                    <span className='me-[2px]'>$</span>
                    {Number(JSON.parse(projectLaunch.roundDetails).ticketSize.to).toLocaleString(
                      'uk',
                    )}
                  </span>
                </div>
              </div>
              <div className='flex'>
                <div className='w-1/2'>Round: </div>
                <div className='w-1/2 text-end'>{JSON.parse(projectLaunch.roundDetails).round}</div>
              </div>
              <div className='flex'>
                <div className='w-1/2'>Deal structure: </div>
                <div className='w-1/2 text-end'>
                  {JSON.parse(projectLaunch.roundDetails).dealStructure}
                </div>
              </div>
              <div className='flex'>
                <div className='w-1/2'>Token price</div>
                <div className='w-1/2 text-end'>
                  <span>
                    {JSON.parse(projectLaunch.roundDetails).tokenPrice ? (
                      <>
                        <span className='me-[2px]'>$</span>
                        {Number(JSON.parse(projectLaunch.roundDetails).tokenPrice).toLocaleString(
                          'uk',
                        )}
                      </>
                    ) : (
                      '—'
                    )}
                  </span>
                </div>
              </div>
              <div className='flex'>
                <div className='w-1/2'>Valuation</div>
                <div className='w-1/2 text-end'>
                  <span>
                    {JSON.parse(projectLaunch.roundDetails).valuation ? (
                      <>
                        <span className='me-[2px]'>$</span>
                        {Number(JSON.parse(projectLaunch.roundDetails).valuation).toLocaleString(
                          'uk',
                        )}
                      </>
                    ) : (
                      '—'
                    )}
                  </span>
                </div>
              </div>
              <div className='flex'>
                <div className='w-1/2'>Unlock at TGE: </div>
                <div className='w-1/2 text-end'>
                  {JSON.parse(projectLaunch.roundDetails).unlockAtTGE
                    ? `${Number(JSON.parse(projectLaunch.roundDetails).unlockAtTGE).toLocaleString('uk')} %`
                    : '—'}
                </div>
              </div>
              <div className='flex'>
                <div className='w-1/2'>Lockup: </div>
                <div className='w-1/2 text-end'>
                  {JSON.parse(projectLaunch.roundDetails).lockup
                    ? `${Number(JSON.parse(projectLaunch.roundDetails).lockup).toLocaleString('uk')} months`
                    : '—'}
                </div>
              </div>
              <div className='flex'>
                <div className='w-1/2'>Vesting: </div>
                <div className='w-1/2 text-end'>
                  {JSON.parse(projectLaunch.roundDetails).vesting
                    ? `${Number(JSON.parse(projectLaunch.roundDetails).vesting).toLocaleString('uk')} months`
                    : '—'}
                </div>
              </div>
            </div>
            <div className='flex flex-col items-end justify-end'>
              {!projectLaunch.isFundraised && (
                <>
                  {projectLaunch.approver && !projectLaunch.isFundraised && (
                    <div className='inline-flex mt-4'>
                      <div className='group/invest-button relative h-auto'>
                        <Button
                          disabled={!projectLaunch.dao}
                          className='inline-flex text-center items-center gap-2 font-medium justify-center text-white px-5 py-2 rounded-full max-w-[260px] text-lg disabled:cursor-pointer'
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
                  <div className='flex gap-2 mt-5'>
                    <span className='font-bold text-xl'>Time left:</span>
                    <span className='font-medium text-xl'>
                      {timeLeft.days < 10 && '0'}
                      {timeLeft.days}d • {timeLeft.hours < 10 && '0'}
                      {timeLeft.hours}h • {timeLeft.minutes < 10 && '0'}
                      {timeLeft.minutes}m
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {children}
    </Modal>
  );
};

export default ProjectLaunchInfoModal;
