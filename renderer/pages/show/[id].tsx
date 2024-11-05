import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import InvoicesService from '../../services/InvoicesService';
import { Invoice } from '../../types';
import { useRouter } from 'next/router';
import ShareInvoiceButton from '../../components/invoice/ShareInvoice';
import DownloadInvoiceButton from '../../components/invoice/DownloadInvoice';

const ShowPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [invoice, setInvoice] = useState<Invoice>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingIFrame, setLoadingIFrame] = useState<boolean>(true);
  const [error, setError] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const getInvoice = async () => {
    try {
      const response = await InvoicesService.getById({ id: Number(id) });
      const json = await response.json();
      setInvoice(json);
    } catch (e) {
      setError('Er is iets misgegaan bij het ophalen van de factuur.');
      console.error('Error fetching invoice:', e);
    } finally {
      setLoading(false);
    }
  };

  const getPdf = async () => {
    try {
      const response = await InvoicesService.fetchPdf(Number(id));
      const json = await response.json();
      setPdfUrl(json.link);
    } catch (e) {
      setError('Er is iets misgegaan bij het ophalen van de factuur.');
      console.error('Error fetching invoice:', e);
    }
  }

  useEffect(() => {
    if (id) {
      getPdf();
      getInvoice();
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      await InvoicesService.deleteInvoice(Number(id));
      router.push('/');
    } catch (e) {
      setError('Er is iets misgegaan bij het verwijderen van de factuur.');
      console.error('Error deleting invoice:', e);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleEdit = () => {
    router.push(`/update/${id}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `factuur_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShareSuccess = () => {
    console.log('Email client opened! Attach the PDF file that was opened in your file explorer.');
  };

  const handleShareError = (error: string) => {
    console.error('Failed to share invoice: ' + error);
  };

  // Click outside modal handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const modal = document.getElementById('delete-modal');
      if (modal && !modal.contains(event.target as Node)) {
        setShowDeleteModal(false);
      }
    };

    if (showDeleteModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDeleteModal]);

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDeleteModal(false);
      }
    };

    if (showDeleteModal) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showDeleteModal]);

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
        <title>{invoice ? `Factuur #${invoice.number}` : 'Onbekend factuur'}</title>
      </Head>

      <div className="container px-4 py-8 mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Factuur #{invoice.number}</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Terug
          </button>
        </div>

        {error && (
          <div className="p-4 mb-6 text-white bg-red-500 rounded-lg">
            <h3 className="font-bold">Error</h3>
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Client Information */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-xl font-semibold">Klant Informatie</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-sm font-medium text-gray-500">Naam</p>
                <p className="text-gray-900">{invoice.client.name}</p>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-gray-500">BTW Nummer</p>
                <p className="text-gray-900">{invoice.client.btw || '-'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="mb-1 text-sm font-medium text-gray-500">Adres</p>
                {invoice.client.address.map((line, index) => (
                  <p key={index} className="text-gray-900">{line || '-'}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-xl font-semibold">Factuur Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-sm font-medium text-gray-500">Datum</p>
                <p className="text-gray-900">
                  {new Date(invoice.date).toLocaleDateString('nl-NL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-gray-500">BTW Type</p>
                <p className="text-gray-900">{invoice.btw ? 'Reguliere BTW' : 'Bijzondere regeling'}</p>
              </div>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-xl font-semibold">Factuur PDF</h2>
            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center w-full gap-4 mb-4">
              <button
                onClick={handleEdit}
                className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Bewerk
                </span>
              </button>

              {/* <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Verwijder
              </span>
            </button> */}

              {/* <button
                onClick={handlePrint}
                className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Afdrukken
                </span>
              </button> */}

              <DownloadInvoiceButton
                invoiceId={invoice.id}
                onSuccess={handleShareSuccess}
                onError={handleShareError}
              />
              {/* <ShareInvoiceButton
                invoiceId={invoice.id}
                onSuccess={handleShareSuccess}
                onError={handleShareError}
              /> */}
            </div>
            <div className="h-screen max-h-[600px] relative">
              <iframe
                src={pdfUrl}
                title={`Factuur #${invoice.number}`}
                className="w-full h-full border-0 rounded"
                onLoad={() => setLoadingIFrame(false)}
              >
                <p>Je browser ondersteunt geen PDF-weergave. <a href={pdfUrl}>Download het PDF-bestand</a>.</p>
              </iframe>
              {loadingIFrame && (
                <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full">
                  <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div id="delete-modal" className="p-6 mx-4 bg-white rounded-lg shadow-xl sm:mx-0 sm:w-full sm:max-w-lg">
            <h3 className="text-lg font-bold text-gray-900">
              Factuur verwijderen
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Weet je zeker dat je factuur #{invoice.number} wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
              </p>
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Annuleren
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShowPage;