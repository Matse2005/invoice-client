// helpers/settings-handler.ts
import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';

const isProd = process.env.NODE_ENV === 'production';

// Define base directory based on environment
const getBaseDir = () => {
  if (isProd) {
    return app.getPath('userData');
  } else {
    // Create a development folder in the project root
    const devDir = path.join(app.getAppPath(), 'dev-data');
    if (!fs.existsSync(devDir)) {
      fs.mkdirSync(devDir, { recursive: true });
    }
    return devDir;
  }
};

const SETTINGS_FILE = path.join(getBaseDir(), 'settings.json');

export const setupSettingsHandlers = () => {
  // Get settings
  ipcMain.handle('get-settings', async () => {
    try {
      if (fs.existsSync(SETTINGS_FILE)) {
        const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Error reading settings:', error);
      throw error;
    }
  });

  // Save settings
  ipcMain.handle('save-settings', async (_, settings) => {
    try {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
      app.relaunch()
      app.exit()
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  });
};