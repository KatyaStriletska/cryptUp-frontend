import { FC, HTMLAttributes, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AppRoutes } from 'types/enums/app-routes.enum';
import ProposalDetailsSection from './components/ProposalDetailsSection/ProposalDetailsSection';

export interface ProposalDetailsProps extends HTMLAttributes<HTMLDivElement> {
  isVisible: boolean;
  data: {
    description: string;
    author: string;
    createdAt: Date;
    executedAt: Date | null;
    projectId: string;
    transactionLink: string;
    results: {
      confirmed: number;
      rejected: number;
      threshold: number;
    };
  };
}

const ProposalDetails: FC<ProposalDetailsProps> = ({ isVisible, children, data, ...props }) => {
  const datetimeFormatter = useMemo(
    () => new Intl.DateTimeFormat('en-US', { timeStyle: 'short', dateStyle: 'medium' }),
    [],
  );
  const ref = useRef(null);

  return (
    <div
      ref={ref}
      className={`transition-[height] duration-300 ease-out overflow-hidden text-white`}
      style={
        ref?.current
          ? {
              height: isVisible ? (ref.current as HTMLElement | null)?.scrollHeight : 0,
            }
          : {}
      }
      {...props}
    >
      <div className='grid grid-cols-1 sm:grid-cols-2 px-3 pb-3 gap-3'>
        <hr className='sm:col-span-2' />
        <ProposalDetailsSection
          title='Description'
          className='sm:col-span-2 text-white border-gradient-primary before:rounded-xl p-3'
        >
          <p className=''>{data.description}</p>
        </ProposalDetailsSection>
        <ProposalDetailsSection title='Author' className='border-gradient-primary text-white before:rounded-xl p-3 rounded-xl'>
          <ul className='text-white flex flex-col gap-2'>
            <li className='flex justify-between'>
              <span className='text-sm'>Author</span>
              <span className='font-semibold text-sm'>{data.author}</span>
            </li>
            <li className='flex justify-between'>
              <span className='text-sm'>Created at</span>
              <span className='font-semibold text-sm'>
                {datetimeFormatter.format(data.createdAt)}
              </span>
            </li>
            <li className='flex justify-between'>
              <span className='text-sm'>Executed at</span>
              <span className='font-semibold text-sm'>
                {data.executedAt ? datetimeFormatter.format(data.executedAt) : '-'}
              </span>
            </li>
            <li className='flex justify-between'>
              <span className='text-sm'>Proposal link</span>
              <a
                className='font-semibold text-sm text-blue-400 cursor-pointer'
                href={data.transactionLink}
              >
                {data.transactionLink}
              </a>
            </li>
            <li className='flex justify-between'>
              <span className='text-sm'>Project link</span>
              <Link
                to={AppRoutes.DetailsProject.replace(':id', data.projectId)}
                className='font-semibold text-sm text-blue-400 cursor-pointer'
              >
                {data.projectId}
              </Link>
            </li>
          </ul>
        </ProposalDetailsSection>
        <ProposalDetailsSection
          title='Results'
          className='border-gradient-primary before:rounded-xl p-3 rounded-xl flex flex-col text-white'
        >
          <div className='flex gap-3 w-full flex-1 text-white'>
            <div className='flex flex-col flex-1 items-center justify-center rounded-xl gap-1 bg-grey-tertiary'>
              <span className='font-bold text-3xl text-emerald-500'>{data.results.confirmed}</span>
              <span className='text-xs'>Confirmed</span>
            </div>
            <div className='flex flex-col flex-1 items-center justify-center rounded-xl gap-1 bg-grey-tertiary'>
              <span className='font-bold text-3xl text-rose-500'>{data.results.rejected}</span>
              <span className='text-xs'>Rejected</span>
            </div>
            <div className='flex flex-col flex-1 items-center justify-center rounded-xl gap-1 bg-grey-tertiary'>
              <span className='font-bold text-3xl'>
                {data.results.confirmed}/{data.results.threshold}
              </span>
              <span className='text-xs'>Threshold</span>
            </div>
          </div>
        </ProposalDetailsSection>
      </div>
      <div className='flex flex-col'>{children}</div>
    </div>
  );
};

export default ProposalDetails;
