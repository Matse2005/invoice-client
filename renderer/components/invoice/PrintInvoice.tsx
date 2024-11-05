// src/renderer/components/PrintInvoiceButton.tsx
import React, { useEffect, useState } from 'react';
import { useInvoicePrinting } from '../../utils/InvoicePrint';

interface PrintInvoiceButtonProps {
  invoiceId: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const PrintInvoiceButton: React.FC<PrintInvoiceButtonProps> = ({
  invoiceId,
  onSuccess,
  onError
}) => {
  const { printInvoice, getPrintersList, printProgress } = useInvoicePrinting();
  const [showPrinterSelect, setShowPrinterSelect] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState('');

  useEffect(() => {
    if (showPrinterSelect) {
      getPrintersList();
    }
  }, [showPrinterSelect]);

  useEffect(() => {
    if (printProgress.status === 'ready') {
      setShowPrinterSelect(false);
      onSuccess?.();
    } else if (printProgress.status === 'error' && printProgress.error) {
      onError?.(printProgress.error);
    }
  }, [printProgress.status]);

  const handlePrintClick = () => {
    setShowPrinterSelect(true);
  };

  const handlePrint = () => {
    if (selectedPrinter) {
      printInvoice(invoiceId, selectedPrinter, 2); // Print 2 copies
      setShowPrinterSelect(false);
    }
  };

  const getButtonText = () => {
    switch (printProgress.status) {
      case 'fetching':
        return `Preparing... ${Math.round(printProgress.progress || 0)}%`;
      case 'printing':
        return 'Printing...';
      case 'ready':
        return 'Print Invoice';
      case 'error':
        return 'Try Again';
      default:
        return 'Print Invoice';
    }
  };

  return (
    <>
      <button
        onClick={handlePrintClick}
        disabled={['fetching', 'printing'].includes(printProgress.status)}
        className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          {getButtonText()}
        </span>
      </button>

      {showPrinterSelect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-6 mx-4 bg-white rounded-lg shadow-xl sm:mx-0 sm:w-full sm:max-w-lg">
            <h3 className="text-lg font-bold text-gray-900">
              Select Printer
            </h3>
            <div className="mt-4">
              <select
                value={selectedPrinter}
                onChange={(e) => setSelectedPrinter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select a printer...</option>
                {printProgress.availablePrinters?.map((printer) => (
                  <option key={printer.name} value={printer.name}>
                    {printer.name} {printer.isDefault ? '(Default)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setShowPrinterSelect(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Annuleren
              </button>
              <button
                onClick={handlePrint}
                disabled={!selectedPrinter}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-300"
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PrintInvoiceButton;