import React from 'react';
import { Input } from '../forms/Input';
import { Select } from '../forms/Select';

interface InvoiceItemProps {
  item: {
    description: string;
    price: number;
    btw: number;
  };
  index: number;
  onItemChange: (index: number, field: string, value: string | number) => void;
  onRemove: (index: number) => void;
  showRemove: boolean;
}

export const InvoiceItem = ({
  item,
  index,
  onItemChange,
  onRemove,
  showRemove
}: InvoiceItemProps) => (
  <div className="p-5 mb-4 transition-shadow duration-200 border border-gray-200 rounded-lg hover:shadow-sm">
    <div className="grid gap-4 md:grid-cols-3">
      <div className="md:col-span-2">
        <Input
          label="Omschrijving"
          type="text"
          value={item.description}
          onChange={(e) => onItemChange(index, 'description', e.target.value)}
          required
        />
      </div>
      <div>
        <Input
          label="Prijs"
          type="number"
          step="0.01"
          value={item.price}
          onChange={(e) => onItemChange(index, 'price', parseFloat(e.target.value))}
          required
        />
      </div>
      <div>
        <Select
          label="BTW Percentage"
          value={item.btw}
          onChange={(e) => onItemChange(index, 'btw', parseInt(e.target.value))}
        >
          <option value={0}>0%</option>
          <option value={6}>6%</option>
          <option value={12}>12%</option>
          <option value={21}>21%</option>
        </Select>
      </div>
    </div>
    {showRemove && (
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="mt-2 text-sm text-red-500 transition-colors duration-200 hover:text-red-700"
      >
        Verwijder item
      </button>
    )}
  </div>
);