// src/renderer/components/ShareInvoiceButton.tsx
import { useEffect } from 'react';
import { useInvoiceSharing } from '../../utils/InvoiceShare';

interface ShareInvoiceButtonProps {
  invoiceId: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const ShareInvoiceButton: React.FC<ShareInvoiceButtonProps> = ({
  invoiceId,
  onSuccess,
  onError
}) => {
  const { shareInvoice, shareProgress } = useInvoiceSharing();

  useEffect(() => {
    if (shareProgress.status === 'ready') {
      onSuccess?.();
    } else if (shareProgress.status === 'error' && shareProgress.error) {
      onError?.(shareProgress.error);
    }
  }, [shareProgress.status]);

  const handleShare = () => {
    shareInvoice(invoiceId);
  };

  const getButtonText = () => {
    switch (shareProgress.status) {
      case 'downloading':
        return `Downloading... ${Math.round(shareProgress.progress || 0)}%`;
      case 'preparing':
        return 'Preparing...';
      case 'ready':
        return 'Share Invoice';
      case 'error':
        return 'Try Again';
      default:
        return 'Share Invoice';
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={['downloading', 'preparing'].includes(shareProgress.status)}
      className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      <span className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-4 h-4 mr-2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
        </svg>
        {getButtonText()}
      </span >
    </button >
  );
};

export default ShareInvoiceButton;