import { useEffect, useState } from 'react';

interface Printer {
  name: string;
  isDefault: boolean;
}

interface PrintProgress {
  status: 'idle' | 'fetching' | 'printing' | 'ready' | 'error';
  progress?: number;
  error?: string;
  availablePrinters?: Printer[];
}

export const useInvoicePrinting = () => {
  const [printProgress, setPrintProgress] = useState<PrintProgress>({
    status: 'idle'
  });

  useEffect(() => {
    const unsubscribe = window.ipc.on('invoice:print-progress',
      (progress: PrintProgress) => {
        setPrintProgress(progress);
      }
    );

    // Listen for printer list updates
    const unsubscribePrinters = window.ipc.on('invoice:printers-list',
      (printers: Printer[]) => {
        setPrintProgress(prev => ({
          ...prev,
          availablePrinters: printers
        }));
      }
    );

    return () => {
      unsubscribe();
      unsubscribePrinters();
    };
  }, []);

  const printInvoice = async (invoiceId: number, printerName: string, copies: number = 1) => {
    const url = "https://pdfobject.com/pdf/sample.pdf";
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    window.ipc.send('invoice:print-start', { invoiceId, url, apiKey, printerName, copies });
  };

  const getPrintersList = () => {
    window.ipc.send('invoice:get-printers');
  };

  return {
    printInvoice,
    getPrintersList,
    printProgress
  };
};