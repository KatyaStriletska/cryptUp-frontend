import { FC, FormEvent, useEffect, useRef, useState } from 'react';
import Modal, { ModalProps } from '../../molecules/Modal/Modal';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux.hooks';
import { createMilestone, selectErrors, setError } from '../../../redux/slices/milestone.slice';
import { Project } from '../../../types/project.types';
import { CreateMilestoneDto } from '../../../types/milestone.types';
import Label from 'components/atoms/Label';
import TextInput from 'components/atoms/TextInput';
import TextareaInput from 'components/atoms/TextareaInput';
import Button from 'components/atoms/Button/Button';

export interface CreateMilestoneModalProps extends ModalProps {
  project: Project;
}

interface CreateMilestoneModalState {
  data: {
    mergedPullRequestUrl?: string;
    description?: string;
  };
  error: string | null;
}

const initialState: CreateMilestoneModalState = {
  data: {
    mergedPullRequestUrl: undefined,
    description: undefined,
  },
  error: null,
};

const CreateMilestoneModal: FC<CreateMilestoneModalProps> = ({
  project,
  title,
  onClose,
  onProcess,
  children,
}) => {
  const [state, setState] = useState(initialState);
  const formRef = useRef<HTMLFormElement | null>(null);
  const dispatch = useAppDispatch();
  const errors = useAppSelector(selectErrors);

  useEffect(() => {
    dispatch(setError({ createMilestone: null }));
  }, []);

  useEffect(() => {
    setState({ ...state, error: errors.createMilestone });
  }, [errors.createMilestone]);

  const isDataValid = (data: CreateMilestoneModalState['data']): boolean => {
    if (!data.mergedPullRequestUrl?.trim()) {
      setState({ ...state, error: 'Milestone merged pull request url cannot be empty.' });
      return false;
    }

    return true;
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (isDataValid(state.data)) {
      dispatch(
        createMilestone({ ...state.data, projectId: project.id } as CreateMilestoneDto, {
          onSuccess: () => onProcess?.(),
        }),
      );
    }
  };

  return (
    <Modal title={title} onClose={onClose} onProcess={onProcess} className='max-w-[768px]'>
      <form ref={formRef} className='flex flex-col px-10 py-8' onSubmit={onSubmit}>
        {state.error && (
          <span className='bg-rose-100 border border-rose-200 p-2 rounded-md mb-8 font-mono text-sm'>
            {state.error}
          </span>
        )}
        <div className='flex flex-col gap-2 text-white'>
          <div className='flex flex-col'>
            <Label htmlFor='create_milestone_merged_pull_request_url'>
              Merged pull request URL
            </Label>
            <TextInput
              id='create_milestone_merged_pull_request_url'
              className='!p-2'
              defaultValue={state.data.mergedPullRequestUrl}
              onChange={event =>
                setState({
                  ...state,
                  data: { ...state.data, mergedPullRequestUrl: event.target.value },
                  error: null,
                })
              }
            />
          </div>
          <div className='flex flex-col'>
            <Label htmlFor='create_milestone_description'>Description</Label>
            <TextareaInput
              id='create_milestone_description'
              className='mt-1 min-h-[150px] whitespace-pre-wrap'
              defaultValue={state.data.description}
              onChange={value =>
                setState({
                  ...state,
                  data: { ...state.data, description: value },
                  error: null,
                })
              }
            />
          </div>
        </div>
        <div className='flex gap-4 mt-10'>
          <Button
            type='submit'
            className='rounded-2xl font-medium'
          >
            Create
          </Button>
          <button
            type='button'
            className='inline-flex text-center justify-center items-center secondary-green-button rounded-2xl transition-all duration-300 py-2 px-10 font-medium text-lg'
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </form>
      {children}
    </Modal>
  );
};

export default CreateMilestoneModal;
