import { useState, useEffect } from 'react';
import { MinusIcon, XMarkIcon, Square2StackIcon, StopIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';

const TitleBar = () => {
  const router = useRouter();
  const [isMaximized, setIsMaximized] = useState(false);

  const minimizeWindow = () => window.ipc.send('window-minimize');
  const maximizeWindow = () => window.ipc.send('window-maximize');
  const closeWindow = () => window.ipc.send('window-close');
  const openSettings = () => router.push('/settings');

  useEffect(() => {
    // Listener for maximized and unmaximized events from main process
    window.ipc.on('window-maximized', () => setIsMaximized(true));
    window.ipc.on('window-unmaximized', () => setIsMaximized(false));
  }, []);

  return (
    <div className="flex items-center justify-between w-full h-8 select-none text-foreground bg-background">
      <div className="flex items-center gap-4 pl-4 -webkit-app-region-drag">
        <span className="text-sm font-medium">Facturen</span>
        <button
          onClick={openSettings}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded-md hover:text-foreground-hover hover:bg-background-hover -webkit-app-region-no-drag"
        >
          <Cog6ToothIcon className="w-4 h-4" />
          <span>Instellingen</span>
        </button>
      </div>
      <div className="flex -webkit-app-region-no-drag">
        <button
          onClick={minimizeWindow}
          className="flex items-center justify-center w-10 h-8 hover:text-foreground-hover hover:bg-background-hover"
        >
          <MinusIcon className="w-4 h-4" />
        </button>
        <button
          onClick={maximizeWindow}
          className="flex items-center justify-center w-10 h-8 hover:text-foreground-hover hover:bg-background-hover"
        >
          {isMaximized ? (
            <Square2StackIcon className="w-4 h-4 scale-x-[-1]" />
          ) : (
            <StopIcon className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={closeWindow}
          className="flex items-center justify-center w-10 h-8 hover:bg-red-600 hover:text-white"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
