import { dialog, ipcMain, shell, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';
import os from 'os';

interface InvoiceParams {
  invoiceId: number,
  url: string;
}

interface PrintParams extends InvoiceParams {
  printerName: string;
  copies: number;
}

interface InvoiceProgress {
  status: 'downloading' | 'preparing' | 'ready' | 'error' | 'fetching' | 'printing';
  progress?: number;
  error?: string;
}

const fetchAndSavePDF = async (
  invoiceId: number,
  url: string,
  event: Electron.IpcMainEvent,
  progressCallback: (progress: InvoiceProgress) => void,
  savePath?: string
): Promise<string | undefined> => {
  const response = await fetch(url);

  const totalSize = Number(response.headers.get('content-length'));
  const chunks: Uint8Array[] = [];

  if (response.body) {
    const reader = response.body.getReader();
    let currentSize = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          currentSize += value.length;
          progressCallback({
            status: 'downloading',
            progress: (currentSize / totalSize) * 100,
          });
        }
      }

      // Notify preparing file
      progressCallback({ status: 'preparing', progress: 100 });

      // Save to specified path
      const buffer = Buffer.concat(chunks);
      const finalPath = savePath || path.join(os.tmpdir(), `invoice-${invoiceId}.pdf`);
      fs.writeFileSync(finalPath, buffer);

      return finalPath;
    } catch (error) {
      console.error('Error reading response stream:', error);
      progressCallback({
        status: 'error',
        error: error.message,
      });
    }
  }
};

const handleInvoiceShare = async (event: Electron.IpcMainEvent, params: InvoiceParams) => {
  const { invoiceId, url } = params;

  try {
    event.reply('invoice:share-progress', { status: 'downloading', progress: 0 });

    const tempPath = await fetchAndSavePDF(invoiceId, url, event, (progress) => {
      event.reply('invoice:share-progress', progress);
    }, path.join(os.tmpdir(), `invoice-${invoiceId}.pdf`));

    if (tempPath) {
      // Open default mail client
      const mailtoLink = `mailto:?subject=Your Invoice&body=Please find your invoice attached`;
      shell.openExternal(mailtoLink);

      // Show the file in explorer
      shell.showItemInFolder(tempPath);

      event.reply('invoice:share-progress', { status: 'ready' });

      // Schedule cleanup
      setTimeout(() => {
        try {
          fs.unlinkSync(tempPath);
        } catch (e) {
          console.error('Error cleaning up temp file:', e);
        }
      }, 60000);
    }

  } catch (error) {
    console.error('Error in share-invoice:', error);
    event.reply('invoice:share-progress', { status: 'error', error: error.message });
  }
};

const handleInvoiceDownload = async (event: Electron.IpcMainEvent, params: InvoiceParams) => {
  const { invoiceId, url } = params;

  try {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Factuur Opslaan',
      defaultPath: `factuur-${invoiceId}.pdf`,
      filters: [{ name: 'PDF Bestanden', extensions: ['pdf'] }],
    });

    if (canceled || !filePath) {
      event.reply('invoice:download-progress', { status: 'error', error: 'User canceled the save dialog' });
      return;
    }

    event.reply('invoice:download-progress', { status: 'downloading', progress: 0 });

    await fetchAndSavePDF(invoiceId, url, event, (progress) => {
      event.reply('invoice:download-progress', progress);
    }, filePath);

    event.reply('invoice:download-progress', { status: 'ready' });
    shell.showItemInFolder(filePath);

  } catch (error) {
    console.error('Error in download-invoice:', error);
    event.reply('invoice:download-progress', { status: 'error', error: error.message });
  }
};

const handleGetPrinters = (event: Electron.IpcMainEvent) => {
  // const printers = printer.getPrinterList();
  // const formattedPrinters = printers.map(p => ({
  //   name: p.name,
  //   isDefault: p.isDefault || false
  // }));
  // event.reply('invoice:printers-list', formattedPrinters);
  event.reply('invoice:printers-list', []);
};

const handlePrintInvoice = async (event: Electron.IpcMainEvent, params: PrintParams) => {
  const { invoiceId, url, printerName, copies } = params;

  try {
    event.reply('invoice:print-progress', { status: 'fetching', progress: 0 });

    const tempPath = await fetchAndSavePDF(invoiceId, url, event, (progress) => {
      event.reply('invoice:print-progress', progress);
    }, path.join(os.tmpdir(), `invoice-${invoiceId}-print.pdf`));

    if (tempPath) {
      const mainWindow = BrowserWindow.getAllWindows().find(w => w.isVisible());

      if (mainWindow) {
        event.reply('invoice:print-progress', { status: 'printing' });

        for (let i = 0; i < copies; i++) {
          await mainWindow.webContents.print({
            silent: true,
            printBackground: true,
            deviceName: printerName
          });
        }

        // Cleanup
        fs.unlinkSync(tempPath);
        event.reply('invoice:print-progress', { status: 'ready' });
      }
    }
  } catch (error) {
    console.error('Error in print-invoice:', error);
    event.reply('invoice:print-progress', { status: 'error', error: error.message });
  }
};

export const setupInvoiceHandlers = () => {
  // Handle the share invoice request
  ipcMain.on('invoice:share-start', (event, params: InvoiceParams) => handleInvoiceShare(event, params));

  // Handle the download invoice request
  ipcMain.on('invoice:download-start', (event, params: InvoiceParams) => handleInvoiceDownload(event, params));

  // Handle printer requests
  ipcMain.on('invoice:get-printers', handleGetPrinters);
  ipcMain.on('invoice:print-start', (event, params: PrintParams) => handlePrintInvoice(event, params));
};