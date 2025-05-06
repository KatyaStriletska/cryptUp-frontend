import { FC, FormEvent, useState } from 'react';
import Modal, { ModalProps } from '../../molecules/Modal/Modal';
import { ProjectLaunch } from '../../../types/project-launch.types';
import { useAuth } from '../../../hooks/auth.hooks';
import { useAppDispatch } from '../../../hooks/redux.hooks';
import { updateProjectLaunch } from '../../../redux/slices/project-launch.slice';
import TextareaInput from 'components/atoms/TextareaInput';
import Button from 'components/atoms/Button/Button';

export interface ApproveProjectLaunchModalProps extends ModalProps {
  projectLaunch: ProjectLaunch;
}

export interface ApproveProjectLaunchModalState {
  data: {
    review?: string;
  };
  error?: any;
}

const initialState: ApproveProjectLaunchModalState = {
  data: {
    review: undefined,
  },
};

const ApproveProjectLaunchModal: FC<ApproveProjectLaunchModalProps> = ({
  title,
  projectLaunch,
  onClose,
  onProcess,
}) => {
  const [state, setState] = useState(initialState);
  const { authenticatedUser } = useAuth();
  const dispatch = useAppDispatch();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as any);

    if (authenticatedUser) {
      formData.set('approverId', authenticatedUser.id);
      formData.set('businessAnalystReview', state.data.review || '');

      dispatch(
        updateProjectLaunch(projectLaunch.id, formData, {
          onError: ({ response }) => setState({ ...state, error: response.data.error }),
          onSuccess: () => onProcess?.(),
        }),
      );
    }
  };

  return (
    <Modal title={title} onClose={onClose} className='max-w-[596px]'>
      <form className='flex flex-col px-6 py-8' onSubmit={handleSubmit}>
        <p className='text-white mb-8 text-justify'>
          Are you sure you want to approve this project launch? If so, leave the project launch
          review as a business analyst. You will also be shown as an approver in the project launch
          info.
        </p>
        <TextareaInput
          id='approve_project_launch_review'
          className='min-h-[170px]'
          defaultValue={state.data.review}
          placeholder='Project launch review ...'
          onChange={value =>
            setState({
              ...state,
              data: { ...state.data, review: value },
              error: null,
            })
          }
        />
        <div className='flex gap-4 mt-8'>
          <Button
            type='submit'
            className='rounded-xl'
          >
            Approve
          </Button>
          <button
            type='button'
            className='secondary-green-button p-2 px-10 py-2'
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ApproveProjectLaunchModal;
