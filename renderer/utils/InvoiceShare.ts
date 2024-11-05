import { useEffect, useState } from 'react';
import InvoicesService from '../services/InvoicesService'; // Adjust the import path as needed

interface ShareProgress {
  status: 'idle' | 'downloading' | 'preparing' | 'ready' | 'error';
  progress?: number;
  error?: string;
}

export const useInvoiceSharing = () => {
  const [shareProgress, setShareProgress] = useState<ShareProgress>({
    status: 'idle'
  });
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = window.ipc.on(
      'invoice:share-progress',
      (progress: ShareProgress) => {
        setShareProgress(progress);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const getInvoiceUrl = async (invoiceId: number) => {
    try {
      // Fetch the invoice URL using InvoicesService
      const response = await InvoicesService.fetchPdf(invoiceId);
      const json = await response.json();
      setShareUrl(json.link);
      setShareProgress({ status: 'ready' });
    } catch (e) {
      setError('Er is iets misgegaan bij het ophalen van de factuur.');
      console.error('Error fetching invoice URL:', e);
      setShareProgress({ status: 'error', error: 'Failed to fetch invoice URL.' });
    }
  };

  const shareInvoice = async (invoiceId: number) => {
    // Make sure the share URL is fetched before sharing
    if (!shareUrl) {
      await getInvoiceUrl(invoiceId);
    }

    if (shareUrl) {
      window.ipc.send('invoice:share-start', { invoiceId, url: shareUrl });
    }
  };

  return {
    shareInvoice,
    shareProgress,
    shareUrl,
    error
  };
};
