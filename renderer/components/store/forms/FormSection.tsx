// components/form/FormSection.tsx
import React, { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  children: ReactNode;
}

export const FormSection = ({ title, children }: FormSectionProps) => (
  <div className="p-6 bg-white border border-gray-100 rounded-lg shadow-md">
    <h2 className="mb-6 text-xl font-semibold text-gray-800">{title}</h2>
    {children}
  </div>
);