import { useState, useEffect, useRef } from 'react';

interface InvoicePDFProps {
  url: string;
  number: number;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ url, number }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [height, setHeight] = useState<number>(600);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const updateHeight = (): void => {
      try {
        // Try to get the content height directly
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          const newHeight = Math.max(
            iframeDoc.documentElement.scrollHeight,
            iframeDoc.documentElement.offsetHeight,
            iframeDoc.body.scrollHeight,
            iframeDoc.body.offsetHeight
          );

          if (newHeight !== height && newHeight > 100) {
            setHeight(newHeight);
          }
        }
      } catch (error) {
        console.warn('Direct height measurement failed:', error);
      }
    };

    // Handle messages from the iframe content
    const handleMessage = (event: MessageEvent): void => {
      if (event.source === iframe.contentWindow) {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'resize' && typeof data.height === 'number') {
            setHeight(data.height);
          }
        } catch (e) {
          // Ignore non-JSON messages
        }
      }
    };

    // Add script to iframe content after load
    const injectResizeScript = (): void => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          const script = iframeDoc.createElement('script');
          script.textContent = `
            function sendHeight() {
              const height = Math.max(
                document.documentElement.scrollHeight,
                document.documentElement.offsetHeight,
                document.body.scrollHeight,
                document.body.offsetHeight
              );
              window.parent.postMessage(JSON.stringify({
                type: 'resize',
                height: height
              }), '*');
            }
            
            // Send height on load
            sendHeight();
            
            // Send height on any content changes
            new ResizeObserver(sendHeight).observe(document.body);
            
            // Send height on any dynamic content loads
            new MutationObserver(sendHeight).observe(document.body, {
              childList: true,
              subtree: true
            });
          `;
          iframeDoc.body.appendChild(script);
        }
      } catch (error) {
        console.warn('Script injection failed:', error);
      }
    };

    const handleIframeLoad = (): () => void => {
      setLoading(false);
      updateHeight();
      injectResizeScript();

      // Set up periodic height checks as fallback
      const intervalId = setInterval(updateHeight, 1000);
      return () => clearInterval(intervalId);
    };

    // Handle parent container/window resizing
    const handleResize = (): void => {
      requestAnimationFrame(updateHeight);
    };

    // Set up event listeners
    window.addEventListener('message', handleMessage);
    iframe.addEventListener('load', handleIframeLoad);
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('message', handleMessage);
      iframe.removeEventListener('load', handleIframeLoad);
      window.removeEventListener('resize', handleResize);
    };
  }, [height]);

  return (
    <div ref={containerRef} className="relative h-screen max-h-[600px]" style={{ height: `${height}px` }}>
      <iframe
        ref={iframeRef}
        src={url}
        title={`Factuur #${number}`}
        className="w-full h-full border-0 rounded"
        onLoad={() => setLoading(false)}
      // sandbox="allow-same-origin allow-scripts"
      >
        <p>
          Je browser ondersteunt geen PDF-weergave.{' '}
          <a href={url}>Download het PDF-bestand</a>.
        </p>
      </iframe>

      {loading && (
        <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full">
          <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
};

export default InvoicePDF;