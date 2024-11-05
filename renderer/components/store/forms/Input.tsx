// components/form/Input.tsx
import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = ({ label, ...props }: InputProps) => (
  <div className="mb-4">
    <label className="block mb-2 text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      {...props}
      className="w-full px-4 py-2 transition-all duration-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
    />
  </div>
);