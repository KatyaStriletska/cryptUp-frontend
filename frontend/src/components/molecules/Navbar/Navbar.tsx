import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FC, HTMLAttributes, useEffect, useRef, useState } from 'react';
import { NavbarLink } from '../../templates/PageWithNavigationTemplate';
import { v4 as uuid } from 'uuid';
import { AppRoutes } from '../../../types/enums/app-routes.enum';
import { BurgerMenuIcon, ExitIcon, ProfileIcon, UserCircleIcon, UserIcon } from '../../atoms/Icons/Icons';
import { useAuth } from '../../../hooks/auth.hooks';
import Button from '../../atoms/Button/Button';

export interface NavbarProps extends HTMLAttributes<HTMLDivElement> {
  links: NavbarLink[];
  showLogo?: boolean;
}

const DesktopNavbar: FC<NavbarProps> = ({ links }) => {
  const { authenticatedUser } = useAuth();

  return (
    <>
      <div className='hidden md:flex items-center px-3'>
        <NavLink
          to={AppRoutes.Root}
          className='inline-flex items-center justify-center font-bold me-10 hover:text-indigo-700 transition-[0.3s_ease]'
        >
          <img src='/logo.png' className='w-48' />
        </NavLink>
        {links.map(link => (
          <NavLink
            key={uuid()}
            to={link.to}
            className={({ isActive, isPending }) =>
              isActive
                ? 'py-1.5 text-2xl font-serif font-bold mx-4 transition-[0.3s_ease]'
                : isPending
                  ? 'py-1.5 text-2xl font-serif mx-4 transition-[0.3s_ease]'
                  : 'py-1.5 text-2xl font-serif mx-4 transition-[0.3s_ease]'
            }
          >
            {link.name}
          </NavLink>
        ))}
      </div>
      <div className='hidden md:block'>
        {authenticatedUser && (
          <Link
            to={AppRoutes.Profile}
            className='flex items-center justify-center bg-gray-400 font-sans ps-5 me-3 text-white rounded-full'
          >
            <span>{authenticatedUser.username}</span>
            <span className='ms-2 rounded-full bg-gray-500 p-2.5'>
              <UserIcon className='size-4' />
            </span>
          </Link>
        )}
      </div>
    </>
  );
};

const MobileNavbar: FC<NavbarProps> = ({ links }) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { authenticatedUser, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isMenuVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMenuVisible]);

  useEffect(() => {
    setIsMenuVisible(false);
  }, [location]);

  return (
    <>
      <div className='flex md:hidden items-center px-3 relative font-serif'>
        <NavLink
          to={AppRoutes.Root}
          className='inline-flex items-center justify-center font-bold me-10'
        >
          <img src='/logo.png' className='w-40' />
        </NavLink>
        {isMenuVisible && (
          <div className='absolute top-[calc(100%_+_0.75em_+_6px)] h-[calc(100vh_-_100%_-_1.5em_-_6px)] bg-[#f5f5f5] flex flex-col -left-3 w-screen p-4 justify-between'>
            <div className='flex flex-col'>
              {links.map(link => (
                <NavLink
                  key={uuid()}
                  to={link.to}
                  className={({ isActive, isPending }) =>
                    isActive
                      ? 'rounded-md text-lg text-white bg-black font-bold transition-[0.3s_ease] mb-2 p-3'
                      : isPending
                        ? 'rounded-md text-lg font-medium transition-[0.3s_ease] hover:text-indigo-500 mb-2 p-3 border'
                        : 'rounded-md text-lg font-medium transition-[0.3s_ease] hover:text-indigo-500 mb-2 p-3 border'
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
            {authenticatedUser && (
              <div>
                <h3 className='font-bold mb-3 text-center'>
                  Selected account: {authenticatedUser.username}
                </h3>
                <div className='flex flex-col'>
                  <NavLink
                    to={AppRoutes.Profile}
                    className={({ isActive, isPending }) =>
                      isActive
                        ? 'inline-flex items-center rounded-md text-white bg-zinc-900 font-bold transition-[0.3s_ease] mb-2 p-3'
                        : isPending
                          ? 'inline-flex items-center rounded-md font-medium transition-[0.3s_ease] hover:text-zinc-600 mb-2 p-3 border'
                          : 'inline-flex items-center rounded-md font-medium transition-[0.3s_ease] hover:text-zinc-600 mb-2 p-3 border'
                    }
                  >
                    <UserCircleIcon className='size-5 me-2 w-[32px]' />
                    User account
                  </NavLink>
                  <span
                    onClick={() => {
                      signOut();
                      navigate(AppRoutes.SignIn, { state: { walletDisconnect: true } });
                    }}
                    className='inline-flex items-center rounded-md font-medium transition-[0.3s_ease] hover:text-zinc-500 mb-2 p-3 border'
                  >
                    <ExitIcon className='size-5 me-2 w-[32px]' />
                    Sign Out
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className='md:hidden'>
        <Button className='border rounded-md p-1' onClick={() => setIsMenuVisible(!isMenuVisible)}>
          <BurgerMenuIcon className='size-8' />
        </Button>
      </div>
    </>
  );
};

export const Navbar: FC<NavbarProps> = ({ links, showLogo = true, ...props }) => {
  const {
    authenticatedUser,
    signOut,
    // userImageUrl,
    // setUserImageUrl,
    // userImageError,
    // setUserImageError,
    // fetchUserInboxCount,
  } = useAuth();
  // const { formatMessage } = useIntl();
  const navigate = useNavigate();
  const ref = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // if (!userImageUrl && !userImageError && authenticatedUser) {
    //   setUserImageUrl(
    //     getSupabasePublicUrl(`users/${authenticatedUser.id}/avatar?lastmod=${Date.now()}`),
    //   );
    //   setUserImageError(false);
    // }
    // fetchUserInboxCount();
  }, [authenticatedUser]);

  useEffect(() => {
    if (ref.current) {
      const element = ref.current as HTMLElement;
      const scrollListener = () => setScrolled(element.offsetTop > 0);

      document.addEventListener('scroll', scrollListener);

      return () => {
        document.removeEventListener('scroll', scrollListener);
      };
    }
  }, [ref.current]);

  return (
    <div
      {...props}
      className={`${props.className ? props.className : `flex w-full sticky top-0`} ${scrolled ? 'bg-zinc-900 backdrop-blur-xl bg-opacity-5' : ''}`}
      ref={ref}
    >
      <div className='flex items-center justify-between w-full px-32'>
        <div className='flex min-w-[150px] items-center'>
          {showLogo && (
            <Link to={AppRoutes.Root}>
              <img src='/logo.png' className='w-[100px]' alt='Logo' />
            </Link>
          )}
        </div>

        {/* {authenticatedUser ? ( */}
        <>
          <div className='flex min-w-[150px] space-x-10 items-center text-white'>
            {links.map(link => (
              <NavLink
                key={uuid()}
                to={link.to}
                className={({ isActive }) =>
                  isActive
                    ? 'text-lg font-bold mx-4 transition-[0.3s_ease] relative text-green-primary after:bottom-0 after:left-0  after:bg-green-primary after:h-[2px] after:absolute after:w-full'
                    : 'text-lg mx-4 transition-[0.3s_ease] relative after:bg-white after:absolute after:h-[2px] after:w-0 after:bottom-0 after:left-0 hover:after:w-full after:transition-all after:duration-300'
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>
          <div className='flex items-center gap-6'>
            {authenticatedUser && (
              <Link
                to={AppRoutes.Profile}
                className='transition-all duration-300 hover:scale-110'
                title={'Profile'}
              >
                <ProfileIcon className='size-12 xl:size-16' />
              </Link>
            )}
            <button
              onClick={() => {
                signOut();
                navigate(AppRoutes.SignIn);
              }}
              className='inline-flex text-center items-center justify-center rounded-xl ring-1 ring-green-primary px-5 py-2 text-green-primary font-[900] text-lg hover:bg-green-primary hover:text-dark-primary transition-all duration-300'
            >
              {/* {formatMessage({ id: 'navbar.logout' })} */} Sign out
            </button>
          </div>
        </>
      </div>
    </div>
  );
};

export default Navbar;
