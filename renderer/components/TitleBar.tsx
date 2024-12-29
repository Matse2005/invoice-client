import { useState, useEffect } from 'react';
import { XMarkIcon, Square2StackIcon, StopIcon, Cog6ToothIcon, InformationCircleIcon, MinusIcon } from '@heroicons/react/24/outline';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';

const TitleBar = () => {
  const router = useRouter();
  const [isMaximized, setIsMaximized] = useState(false);
  const [version, setVersion] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');

  const minimizeWindow = () => window.ipc.send('window-minimize');
  const maximizeWindow = () => window.ipc.send('window-maximize');
  const closeWindow = () => window.ipc.send('window-close');
  const openSettings = () => router.push('/settings');

  const checkForUpdates = () => {
    setIsChecking(true);
    window.ipc.send('check-for-updates');
    setUpdateStatus('Controleren op updates...');
    // Reset checking state after 10 seconds in case no response is received
    setTimeout(() => {
      if (isChecking) {
        setIsChecking(false);
        setUpdateStatus('');
      }
    }, 10000);
  };

  useEffect(() => {
    const getVersion = async () => {
      const appVersion = await window.ipc.getVersion();
      setVersion(appVersion);
    };
    getVersion();

    const unsubMaximize = window.ipc.on('window-maximized', () => setIsMaximized(true));
    const unsubUnmaximize = window.ipc.on('window-unmaximized', () => setIsMaximized(false));
    const unsubUpdateMessage = window.ipc.on('message', (message: string) => {
      setUpdateStatus(message);
      if (!message.includes('Checking') && !message.includes('Downloaded')) {
        setIsChecking(false);
      }
    });

    return () => {
      unsubMaximize();
      unsubUnmaximize();
      unsubUpdateMessage();
    };
  }, []);

  return (
    <div className="relative">
      <div className="flex items-center justify-between w-full h-8 select-none text-foreground bg-background -webkit-app-region-drag">
        <div className="flex items-center gap-4 pl-4">
          <span className="text-sm font-medium -webkit-app-region-drag">Facturen</span>
          <div className="flex items-center gap-2 -webkit-app-region-no-drag">
            <button
              onClick={openSettings}
              className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md hover:text-foreground-hover hover:bg-background-hover transition-colors"
            >
              <Cog6ToothIcon className="w-4 h-4" />
              <span>Instellingen</span>
            </button>
            <button
              onClick={checkForUpdates}
              disabled={isChecking}
              className="flex items-center group gap-1.5 px-2 py-1 text-xs rounded-md hover:text-foreground-hover hover:bg-background-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed group relative"
            >
              <ArrowDownTrayIcon className={`w-4 h-4 ${isChecking ? 'animate-bounce' : ''}`} />
              <span>{isChecking ? 'Controleren...' : 'Updates'}</span>
              {updateStatus && (
                <div className="absolute left-0 z-50 hidden p-2 mt-1 text-xs border rounded-md shadow-lg group-hover:flex top-full bg-background border-border whitespace-nowrap">
                  {updateStatus}
                </div>
              )}
            </button>
            <div className="flex items-center gap-1.5 px-2 py-1 text-xs border-l border-border">
              <InformationCircleIcon className="w-3.5 h-3.5" />
              <span className="">v{version}</span>
            </div>
          </div>
        </div>
        <div className="flex -webkit-app-region-no-drag">
          <button
            onClick={minimizeWindow}
            className="flex items-center justify-center w-10 h-8 transition-colors hover:text-foreground-hover hover:bg-background-hover"
          >
            <MinusIcon className="w-4 h-4" />
          </button>
          <button
            onClick={maximizeWindow}
            className="flex items-center justify-center w-10 h-8 transition-colors hover:text-foreground-hover hover:bg-background-hover"
          >
            {isMaximized ? (
              <Square2StackIcon className="w-4 h-4 scale-x-[-1]" />
            ) : (
              <StopIcon className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={closeWindow}
            className="flex items-center justify-center w-10 h-8 transition-colors hover:bg-red-600 hover:text-white"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* Resize handles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 cursor-ns-resize"></div>
        <div className="absolute top-0 left-0 w-1 h-full cursor-ew-resize"></div>
        <div className="absolute top-0 right-0 w-1 h-full cursor-ew-resize"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 cursor-ns-resize"></div>
        <div className="absolute top-0 left-0 w-2 h-2 cursor-nwse-resize"></div>
        <div className="absolute top-0 right-0 w-2 h-2 cursor-nesw-resize"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 cursor-nesw-resize"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 cursor-nwse-resize"></div>
      </div>
    </div>
  );
};

export default TitleBar;