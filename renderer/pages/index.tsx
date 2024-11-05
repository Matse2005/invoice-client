import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import InvoicesService from '../services/InvoicesService';

const IndexPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  const getAllInvoices = async () => {
    try {
      setLoading(true);
      const response = await InvoicesService.getAll();
      const json = await response.json();
      setInvoices(json);
      setFilteredInvoices(json);
    } catch (e) {
      setError('Er is iets misgegaan bij het ophalen van de facturen.');
      console.error('Error fetching invoices:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllInvoices();
  }, []);

  useEffect(() => {
    let result = [...invoices];

    // Filter by search term
    if (searchTerm) {
      result = result.filter(invoice =>
        invoice.number.toString().includes(searchTerm) ||
        invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by number
    result.sort((a, b): any => {
      return sortOrder === 'desc' ? b.number - a.number : a.number - b.number;
    });

    setFilteredInvoices(result);
  }, [invoices, searchTerm, sortOrder]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Facturen Dashboard</title>
      </Head>

      <div className="container px-4 py-8 mx-auto max-w-7xl">
        {error && (
          <div className="p-4 mb-6 text-white bg-red-500 rounded-lg">
            <h3 className="font-bold">Error</h3>
            <p>{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Facturen</h1>
          <Link href="/store">
            <button className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nieuwe Factuur
              </span>
            </button>
          </Link>
        </div>

        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="p-4 space-y-4 border-b">
            <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Zoek op factuurnummer of klantnaam..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <svg
                    className="absolute w-5 h-5 text-gray-400 left-3 top-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                  {sortOrder === 'desc' ? 'Nieuwste eerst' : 'Oudste eerst'}
                </span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredInvoices.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                Geen facturen gevonden
              </div>
            ) : (
              filteredInvoices.map((invoice) => (
                <Link key={invoice.id} href={`/show/${invoice.id}`}>
                  <div className="p-4 transition-colors cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Factuur #{invoice.number}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(invoice.date).toLocaleDateString('nl-NL', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{invoice.client.name}</p>
                        <p className="text-sm text-gray-500">
                          Reguliere BTW: {invoice.btw ? 'Ja' : 'Nee'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default IndexPage;