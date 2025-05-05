import React, { ReactNode } from 'react';

export interface TextInputProps {
  value?: string | number;
  defaultValue?: string;
  id?: string;
  placeholder?: string;
  type?: string;
  className?: string;
  wrapperClass?: string;
  label?: string;
  labelClass?: string;
  error?: string;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  tooltipContent?: ReactNode;
  tooltipClassName?: string;
  novalidate?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  step?: number;
  min?: number;
}

const TextInput: React.FC<TextInputProps> = ({
  value,
  defaultValue,
  id,
  label,
  error,
  onChange,
  disabled = false,
  type = 'text',
  placeholder = '',
  className = '',
  wrapperClass = '',
  labelClass = '',
  ...props
}) => {
  return (
    <div className={`flex mt-1 flex-col w-full rounded-[20px] ${wrapperClass}`}>
      {label && (
        <div className='flex items-center gap-1 mb-2 ml-4'>
          <label className={`text-sm font-medium text-white ${labelClass}`}>{label}</label>
        </div>
      )}{' '}
      <div
        className={`w-full relative rounded-[20px] before:rounded-[20px] ${error ? 'border-2 border-red-500' : 'border-gradient-primary'}`}
      >
        <input
          value={value}
          defaultValue={defaultValue}
          id={id}
          type={type}
          placeholder={placeholder}
          className={`w-full px-4 py-px rounded-[20px] outline-none bg-transparent text-white font-[600] text-lg disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          onChange={onChange}
          disabled={disabled}
          {...props}
        />
      </div>
      {error && <span className='mt-1 text-sm text-red-500'>{error}</span>}
    </div>
  );
};

export default TextInput;
