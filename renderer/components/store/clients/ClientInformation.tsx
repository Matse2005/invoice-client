import React from 'react';
import { Input } from '../forms/Input';
import { Client } from '../../../types';

interface ClientInformationProps {
  client: {
    name: string;
    btw: string;
    address: string[];
  };
  onClientChange: (field: string, value: string) => void;
  filteredClients: Client[];
  onClientSelect: (client: Client) => void;
}

export const ClientInformation = ({
  client,
  onClientChange,
  filteredClients,
  onClientSelect
}: ClientInformationProps) => (
  <div className="p-6 bg-white border border-gray-100 rounded-lg shadow-md">
    <h2 className="mb-6 text-xl font-semibold text-gray-800">Klant Informatie</h2>
    <div className="relative mb-4">
      <Input
        label="Naam"
        type="text"
        value={client.name}
        onChange={(e) => onClientChange('name', e.target.value)}
      />
      {filteredClients.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
          {filteredClients.map((client, index) => (
            <div
              key={index}
              className="px-4 py-2 cursor-pointer hover:bg-gray-50"
              onClick={() => onClientSelect(client)}
            >
              {client.name}
            </div>
          ))}
        </div>
      )}
    </div>
    <Input
      label="BTW Nummer"
      type="text"
      value={client.btw}
      onChange={(e) => onClientChange('btw', e.target.value)}
    />
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Adres
      </label>
      {[
        'Straat en huisnummer',
        'Postcode en plaats',
        'LAND'
      ].map((placeholder, i) => (
        <input
          key={i}
          type="text"
          value={client.address[i]}
          onChange={(e) => onClientChange(`address${i}`, e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 transition-all duration-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          required={i === 0 || i === 2}
        />
      ))}
    </div>
  </div>
);