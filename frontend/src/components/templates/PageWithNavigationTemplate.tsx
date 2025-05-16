import { Outlet } from 'react-router';
import Navbar from '../molecules/Navbar/Navbar';
import { AppRoutes } from '../../types/enums/app-routes.enum';
import Footer from 'components/molecules/Footer';

export interface NavbarLink {
  name: string;
  to: string;
}

const links: NavbarLink[] = [
  {
    name: 'Home',
    to: AppRoutes.Home,
  },
  {
    name: 'Portfolio',
    to: AppRoutes.Portfolio,
  },

  {
    name: 'Message Center',
    to: AppRoutes.MessageCenter,
  },
  {
    name: 'Dashboard',
    to: AppRoutes.Dashboard,
  },
  {
    name: 'About',
    to: AppRoutes.About,
  },
  {
    name: 'Token Market',
    to: AppRoutes.TokenMarket,
  },
];

const PageWithNavigationTemplate = () => {
  return (
    <div className='flex flex-col  bg-dark-primary'>
      <Navbar links={links} className='sticky top-0 z-50 flex justify-center w-full py-2' />
      <main className=''>
        <Outlet />
      </main>
      <Footer className='inline-flex relative h-[20px] w-full mt-[100px] p-10 justify-around bg-dark-secondary' />
    </div>
  );
};

export default PageWithNavigationTemplate;
