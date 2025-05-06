import React, { ChangeEvent, KeyboardEventHandler, LegacyRef, ReactNode } from 'react';

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
  onInput?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (event: any) => KeyboardEventHandler<HTMLTextAreaElement>;
  hintText?: ReactNode;
  hintClassName?: string;
  errorHighlight?: boolean;
  disabled?: boolean;
  value?: string;
  rows?: number;
  ref?: LegacyRef<HTMLTextAreaElement>;
  specifiedHeight?: boolean;
  autoFocus?: boolean;

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
  onInput = () => { },
  onKeyDown = () => { },
  specifiedHeight = true,
  disabled = false,
  ...props
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
        className={`w-full ${specifiedHeight ? 'h-48' : ''} border-gradient-primary rounded-[20px] before:rounded-[20px] ${wrapperClassName}`}
      >
        <textarea
          id={id}
          placeholder={placeholder}
          defaultValue={defaultValue}
          onChange={e => onChange(e.target.value)}
          onInput={e => onInput(e as ChangeEvent<HTMLTextAreaElement>)}
          className={`w-full h-full px-4 py-2 text-white outline-none resize-none bg-transparent ${inputClassName}`}
          disabled={disabled}
          onKeyDown={onKeyDown}
          {...(value && { value })}
          {...props}
        />
      </div>
    </div>
  );
};

export default TextareaInput;
