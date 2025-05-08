import { FC, useEffect, useState } from 'react';
import { ProjectGrid } from '../../components/organisms/ProjectGrid/ProjectGrid';
import { createPortal } from 'react-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.hooks';
import Button from '../../components/atoms/Button/Button';
import { useAuth } from '../../hooks/auth.hooks';
import { UserRoleEnum } from '../../types/enums/user-role.enum';
import {
  fetchAllProjectLaunches,
  selectProjectLaunches,
} from '../../redux/slices/project-launch.slice';
import LaunchProjectModal from '../../components/organisms/LaunchProjectModal/LaunchProjectModal';
import Spinner from 'components/atoms/Spinner/Spinner';
import Title from 'components/atoms/Title';
import { PlusIcon } from 'components/atoms/Icons/Icons';
import { useSearchParams } from 'react-router-dom';
import ConnectWalletModal from 'components/organisms/ConnectWalletModal/ConnectWalletModal';
import cookies from 'js-cookie';

const ProjectsPage: FC = () => {
  const dispatch = useAppDispatch();
  const projects = useAppSelector(selectProjectLaunches);
  const [isLaunchProjectModalVisible, setIsLaunchProjectModalVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { authenticatedUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isConnectWalletModalVisible, setConnectWalletModalVisible] = useState<boolean>(false);
  const migratedFromForgeParamName = 'migratedFromForge';

  const checkMigrateLogic = () => {
    if (searchParams.get(migratedFromForgeParamName)) {
      const projectCookieName = 'project-to-migrate';
      const projectDataCookie = cookies.get(projectCookieName) || '';
      if (!authenticatedUser?.walletId) {
        setConnectWalletModalVisible(true);
      } else if (projectDataCookie) {
        const projectDataAsObject = JSON.parse(projectDataCookie);

        if (projects.every(project => project.externalId !== projectDataAsObject.id)) {
          setIsLaunchProjectModalVisible(true);
        }
      }
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    if (authenticatedUser) {
      if (authenticatedUser.role.includes(UserRoleEnum.BusinessAnalyst)) {
        dispatch(
          fetchAllProjectLaunches(
            {},
            { onError: () => setIsLoaded(true), onSuccess: () => setIsLoaded(true) },
          ),
        );
      } else {
        dispatch(
          fetchAllProjectLaunches(
            { where: { approver: { id: { not: null } } }, relations: { project: true } },
            { onError: () => setIsLoaded(true), onSuccess: () => setIsLoaded(true) },
          ),
        );
      }
    }
  }, [authenticatedUser]);

  useEffect(() => {
    if (authenticatedUser && isLoaded) {
      checkMigrateLogic();
    }
  }, [authenticatedUser, isLoaded]);

  return isLoaded ? (
    <>
      {projects.length > 0 && authenticatedUser?.role.includes(UserRoleEnum.Startup) && (
        <button
          onClick={() => setIsLaunchProjectModalVisible(true)}
          className='fixed z-50 p-2 font-bold text-white transition-all duration-300 rounded-full shadow-lg bg-purple-dark bottom-8 right-8 hover:scale-110 hover:bg-[#4f16b4]'
        >
          <PlusIcon className='w-16 h-16' />
        </button>
      )}
      {isLaunchProjectModalVisible &&
        createPortal(
          <LaunchProjectModal
            title='Launch new project'
            onClose={() => setIsLaunchProjectModalVisible(false)}
            onProcess={() => {
              searchParams.delete(migratedFromForgeParamName);
              setSearchParams(searchParams);
            }}
            allowClose={!searchParams.get(migratedFromForgeParamName)}
          />,
          document.getElementById('root')!,
        )}

      {isConnectWalletModalVisible &&
        createPortal(
          <ConnectWalletModal
            title='Connect your wallet'
            onClose={() => setIsLaunchProjectModalVisible(false)}
            onProcess={() => {
              setConnectWalletModalVisible(false);
              setIsLaunchProjectModalVisible(true);
            }}
          />,
          document.getElementById('root')!,
        )}
      <div className='flex flex-col py-5 px-6 flex-1 min-h-screen'>
        <Title>Projects</Title>
        {/* <div className='flex justify-between items-center mb-5'>
          {projects.length > 0 && authenticatedUser?.role.includes(UserRoleEnum.Startup) && (
            <Button
              onClick={() => setIsLaunchProjectModalVisible(true)}
              className='text-white font-semibold font-medium px-10 text-lg py-1.5 transition-[0.3s_ease] rounded-2xl'
            >
              Launch project
            </Button>
          )}
        </div> */}
        <div className='flex flex-col flex-1'>
          {!projects.length ? (
            <div className='flex mt-5 flex-1'>
              <div className='flex flex-col border-[3px] border-stone-200 rounded-2xl flex-1 border-dashed items-center justify-center'>
                {authenticatedUser?.role.includes(UserRoleEnum.Startup) ? (
                  <>
                    <h4 className='font-medium mb-4 text-stone-400 text-xl font-mono'>
                      No projects have been launched yet
                    </h4>
                    <Button
                      onClick={() => setIsLaunchProjectModalVisible(true)}
                      className='border-transparent text-white font-bold px-10 text-lg py-1.5 transition-[0.3s_ease] rounded-full'
                    >
                      Launch a new project
                    </Button>
                  </>
                ) : (
                  <h4 className='font-medium mb-4 text-gray-400 text-lg'>
                    No projects have been joined yet
                  </h4>
                )}
              </div>
            </div>
          ) : (
            <ProjectGrid projects={projects} />
          )}
        </div>
      </div>
    </>
  ) : (
    <div className='flex flex-col items-center justify-center flex-1 gap-5 w-full min-h-[80vh] mb-12'>
      <Spinner centerScreen={false} className='size-12 text-gray-200 animate-spin' />
      <p className='text-center font-mono'>Loading the home page for you</p>
    </div>
  );
};

export default ProjectsPage;
