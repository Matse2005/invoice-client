// components/DownloadInvoiceButton.tsx
import { useCallback, useState, useEffect } from 'react';
import { useInvoiceDownloading } from '../../utils/InvoiceDownload';

interface DownloadInvoiceButtonProps {
  invoiceId: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const DownloadInvoiceButton: React.FC<DownloadInvoiceButtonProps> = ({
  invoiceId,
  onSuccess,
  onError,
}) => {
  const { downloadInvoice, downloadProgress } = useInvoiceDownloading();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (downloadProgress.status === 'ready') {
      onSuccess?.();
    } else if (downloadProgress.status === 'error' && downloadProgress.error) {
      onError?.(downloadProgress.error);
    }
  }, [downloadProgress.status, onSuccess, onError]);

  const handleDownload = useCallback(() => {
    if (loading) return;
    setLoading(true);
    downloadInvoice(invoiceId);
    setLoading(false);
  }, [loading, downloadInvoice, invoiceId]);

  const getButtonText = useCallback(() => {
    switch (downloadProgress.status) {
      case 'downloading':
        // return `Downloaden... ${Math.round(downloadProgress.progress || 0)}%`;
        return `Downloaden...`;
      case 'preparing':
        return 'Voorbereiden...';
      case 'ready':
        return 'Download';
      case 'error':
        return 'Probeer Opnieuw';
      default:
        return 'Download';
    }
  }, [downloadProgress.status, downloadProgress.progress]);

  return (
    <button
      onClick={handleDownload}
      disabled={['downloading', 'preparing'].includes(downloadProgress.status)}
      className="px-4 py-2 text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 disabled:hover:bg-yellow-500 disabled:hover:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
    >
      <span className="flex items-center">
        {!loading ? (
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <div className="w-4 h-4 border-4 border-white rounded-full border-t-transparent animate-spin" />
          </div>
        )}
        {getButtonText()}
      </span>
    </button>
  );
};

export default DownloadInvoiceButton;