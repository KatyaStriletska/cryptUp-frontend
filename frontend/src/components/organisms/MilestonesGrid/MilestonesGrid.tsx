import { FC } from 'react';
import { Milestone as MilestoneType } from '../../../types/milestone.types';
import Button from '../../atoms/Button/Button';
import Milestone from '../../molecules/Milestone/Milestone';
import { Project } from '../../../types/project.types';
import Title from 'components/atoms/Title';

export interface MilestonesGrid {
  setIsCreateMilestoneModalVisible?: (...args: any[]) => any;
  isCreateMilestoneButtonVisible?: boolean;
  milestones: MilestoneType[];
  project?: Project;
}

export const MilestonesGrid: FC<MilestonesGrid> = ({
  milestones,
  setIsCreateMilestoneModalVisible,
  isCreateMilestoneButtonVisible = true,
  project,
}) => {
  return (
    <div className='mt-10 max-w-[1440px] w-full'>
      <Title>Project milestones</Title>
      <div className='flex flex-col text-white bg-gradient-white-purple w-full rounded-xl'>
        {milestones.length > 0 && isCreateMilestoneButtonVisible && (
          <div className='flex items-center justify-between px-10 py-8'>
            <>
              {!milestones.find(milestone => !milestone.isFinal) ? (
                <Button
                  className='inline-flex text-white px-10 py-1.5 rounded-full'
                  onClick={() => setIsCreateMilestoneModalVisible?.(true)}
                >
                  Create new milestone
                </Button>
              ) : (
                <Button
                  className='inline-flex border-transparent px-10 py-1.5 rounded-full font-medium'
                  disabled
                  title='It is not possible to create a new milestone yet, as the previous milestone has not been submitted'
                >
                  Create new milestone
                </Button>
              )}
            </>
          </div>
        )}
        <div className='flex flex-col px-10 py-5 gap-2'>
          {milestones.length > 0 ? (
            milestones.map(milestone => {
              if (project) {
                return (
                  <Milestone
                    key={milestone.id}
                    milestone={milestone}
                    projectLaunch={{ ...project.projectLaunch, project }}
                  />
                );
              } else {
                return <Milestone key={milestone.id} milestone={milestone} />;
              }
            })
          ) : (
            <div className='flex flex-col items-center justify-center p-5 mt-5'>
              <span className='text-gray-300 font-medium mb-5'>
                No milestones have been created in this project yet
              </span>
              {isCreateMilestoneButtonVisible && (
                <Button
                  className='rounded-full'
                  onClick={() => setIsCreateMilestoneModalVisible?.(true)}
                >
                  Create new milestone
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
