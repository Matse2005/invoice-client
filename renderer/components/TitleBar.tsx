import { useState, useEffect } from 'react';
import { MinusIcon, XMarkIcon, Square2StackIcon, StopIcon } from '@heroicons/react/24/outline';

const TitleBar = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  const minimizeWindow = () => window.ipc.send('window-minimize');
  const maximizeWindow = () => window.ipc.send('window-maximize');
  const closeWindow = () => window.ipc.send('window-close');

  useEffect(() => {
    // Listener for maximized and unmaximized events from main process
    window.ipc.on('window-maximized', () => setIsMaximized(true));
    window.ipc.on('window-unmaximized', () => setIsMaximized(false));
  }, []);

  return (
    <div className="flex items-center justify-between w-full h-8 select-none text-foreground bg-background">
      <div className="pl-4 text-sm font-medium -webkit-app-region-drag">
        Facturen
      </div>
      <div className="flex -webkit-app-region-no-drag">
        <button onClick={minimizeWindow} className="flex items-center justify-center w-10 h-8 hover:text-foreground-hover hover:bg-background-hover -webkit-app-region-no-drag">
          <span>
            <MinusIcon className='size-4' />
          </span>
        </button>
        <button onClick={maximizeWindow} className="flex items-center justify-center w-10 h-8 hover:text-foreground-hover hover:bg-background-hover -webkit-app-region-no-drag">
          <span>
            {isMaximized ? (
              <Square2StackIcon className="size-4 scale-x-[-1]" />
            ) : (
              <StopIcon className="size-4" />
            )}
          </span>
        </button>
        <button onClick={closeWindow} className="flex items-center justify-center w-10 h-8 hover:bg-red-600 hover:text-white -webkit-app-region-no-drag">
          <span>
            <XMarkIcon className='size-4' />
          </span>
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
