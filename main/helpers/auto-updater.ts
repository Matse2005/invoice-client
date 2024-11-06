import { autoUpdater, AppUpdater } from 'electron-updater';
import { BrowserWindow } from 'electron';
import log from 'electron-log';
import bytes from 'bytes';

export class AutoUpdaterHelper {
  private appUpdater: AppUpdater;

  constructor() {
    this.appUpdater = this.getAutoUpdater();
    this.setupAutoUpdater();
  }

  private getAutoUpdater(): AppUpdater {
    return autoUpdater;
  }

  private setupAutoUpdater() {
    this.appUpdater.logger = log;
    // this.appUpdater.logger.transports.file.level = 'info';

    this.appUpdater.on('checking-for-update', () => {
      this.sendStatusToWindow('Checking for update...');
    });

    this.appUpdater.on('update-available', (info) => {
      this.sendStatusToWindow('Update available.');
    });

    this.appUpdater.on('update-not-available', (info) => {
      this.sendStatusToWindow('Update not available.');
    });

    this.appUpdater.on('error', (err) => {
      this.sendStatusToWindow('Error in auto-updater. ' + err);
    });

    this.appUpdater.on('download-progress', (progressObj) => {
      let logMessage = `Download Snelheid: ${bytes(progressObj.bytesPerSecond)}/s`;
      logMessage += ` - Gedownload ${progressObj.percent.toFixed(2)}%`;
      logMessage += ` (${bytes(progressObj.transferred)} / ${bytes(progressObj.total)})`;
      this.sendStatusToWindow(logMessage);
    });

    this.appUpdater.on('update-downloaded', (info) => {
      this.sendStatusToWindow('Update downloaded');
      this.appUpdater.quitAndInstall(true, true);
    });
  }

  public checkForUpdatesAndNotify() {
    this.appUpdater.checkForUpdatesAndNotify();
  }

  private sendStatusToWindow(text: string) {
    log.info(text);
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      mainWindow.webContents.send('message', text);
    }
  }
}