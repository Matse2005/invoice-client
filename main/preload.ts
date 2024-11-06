import { contextBridge, ipcRenderer, IpcRendererEvent, app } from 'electron';

const handler = {
  send(channel: string, value: unknown = null) {
    ipcRenderer.send(channel, value);
  },
  invoke(channel: string, value: unknown = null) {
    return ipcRenderer.invoke(channel, value);
  },
  on(channel: string, callback: (...args: unknown[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
      callback(...args);
    ipcRenderer.on(channel, subscription);
    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },
  getVersion() {
    return ipcRenderer.invoke('get-version');
  }
};

contextBridge.exposeInMainWorld('ipc', handler);

export type IpcHandler = typeof handler;