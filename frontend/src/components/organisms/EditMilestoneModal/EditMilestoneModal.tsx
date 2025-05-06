import { FC, FormEvent, useEffect, useRef, useState } from 'react';
import Modal, { ModalProps } from '../../molecules/Modal/Modal';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux.hooks';
import { updateMilestone, selectErrors, setError } from '../../../redux/slices/milestone.slice';
import { Milestone, UpdateMilestoneDto } from '../../../types/milestone.types';
import Label from 'components/atoms/Label';
import TextInput from 'components/atoms/TextInput';
import TextareaInput from 'components/atoms/TextareaInput';
import Button from 'components/atoms/Button/Button';

export interface EditMilestoneModalProps extends ModalProps {
  milestone: Milestone;
}

interface EditMilestoneModalState {
  data: {
    mergedPullRequestUrl?: string;
    description?: string;
    isFinal: boolean;
  };
  error: string | null;
}

const initialState: EditMilestoneModalState = {
  data: {
    mergedPullRequestUrl: undefined,
    description: undefined,
    isFinal: false,
  },
  error: null,
};

const EditMilestoneModal: FC<EditMilestoneModalProps> = ({
  milestone,
  title,
  onClose,
  onProcess,
  children,
}) => {
  const [state, setState] = useState({
    ...initialState,
    data: {
      ...initialState.data,
      mergedPullRequestUrl: milestone.mergedPullRequestUrl,
      description: milestone.description,
    },
  });
  const formRef = useRef<HTMLFormElement | null>(null);
  const dispatch = useAppDispatch();
  const errors = useAppSelector(selectErrors);

  useEffect(() => {
    dispatch(setError({ updateMilestone: null }));
  }, []);

  useEffect(() => {
    setState({ ...state, error: errors.updateMilestone });
  }, [errors.updateMilestone]);

  const isDataValid = (data: EditMilestoneModalState['data']): boolean => {
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
        updateMilestone(milestone.id, state.data as UpdateMilestoneDto, {
          onSuccess: () => onProcess?.(),
        }),
      );
    }
  };

  return (
    <Modal title={title} onClose={onClose} onProcess={onProcess} className='max-w-[768px]'>
      <form ref={formRef} className='flex flex-col px-10 py-8 text-white' onSubmit={onSubmit}>
        {state.error && (
          <span className='bg-rose-100 border border-red-500 text-red-500 p-2 rounded-md mb-8 text-sm font-mono'>
            {state.error}
          </span>
        )}
        <div className='flex flex-col mb-2'>
          <Label htmlFor='edit_milestone_merged_pull_request_url'>Merged pull request URL</Label>
          <TextInput
            type='text'
            id='edit_milestone_merged_pull_request_url'
            className='!p-2'
            placeholder='https://github.com/project/pull/1'
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
            id='update_milestone_description'
            className='!p-2'
            placeholder='Milestone description'
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
        <div className='flex gap-4 mt-10'>
          <Button
            type='submit'
            className='inline-flex text-center justify-center items-center text-white rounded-2xl py-2 px-10'
          >
            Save changes
          </Button>
          <button
            type='button'
            className='secondary-green-button inline-flex text-center justify-center items-center rounded-2xl py-2 px-10 font-medium text-lg'
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

export default EditMilestoneModal;
