import React, { ReactNode } from 'react';

interface TextareaInputProps {
  id?: string;
  title?: string;
  titleType?: 'default' | 'fancy'; // Type of title: default or fancy
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  titleClassName?: string;
  wrapperClassName?: string;
  onChange?: (value: string) => void;
  hintText?: ReactNode;
  hintClassName?: string;
  errorHighlight?: boolean;
  disabled?: boolean;
  value?: string;
}

const TextareaInput: React.FC<TextareaInputProps> = ({
  id,
  title = '',
  defaultValue = '',
  value = '',
  titleType = 'default',
  placeholder = '',
  className = '',
  inputClassName = '',
  titleClassName = '',
  wrapperClassName = '',
  onChange = () => { },
  disabled = false,
}) => {
  const titleDefaultClassName =
    titleType === 'fancy'
      ? 'text-white text-2xl text-center font-[600] w-full bg-grey-primary py-2 border-gradient-primary rounded-[20px] before:rounded-[20px] rounded-[20px]'
      : 'text-white text-lg font-[600]';
  return (
    <div className={`flex flex-col items-start space-y-4 ${className}`}>
      {title && (
        <div className={`w-full flex items-center gap-1 ${titleType === 'fancy' ? '' : 'mb-2'}`}>
          <h2 className={`${titleDefaultClassName}${titleClassName}`}>{title}</h2>
        </div>
      )}

      {/* Textarea input */}
      <div
        className={`w-full h-48 border-gradient-primary rounded-[20px] before:rounded-[20px] ${wrapperClassName}`}
      >
        <textarea
          id={id}
          placeholder={placeholder}
          defaultValue={defaultValue}
          onChange={e => onChange(e.target.value)}
          className={`w-full h-full px-4 py-2 text-white outline-none resize-none bg-transparent ${inputClassName}`}
          disabled={disabled}
          {...(value && { value })}
        />
      </div>
    </div>
  );
};

export default TextareaInput;
