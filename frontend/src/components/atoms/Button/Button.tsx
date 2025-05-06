import React from 'react';
import Spinner from '../Spinner/Spinner';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    uppercase?: boolean;
    className?: string; // Allow additional custom classes for flexibility
    disabled?: boolean;
    isLoading?: boolean;
    spinnerSize?: 'sm' | 'md' | 'lg';
    title?: string;
}

const getSizeClasses = (size: string) => {
    switch (size) {
        case 'sm':
            return 'px-8 py-2 text-xs';
        case 'md':
            return 'px-10 py-3 text-lg';
        case 'lg':
            return 'px-20 py-5 text-3xl min-[1920px]:px-28 min-[1920px]:py-7';
        case 'xl':
            return 'mt-16 text-5xl rounded-3xl px-28 py-7';
        case 'full':
            return 'w-full px-10 py-3 text-lg';
        default:
            return '';
    }
};

const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    type = 'button',
    size = 'md',
    uppercase = false,
    className = '',
    disabled = false,
    isLoading = false,
    spinnerSize = 'sm',
    ...props
}) => {
    return (
    <button
        type={type}
        onClick={onClick}
        className={`text-white bg-primary-gradient bg-[length:200%_200%] bg-[0%_0%] hover:bg-[100%_100%] font-mono transition-all duration-1000 
            ${getSizeClasses(size)} ${uppercase ? 'uppercase font-[900]' : ''} 
            ${(disabled || isLoading) ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
        disabled={(disabled || isLoading)}
        {...props}
    >
        {isLoading ? <Spinner size={spinnerSize} className='' centerScreen={false} /> : children}
    </button>
    );
};

export default Button;