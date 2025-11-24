import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const FormInput: React.FC<FormInputProps> = ({ className = '', ...props }) => {
  return (
    <input
      className={`w-full h-full px-2 py-2 md:py-3 outline-none bg-transparent text-center focus:bg-blue-50 transition-colors ${className}`}
      autoComplete="off"
      {...props}
    />
  );
};
