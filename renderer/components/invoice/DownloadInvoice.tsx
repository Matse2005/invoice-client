// src/renderer/components/DownloadInvoiceButton.tsx
import { useEffect } from 'react';
import { useInvoiceDownloading } from '../../utils/InvoiceDownload';

interface DownloadInvoiceButtonProps {
  invoiceId: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const DownloadInvoiceButton: React.FC<DownloadInvoiceButtonProps> = ({
  invoiceId,
  onSuccess,
  onError
}) => {
  const { downloadInvoice, downloadProgress } = useInvoiceDownloading();

  useEffect(() => {
    if (downloadProgress.status === 'ready') {
      onSuccess?.();
    } else if (downloadProgress.status === 'error' && downloadProgress.error) {
      onError?.(downloadProgress.error);
    }
  }, [downloadProgress.status]);

  const handleDownload = () => {
    downloadInvoice(invoiceId);
  };

  const getButtonText = () => {
    switch (downloadProgress.status) {
      case 'downloading':
        return `Downloading... ${Math.round(downloadProgress.progress || 0)}%`;
      case 'preparing':
        return 'Preparing...';
      case 'ready':
        return 'Download Invoice';
      case 'error':
        return 'Try Again';
      default:
        return 'Download Invoice';
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={['downloading', 'preparing'].includes(downloadProgress.status)}
      className="px-4 py-2 text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
    >
      <span className="flex items-center">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {getButtonText()}
      </span>
    </button>
  );
};

export default DownloadInvoiceButton;