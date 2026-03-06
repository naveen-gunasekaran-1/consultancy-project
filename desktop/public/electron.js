const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const net = require('net');
const { spawn } = require('child_process');
const isDev = require('electron-is-dev');

let mainWindow;
let backendProcess;

// Single instance lock - only allow one app instance
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log('[Electron] Another instance is already running, quitting...');
  app.quit();
  process.exit(0);
}

// When someone tries to launch a second instance, focus existing window
app.on('second-instance', (event, commandLine, workingDirectory) => {
  console.log('[Electron] Second instance detected, trying to focus existing window');
  if (mainWindow && !mainWindow.isDestroyed()) {
    try {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
      mainWindow.focus();
    } catch (error) {
      console.error('[Electron] Error focusing window:', error);
    }
  } else {
    console.log('[Electron] No window to focus, creating new one');
    createWindow();
  }
});

// Setup logging to file
const logsDir = path.join(app.getPath('userData'), '..');
const logFile = path.join(logsDir, 'VJN-app-debug.log');
const setupLogging = () => {
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  
  const writeLog = (level, args) => {
    const timestamp = new Date().toISOString();
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
    const logMessage = `[${timestamp}] [${level}] ${message}\n`;
    try {
      fs.appendFileSync(logFile, logMessage);
    } catch (e) {
      // Ignore file write errors
    }
  };
  
  console.log = (...args) => {
    originalLog(...args);
    writeLog('LOG', args);
  };
  
  console.error = (...args) => {
    originalError(...args);
    writeLog('ERROR', args);
  };
  
  console.warn = (...args) => {
    originalWarn(...args);
    writeLog('WARN', args);
  };
};
setupLogging();
console.log('[Electron] App started, debug log file:', logFile);

function isPortInUse(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket
      .once('connect', () => {
        socket.destroy();
        resolve(true);
      })
      .once('timeout', () => {
        socket.destroy();
        resolve(false);
      })
      .once('error', () => {
        resolve(false);
      })
      .connect(port, '127.0.0.1');
  });
}

async function waitForPort(port, retries = 15) {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const running = await isPortInUse(port);
    if (running) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return false;
}

async function ensureBackendRunning() {
  const running = await isPortInUse(5002);
  if (running) {
    console.log('[Desktop] Backend already running on port 5002');
    return;
  }

  // Use different paths for dev vs packaged app
  let backendDir;
  
  if (isDev) {
    backendDir = path.resolve(__dirname, '../../backend');
  } else {
    // In packaged macOS app: /Applications/VJN Billing System.app/Contents/backend
    // app.getAppPath() returns: /Applications/VJN Billing System.app/Contents/Resources/app
    // We need: /Applications/VJN Billing System.app/Contents/backend
    const contentsPath = path.join(app.getAppPath(), '..', '..'); // Go up 2 levels from Resources/app to Contents
    const possiblePaths = [
      path.join(contentsPath, 'backend'),            // Contents/backend (macOS)
      path.join(app.getAppPath(), 'backend'),        // Resources/app/backend (fallback)
    ];
    
    for (let tryPath of possiblePaths) {
      if (fs.existsSync(tryPath)) {
        backendDir = tryPath;
        console.log('[Desktop] Found backend at:', tryPath);
        break;
      }
    }
  }

  if (!backendDir || !fs.existsSync(backendDir)) {
    console.error('[Desktop] Backend directory not found');
    console.error('[Desktop] app.getAppPath():', app.getAppPath());
    console.error('[Desktop] __dirname:', __dirname);
    return;
  }

  const backendServerPath = path.resolve(backendDir, 'dist/server.js');

  if (!fs.existsSync(backendServerPath)) {
    console.error('[Desktop] Backend server script not found:', backendServerPath);
    return;
  }

  // For production, ensure native modules are properly linked
  if (!isDev) {
    const nodeModulesPath = path.join(backendDir, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      console.log('[Desktop] Using bundled node_modules:', nodeModulesPath);
    }
  }

  const sqliteDbPath = path.join(app.getPath('userData'), 'database.db');
  
  // Prepare environment with NODE_PATH so backend can find node_modules
  const env = {
    ...process.env,
    PORT: '5002',
    SQLITE_DB_PATH: sqliteDbPath,
    NODE_ENV: isDev ? 'development' : 'production',
    NODE_PATH: path.join(backendDir, 'node_modules'),
  };

  console.log('[Desktop] Starting backend server...');
  
  // Important: Set ELECTRON_RUN_AS_NODE to run as plain Node.js without Electron APIs
  // This prevents the single-instance lock from affecting the backend
  env.ELECTRON_RUN_AS_NODE = '1';
  
  backendProcess = spawn(process.execPath, [backendServerPath], {
    cwd: backendDir,
    env: env,
    stdio: ['ignore', 'pipe', 'pipe'],  // Pipe stdout/stderr for logging
  });

  // Capture stdout
  if (backendProcess.stdout) {
    backendProcess.stdout.on('data', (data) => {
      console.log('[Backend]', data.toString().trim());
    });
  }

  // Capture stderr
  if (backendProcess.stderr) {
    backendProcess.stderr.on('data', (data) => {
      console.error('[Backend Error]', data.toString().trim());
    });
  }

  console.log('[Desktop] Backend process spawned (PID: ' + backendProcess.pid + ')');
  console.log('[Desktop] SQLite path:', sqliteDbPath);
  console.log('[Desktop] Backend dir:', backendDir);

  backendProcess.on('error', (error) => {
    console.error('[Desktop] Failed to start backend process:', error);
  });

  backendProcess.on('exit', (code, signal) => {
    console.warn('[Desktop] Backend process exited with code:', code, 'signal:', signal);
    backendProcess = null;
    
    // If backend crashes unexpectedly, notify user
    if (code !== 0 && code !== null) {
      try {
        const { dialog } = require('electron');
        if (mainWindow && !mainWindow.isDestroyed()) {
          dialog.showMessageBox(mainWindow, {
            type: 'error',
            title: 'Backend Error',
            message: 'Backend server stopped unexpectedly',
            detail: `Exit code: ${code}\n\nCheck the log file at:\n${logFile}`,
            buttons: ['OK']
          });
        }
      } catch (error) {
        console.error('[Desktop] Error showing dialog:', error);
      }
    }
  });

  const started = await waitForPort(5002);
  if (!started) {
    console.error('[Desktop] Backend did not become ready on port 5002 within 15 seconds.');
    console.error('[Desktop] Please check the log file at:', logFile);
    
    // Show error dialog
    try {
      const { dialog } = require('electron');
      if (mainWindow && !mainWindow.isDestroyed()) {
        dialog.showMessageBox(mainWindow, {
          type: 'error',
          title: 'Backend Startup Failed',
          message: 'Backend server failed to start',
          detail: `The backend did not respond on port 5002.\n\nCheck the log file at:\n${logFile}`,
          buttons: ['OK']
        });
      }
    } catch (error) {
      console.error('[Desktop] Error showing dialog:', error);
    }
  } else {
    console.log('[Desktop] Backend is ready on port 5002');
  }
}

function createWindow() {
  // Don't create window if it already exists and is not destroyed
  if (mainWindow && !mainWindow.isDestroyed()) {
    console.log('[Desktop] Window already exists, focusing it');
    try {
      mainWindow.show();
      mainWindow.focus();
    } catch (error) {
      console.error('[Desktop] Error focusing existing window:', error);
    }
    return;
  }

  console.log('[Desktop] Creating new window');
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // Don't show until ready
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);
  
  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    console.log('[Desktop] Window ready to show');
    mainWindow.show();
  });
  
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    console.log('[Desktop] Window closed');
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  console.log('[Desktop] App ready, initializing...');
  await ensureBackendRunning();
  createWindow();
});

app.on('window-all-closed', () => {
  console.log('[Desktop] All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  console.log('[Desktop] App quitting, cleaning up...');
  if (backendProcess) {
    console.log('[Desktop] Killing backend process...');
    backendProcess.kill('SIGTERM');
    backendProcess = null;
  }
});

app.on('will-quit', () => {
  console.log('[Desktop] App will quit');
  if (backendProcess) {
    backendProcess.kill('SIGKILL');
    backendProcess = null;
  }
});

app.on('activate', () => {
  console.log('[Desktop] App activated');
  // On macOS, re-create window when dock icon is clicked and no windows are open
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow();
  } else {
    try {
      mainWindow.show();
      mainWindow.focus();
    } catch (error) {
      console.error('[Desktop] Error showing window on activate:', error);
    }
  }
});
