import { useEffect, useState } from 'react';

interface DownloadProgress {
  status: 'idle' | 'downloading' | 'preparing' | 'ready' | 'error';
  progress?: number;
  error?: string;
}

export const useInvoiceDownloading = () => {
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({
    status: 'idle'
  });

  useEffect(() => {
    const unsubscribe = window.ipc.on('invoice:download-progress',
      (progress: DownloadProgress) => {
        setDownloadProgress(progress);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const downloadInvoice = async (invoiceId: number) => {
    // const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const url = "https://pdfobject.com/pdf/sample.pdf";
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    window.ipc.send('invoice:download-start', { invoiceId, url, apiKey });
  };

  return {
    downloadInvoice,
    downloadProgress
  };
};