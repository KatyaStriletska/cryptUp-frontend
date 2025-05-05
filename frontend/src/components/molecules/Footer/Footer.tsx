import { FC, HTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { AppRoutes } from 'types/enums/app-routes.enum';
// import { useIntl } from 'react-intl';

export interface FooterProps extends HTMLAttributes<HTMLDivElement> {}

const Footer: FC<FooterProps> = ({ ...props }) => {

  return (
    <footer className='w-full' {...props}>
      <div className='flex gap-3 items-center opacity-50'>
        <svg
          width='25'
          height='26'
          viewBox='0 0 25 26'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          className='text-white size-5'
        >
          <path
            d='M10.18 11.6226C10.2404 11.2238 10.3733 10.8734 10.5425 10.5713C10.7116 10.2692 10.9533 10.0155 11.2554 9.82216C11.5454 9.64091 11.9079 9.55633 12.355 9.54425C12.6329 9.55633 12.8866 9.60466 13.1162 9.70133C13.3579 9.81008 13.5754 9.95508 13.7445 10.1363C13.9137 10.3176 14.0466 10.5351 14.1554 10.7767C14.2641 11.0184 14.3125 11.2842 14.3245 11.5501H16.4875C16.4633 10.9822 16.3545 10.4626 16.1491 9.99133C15.9437 9.52008 15.6658 9.10925 15.3033 8.77091C14.9408 8.43258 14.5058 8.16675 13.9983 7.97341C13.4908 7.78008 12.935 7.6955 12.3187 7.6955C11.5333 7.6955 10.8445 7.82841 10.2645 8.10633C9.68454 8.38425 9.20121 8.74675 8.81454 9.218C8.42788 9.68925 8.13788 10.233 7.95663 10.8613C7.77538 11.4897 7.66663 12.1422 7.66663 12.843V13.1692C7.66663 13.8701 7.76329 14.5226 7.94454 15.1509C8.12579 15.7792 8.41579 16.323 8.80246 16.7822C9.18912 17.2413 9.67246 17.6159 10.2525 17.8817C10.8325 18.1476 11.5212 18.2926 12.3066 18.2926C12.8745 18.2926 13.4062 18.1959 13.9016 18.0147C14.397 17.8334 14.832 17.5797 15.2066 17.2534C15.5812 16.9272 15.8833 16.5526 16.1008 16.1176C16.3183 15.6826 16.4512 15.2234 16.4633 14.728H14.3004C14.2883 14.9817 14.2279 15.2113 14.1191 15.4288C14.0104 15.6463 13.8654 15.8276 13.6841 15.9847C13.5029 16.1417 13.2975 16.2626 13.0558 16.3472C12.8262 16.4317 12.5845 16.4559 12.3308 16.468C11.8958 16.4559 11.5333 16.3713 11.2554 16.1901C10.9533 15.9967 10.7116 15.743 10.5425 15.4409C10.3733 15.1388 10.2404 14.7763 10.18 14.3776C10.1195 13.9788 10.0833 13.568 10.0833 13.1692V12.843C10.0833 12.4201 10.1195 12.0213 10.18 11.6226ZM12.5 0.916748C5.82996 0.916748 0.416626 6.33008 0.416626 13.0001C0.416626 19.6701 5.82996 25.0834 12.5 25.0834C19.17 25.0834 24.5833 19.6701 24.5833 13.0001C24.5833 6.33008 19.17 0.916748 12.5 0.916748ZM12.5 22.6667C7.17121 22.6667 2.83329 18.3288 2.83329 13.0001C2.83329 7.67133 7.17121 3.33341 12.5 3.33341C17.8287 3.33341 22.1666 7.67133 22.1666 13.0001C22.1666 18.3288 17.8287 22.6667 12.5 22.6667Z'
            fill='currentColor'
          />
        </svg>
        <p className='text-white text-xl'>
        {/* {formatMessage({ id: 'footer.title' })} */}
        IdeaForge Platform
        </p>
      </div>
      <div className='flex gap-3 text-white items-center'>
        <Link to={AppRoutes.About}>
          <span className='text-white text-xl hover:text-green-primary duration-300 transition-all'>
            {/* {formatMessage({ id: 'footer.termsAndConditions' })} */}
            Terms & Conditions
          </span>
        </Link>
        <span>&bull;</span>
        <a
          href='#'
          className='text-white text-xl hover:text-green-primary duration-300 transition-all'
        >
          {/* {formatMessage({ id: 'footer.privacyPolicy' })} */}
          Privacy Policy
        </a>
      </div>
      {/* <div className='flex gap-5 items-center text-white'>
        <InstagramIcon className='size-6' />
        <TelegramIcon className='size-6' />
        <TwitterIcon className='size-6' />
      </div> */}
    </footer>
  );
};

export default Footer;
