const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

let mainWindow;
let backendProcess;
const isDev = !app.isPackaged;
const isPackaged = app.isPackaged;

// Configure logging
log.transports.file.level = 'info';
autoUpdater.logger = log;

// Auto-updater configuration
autoUpdater.autoDownload = false; // Don't auto-download, let user choose
autoUpdater.autoInstallOnAppQuit = true;

// Update check interval (4 hours)
const UPDATE_CHECK_INTERVAL = 4 * 60 * 60 * 1000;

// Prevent multiple instances - CRITICAL for preventing window loops
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log('Another instance is already running. Quitting...');
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Determine paths based on whether app is packaged
const getResourcePath = (relativePath) => {
  if (isPackaged) {
    // With extraResources mapping "to": "backend", it's in process.resourcesPath/backend
    return path.join(process.resourcesPath, relativePath);
  }
  // In development, use project root
  return path.resolve(__dirname, '..', relativePath);
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    icon: path.join(__dirname, '../public/icon.png'),
    autoHideMenuBar: true,
    show: false,
    fullscreen: false
  });

  // Show window when ready to avoid flickering
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Load the app
  if (isDev) {
    // Development mode - load from Vite dev server
    mainWindow.loadURL('http://127.0.0.1:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Production mode - load from built files
    const indexPath = path.join(__dirname, '../dist/index.html');
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startBackend() {
  return new Promise((resolve, reject) => {
    const backendPath = getResourcePath('backend');
    const backendIndexPath = path.join(backendPath, 'index.js');
    const envPath = path.join(backendPath, '.env');

    console.log('Starting backend...');
    console.log('Backend path:', backendPath);
    console.log('Backend index:', backendIndexPath);
    console.log('Env file:', envPath);

    // Verify backend files exist
    if (!fs.existsSync(backendIndexPath)) {
      const error = `Backend index.js not found at: ${backendIndexPath}`;
      console.error(error);
      reject(new Error(error));
      return;
    }

    if (!fs.existsSync(envPath)) {
      console.warn(`Warning: .env file not found at: ${envPath}`);
    }

    // Determine node executable path
    let nodePath = 'node'; // Default to system node
    
    if (isPackaged) {
      console.log('App is packaged, checking for bundled node...');
      // If we had bundled node, we would check for it here. 
      // For now, we rely on system node or user can bundle it in extraResources.
    }

    console.log('Using Node.js at:', nodePath);

    // Start the backend process
    backendProcess = spawn(nodePath, [backendIndexPath], {
      cwd: backendPath,
      env: {
        ...process.env,
        NODE_ENV: isPackaged ? 'production' : 'development'
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    backendProcess.stdout.on('data', (data) => {
      console.log(`[Backend]: ${data.toString()}`);
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`[Backend Error]: ${data.toString()}`);
    });

    backendProcess.on('error', (error) => {
      console.error('Failed to start backend:', error);
      reject(error);
    });

    backendProcess.on('exit', (code, signal) => {
      console.log(`Backend process exited with code ${code} and signal ${signal}`);
      if (code !== 0 && code !== null) {
        reject(new Error(`Backend exited with code ${code}`));
      }
    });

    // Wait for backend to start (check if port 3000 is listening)
    const maxAttempts = 30;
    let attempts = 0;
    
    const checkBackend = setInterval(() => {
      attempts++;
      
      if (attempts >= maxAttempts) {
        clearInterval(checkBackend);
        reject(new Error('Backend failed to start within timeout'));
        return;
      }

      // Try to connect to backend
      const http = require('http');
      const req = http.get('http://127.0.0.1:3000/api/health', (res) => {
        if (res.statusCode === 200 || res.statusCode === 404) {
          clearInterval(checkBackend);
          console.log('Backend is ready!');
          resolve();
        }
      });

      req.on('error', () => {
        // Backend not ready yet, continue checking
      });

      req.end();
    }, 1000);
  });
}

function stopBackend() {
  if (backendProcess) {
    console.log('Stopping backend...');
    backendProcess.kill();
    backendProcess = null;
  }
}

// App lifecycle
app.whenReady().then(async () => {
  try {
    // In development, backend is already running separately
    // In production, we need to start it
    if (!isDev) {
      await startBackend();
    } else {
      console.log('Development mode: Assuming backend is already running on port 3000');
    }
    
    // Then create window
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  // Stop backend when all windows are closed
  stopBackend();
  // On macOS, keep app running until user explicitly quits
  // On Windows/Linux, quit the app
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', (event) => {
  // Ensure backend is stopped before quitting
  stopBackend();
});

app.on('will-quit', () => {
  // Final cleanup
  stopBackend();
});

// Handle IPC messages
ipcMain.handle('get-app-path', () => {
  return app.getAppPath();
});

ipcMain.handle('get-backend-status', () => {
  return {
    running: backendProcess !== null,
    pid: backendProcess ? backendProcess.pid : null
  };
});

// ============================================
// AUTO-UPDATER EVENT HANDLERS
// ============================================

// Check for updates manually
ipcMain.handle('check-for-updates', async () => {
  if (isDev) {
    log.info('Skipping update check in development mode');
    return { available: false, message: 'Development mode' };
  }
  
  try {
    const result = await autoUpdater.checkForUpdates();
    return { available: true, info: result.updateInfo };
  } catch (error) {
    log.error('Update check failed:', error);
    return { available: false, error: error.message };
  }
});

// Download update
ipcMain.handle('download-update', async () => {
  try {
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (error) {
    log.error('Update download failed:', error);
    return { success: false, error: error.message };
  }
});

// Install update and restart
ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall(false, true);
});

// Get current app version
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  log.info('Checking for updates...');
  if (mainWindow) {
    mainWindow.webContents.send('update-checking');
  }
});

autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update-available', info);
  }
  
  // Show system notification
  if (Notification.isSupported()) {
    new Notification({
      title: 'Update Available',
      body: `Reox POS v${info.version} is available. Click to download.`,
      icon: path.join(__dirname, '../public/icon.png')
    }).show();
  }
});

autoUpdater.on('update-not-available', (info) => {
  log.info('No updates available');
  if (mainWindow) {
    mainWindow.webContents.send('update-not-available', info);
  }
});

autoUpdater.on('error', (error) => {
  log.error('Auto-updater error:', error);
  if (mainWindow) {
    mainWindow.webContents.send('update-error', error.message);
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  log.info(`Download progress: ${progressObj.percent}%`);
  if (mainWindow) {
    mainWindow.webContents.send('download-progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', info);
  }
  
  // Show system notification
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: 'Update Ready',
      body: 'Update has been downloaded. Restart to install.',
      icon: path.join(__dirname, '../public/icon.png')
    });
    
    notification.on('click', () => {
      autoUpdater.quitAndInstall(false, true);
    });
    
    notification.show();
  }
});

// Schedule periodic update checks
function checkForUpdatesScheduled() {
  if (isDev) {
    log.info('Auto-update disabled in development mode');
    return;
  }
  
  // Check on app start (after 10 seconds)
  setTimeout(() => {
    log.info('Initial update check...');
    autoUpdater.checkForUpdates().catch(err => {
      log.error('Initial update check failed:', err);
    });
  }, 10000);
  
  // Check periodically
  setInterval(() => {
    log.info('Scheduled update check...');
    autoUpdater.checkForUpdates().catch(err => {
      log.error('Scheduled update check failed:', err);
    });
  }, UPDATE_CHECK_INTERVAL);
}

// Start scheduled checks when app is ready
app.once('ready', () => {
  checkForUpdatesScheduled();
});
