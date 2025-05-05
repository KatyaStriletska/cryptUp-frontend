import React from 'react';

interface TitleProps {
  children: React.ReactNode;
  className?: string;
}

const Title: React.FC<TitleProps> = ({ children, className = '' }) => {
  return (
    <h2
      className={`text-4xl font-mono font-[700] text-center my-10 w-full text-green-primary ${className}`}
    >
      {children}
    </h2>
  );
};

export default Title;
