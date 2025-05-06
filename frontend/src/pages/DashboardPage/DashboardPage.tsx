import Title from 'components/atoms/Title';
import BusinessAnalystDashboard from 'components/organisms/BusinessAnalystDashboard/BusinessAnalystDashboard';
import StartupOrInvestorDashboard from 'components/organisms/SturtupOrInvestorDashboardSection/StartupOrInvestorDashboard';
import { useAuth } from 'hooks/auth.hooks';
import { FC, useEffect } from 'react';
import { UserRoleEnum } from 'types/enums/user-role.enum';

const DashboardPage: FC = () => {
  const { authenticatedUser } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className='flex mt-3 flex-col justify-start align-center mb-10 flex-1 min-h-screen'>
      <div className='flex flex-col max-w-[1440px] flex-1 mx-auto'>
        {authenticatedUser && (
          <div className='px-6 flex flex-col flex-1'>
            <Title>Dashboard</Title>
            {!authenticatedUser.role.includes(UserRoleEnum.BusinessAnalyst) ? (
              <StartupOrInvestorDashboard />
            ) : (
              <BusinessAnalystDashboard />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
