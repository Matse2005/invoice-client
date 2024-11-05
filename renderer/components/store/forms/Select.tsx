// components/form/Select.tsx
import React, { SelectHTMLAttributes, ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: ReactNode;
}

export const Select = ({ label, children, ...props }: SelectProps) => (
  <div className="mb-4">
    <label className="block mb-2 text-sm font-medium text-gray-700">
      {label}
    </label>
    <select
      {...props}
      className="w-full px-4 py-2 transition-all duration-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
    >
      {children}
    </select>
  </div>
);