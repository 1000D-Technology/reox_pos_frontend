const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Determine if we are in development mode based on an environment variable or simple logic
const isDev = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

let mainWindow;
let workerWindow; // Keep reference to prevent GC

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      // Security best practices
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: "REOX POS",
    icon: path.join(__dirname, '../public/favicon.ico') // Adjust if icon exists
  });

  // Load the app
  // In dev, we wait for localhost:5173
  // In prod, we load the index.html
  const startURL = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startURL);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => (mainWindow = null));
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handler for Silent Printing
ipcMain.handle('print-silent', async (event, content) => {
    return new Promise((resolve, reject) => {
        try {
            // Create a hidden window
            workerWindow = new BrowserWindow({ 
                show: false, 
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true
                } 
            });

            // Load the HTML content
            const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(content);
            workerWindow.loadURL(dataUrl);

            workerWindow.webContents.once('did-finish-load', () => {
                workerWindow.webContents.print({
                    silent: true,
                    printBackground: true
                }, (success, errorType) => {
                    if (!success) {
                        console.error("Print failed:", errorType);
                        reject(errorType);
                    } else {
                         resolve(true);
                    }
                    // Close the worker window
                    if (workerWindow) {
                        workerWindow.close();
                        workerWindow = null;
                    }
                });
            });
            
            // Handle load errors
            workerWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
                 reject(`Failed to load content: ${errorDescription}`);
                 if (workerWindow) {
                     workerWindow.close();
                     workerWindow = null;
                 }
            });

        } catch (error) {
            reject(error);
        }
    });
});
