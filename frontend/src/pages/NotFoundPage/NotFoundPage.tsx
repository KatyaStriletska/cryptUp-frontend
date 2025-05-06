import { FC } from 'react';
import { Link } from 'react-router-dom';
import { AppRoutes } from '../../types/enums/app-routes.enum';

const NotFoundPage: FC = () => {
  return (
    <div className='flex items-center justify-center h-screen'>
      <div className='text-center'>
        <h1 className='text-6xl font-bold text-white'>404</h1>
        <h2 className='mt-4 text-2xl font-semibold text-white'>Oops! Page not found.</h2>
        <p className='mt-2 text-white'>
          The page you are looking for might have been removed or does not exist.
        </p>
        <Link
          to={AppRoutes.Root}
          className='mt-10 inline-flex justify-center items-center text-white bg-primary-gradient bg-[length:200%_200%] bg-[0%_0%] hover:bg-[100%_100%] font-mono transition-all duration-1000 px-10 py-3 text-lg rounded-full'
        >
          Go back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
