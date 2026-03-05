const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const net = require('net');
const { spawn } = require('child_process');
const isDev = require('electron-is-dev');

let mainWindow;
let backendProcess;

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
  const running = await isPortInUse(5000);
  if (running) {
    return;
  }

  const backendDir = path.resolve(__dirname, '../../backend');
  if (!fs.existsSync(backendDir)) {
    console.warn('[Desktop] Backend directory not found:', backendDir);
    return;
  }

  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const backendScript = isDev ? 'dev' : 'start';
  const sqliteDbPath = path.join(app.getPath('userData'), 'database.db');

  backendProcess = spawn(npmCommand, ['run', backendScript], {
    cwd: backendDir,
    env: {
      ...process.env,
      PORT: '5002',
      SQLITE_DB_PATH: sqliteDbPath,
    },
    stdio: 'inherit',
  });

  console.log('[Desktop] SQLite path:', sqliteDbPath);

  backendProcess.on('error', (error) => {
    console.error('[Desktop] Failed to start backend process:', error);
  });

  const started = await waitForPort(5000);
  if (!started) {
    console.warn('[Desktop] Backend did not become ready on port 5000 in time.');
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
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
  
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await ensureBackendRunning();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
