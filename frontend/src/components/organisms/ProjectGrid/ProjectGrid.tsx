import { FC } from 'react';
import { Project } from '../../molecules/Project/Project';
import { ProjectLaunch } from '../../../types/project-launch.types';

export interface ProjectGridProps {
  projects: ProjectLaunch[];
  variant?: 'extended' | 'short' | 'tiny';
}

export const ProjectGrid: FC<ProjectGridProps> = ({ projects, variant = 'extended' }) => {
  return (
    <div className='grid lg:grid-cols-2 gap-20 mt-5 auto-rows-fr'>
      {projects.map(project => (
        <Project key={project.id} project={project} variant={variant} />
      ))}
    </div>
  );
};
