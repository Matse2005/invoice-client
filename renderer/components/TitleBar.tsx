import { useState, useEffect } from 'react';
import { XMarkIcon, Square2StackIcon, StopIcon, Cog6ToothIcon, InformationCircleIcon, MinusIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';

const TitleBar = () => {
  const router = useRouter();
  const [isMaximized, setIsMaximized] = useState(false);
  const [version, setVersion] = useState<string>('');

  const minimizeWindow = () => window.ipc.send('window-minimize');
  const maximizeWindow = () => window.ipc.send('window-maximize');
  const closeWindow = () => window.ipc.send('window-close');
  const openSettings = () => router.push('/settings');

  useEffect(() => {
    const getVersion = async () => {
      const appVersion = await window.ipc.getVersion();
      setVersion(appVersion);
    };
    getVersion();

    const unsubMaximize = window.ipc.on('window-maximized', () => setIsMaximized(true));
    const unsubUnmaximize = window.ipc.on('window-unmaximized', () => setIsMaximized(false));

    return () => {
      unsubMaximize();
      unsubUnmaximize();
    };
  }, []);

  return (
    <div className="flex items-center justify-between w-full h-8 select-none text-foreground bg-background">
      <div className="flex items-center gap-4 pl-4 -webkit-app-region-drag">
        <span className="text-sm font-medium">Facturen</span>
        <div className="flex items-center gap-2 -webkit-app-region-no-drag">
          <button
            onClick={openSettings}
            className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md hover:text-foreground-hover hover:bg-background-hover transition-colors"
          >
            <Cog6ToothIcon className="w-4 h-4" />
            <span>Instellingen</span>
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
  );
};

export default TitleBar;