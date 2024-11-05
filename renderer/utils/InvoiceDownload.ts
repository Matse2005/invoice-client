import { useCallback, useState, useEffect } from 'react';
import InvoicesService from '../services/InvoicesService';

interface DownloadProgress {
  status: 'idle' | 'downloading' | 'preparing' | 'ready' | 'error';
  progress?: number;
  error?: string;
}

export const useInvoiceDownloading = () => {
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({
    status: 'idle',
  });
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = window.ipc.on(
      'invoice:download-progress',
      (progress: DownloadProgress) => {
        setDownloadProgress(progress);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const downloadInvoice = useCallback(async (invoiceId: number) => {
    try {
      const pdfUrl = await getPdf(invoiceId);
      if (pdfUrl) {
        window.ipc.send('invoice:download-start', { invoiceId, url: pdfUrl });
      }
    } catch (e) {
      setError('Failed to start the download.');
      console.error('Error starting download:', e);
    }
  }, []);

  const getPdf = useCallback(async (id: number) => {
    try {
      const response = await InvoicesService.fetchPdf(id);
      const json = await response.json();
      setPdfUrl(json.link);
      return json.link;
    } catch (e) {
      setError('Error fetching invoice.');
      console.error('Error fetching invoice:', e);
      throw e;
    }
  }, []);

  return {
    downloadInvoice,
    downloadProgress,
    error,
  };
};