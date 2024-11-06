import { autoUpdater, AppUpdater } from 'electron-updater';
import { BrowserWindow, app } from 'electron';
import log from 'electron-log';
import bytes from 'bytes';

export class AutoUpdaterHelper {
  private appUpdater: AppUpdater;
  private updateDownloaded: boolean = false;

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
      this.sendStatusToWindow('Controleren op updates...');
    });

    this.appUpdater.on('update-available', (info) => {
      this.sendStatusToWindow('Update beschikbaar, downloaden...');
      this.appUpdater.downloadUpdate();
    });

    this.appUpdater.on('update-not-available', (info) => {
      this.sendStatusToWindow('Geen updates beschikbaar.');
    });

    this.appUpdater.on('error', (err) => {
      this.sendStatusToWindow('Fout tijdens updaten: ' + err);
    });

    this.appUpdater.on('download-progress', (progressObj) => {
      let logMessage = `Download Snelheid: ${bytes(progressObj.bytesPerSecond)}/s`;
      logMessage += ` - Gedownload ${progressObj.percent.toFixed(2)}%`;
      logMessage += ` (${bytes(progressObj.transferred)} / ${bytes(progressObj.total)})`;
      this.sendStatusToWindow(logMessage);
    });

    this.appUpdater.on('update-downloaded', (info) => {
      this.updateDownloaded = true;
      this.sendStatusToWindow('Update gedownload, klaar voor installatie.');
    });
  }

  public checkForUpdatesAndNotify() {
    this.appUpdater.checkForUpdatesAndNotify();
  }

  public installUpdate() {
    if (this.updateDownloaded) {
      this.appUpdater.quitAndInstall(true, true);
    } else {
      this.sendStatusToWindow('Geen update beschikbaar om te installeren.');
    }
  }

  private sendStatusToWindow(text: string) {
    log.info(text);
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      mainWindow.webContents.send('message', text);
    }
  }
}