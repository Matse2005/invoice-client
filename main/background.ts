import path from 'path'
import { app, ipcMain, shell } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import fs from 'fs'
import os from 'os'
import { setupInvoiceHandlers } from './helpers/invoice-handler'

const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

; (async () => {
  await app.whenReady()

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    frame: false, // Disables the default title bar
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
  })

  if (isProd) {
    await mainWindow.loadURL('app://./home')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/`)
    mainWindow.webContents.openDevTools()
  }

  setupInvoiceHandlers();

  // IPC listeners for window control
  mainWindow.on('maximize', () => mainWindow.webContents.send('window-maximized'));
  mainWindow.on('unmaximize', () => mainWindow.webContents.send('window-unmaximized'));

  ipcMain.on('window-minimize', () => mainWindow.minimize());
  ipcMain.on('window-maximize', () => {
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
  });
  ipcMain.on('window-close', () => mainWindow.close());
})()

app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`)
})

ipcMain.handle('share-invoice', async (event, { invoiceId, apiUrl, apiKey }) => {
  try {
    // 1. Get PDF from your API
    // const response = await fetch(`${apiUrl}/api/invoices/${invoiceId}/pdf`, {
    //   headers: {
    //     "Authorization": apiKey,
    //   },
    // });
    const response = await fetch(`https://pdfobject.com/pdf/sample.pdf`);
    const arrayBuffer = await response.arrayBuffer();

    // 2. Save to temp directory
    const tempPath = path.join(os.tmpdir(), `invoice-${invoiceId}.pdf`);
    fs.writeFileSync(tempPath, Buffer.from(arrayBuffer));

    // 3. Open default mail client
    const mailtoLink = `mailto:?subject=Your Invoice&body=Please find your invoice attached`;
    shell.openExternal(mailtoLink);

    // 4. Show the file in explorer
    shell.showItemInFolder(tempPath);

    // 5. Schedule cleanup
    setTimeout(() => {
      try {
        fs.unlinkSync(tempPath);
      } catch (e) {
        console.error('Error cleaning up temp file:', e);
      }
    }, 60000);

    return { success: true, path: tempPath };
  } catch (error) {
    console.error('Error in share-invoice:', error);
    return { success: false, error: error.message };
  }
});
