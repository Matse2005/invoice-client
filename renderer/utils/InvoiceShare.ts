// src/renderer/utils/invoiceService.ts
import { useEffect, useState } from 'react';

interface ShareProgress {
  status: 'idle' | 'downloading' | 'preparing' | 'ready' | 'error';
  progress?: number;
  error?: string;
}

export const useInvoiceSharing = () => {
  const [shareProgress, setShareProgress] = useState<ShareProgress>({
    status: 'idle'
  });

  useEffect(() => {
    const unsubscribe = window.ipc.on('invoice:share-progress',
      (progress: ShareProgress) => {
        setShareProgress(progress);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const shareInvoice = async (invoiceId: number) => {
    // const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const url = "https://pdfobject.com/pdf/sample.pdf";
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    window.ipc.send('invoice:share-start', { invoiceId, url, apiKey });
  };

  return {
    shareInvoice,
    shareProgress
  };
};