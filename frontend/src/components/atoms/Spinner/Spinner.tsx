import { FC } from "react";

interface LoadingSpinnerProps {
  className?: string;
  wrapperClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  centerScreen?: boolean;
  defaultBorderStyles?: boolean;
}

const Spinner: FC<LoadingSpinnerProps> = ({ 
  className = '',
  wrapperClassName = '',
  size = 'md',
  centerScreen = false,
  defaultBorderStyles = true,
}) => {
  const sizeClasses = {
      sm: 'w-6 h-6',
      md: 'w-10 h-10',
      lg: 'w-16 h-16'
  };

  const centerScreenClasses = centerScreen ? 'fixed w-1/2 h-1/2 top-1/4 left-1/4 z-100' : '';

  return (
      <div className={`
          flex 
          items-center 
          justify-center
          ${centerScreenClasses}
          ${wrapperClassName}
      `}>
          <div 
              className={`
                  animate-spin 
                  rounded-full 
                  border-4
                  ${defaultBorderStyles ? 'border-purple-light border-t-purple-dark' : ''} 
                  ${sizeClasses[size]}
                  ${className}
              `}
          />
      </div>
  );
};

export default Spinner;