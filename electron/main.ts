import { app, BrowserWindow, ipcMain, screen } from 'electron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

// const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..');

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

let win: BrowserWindow | null;
let timerWindows: Map<string, BrowserWindow> = new Map(); // Manage multiple timer windows

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    void win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    void win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }
}

function createOverlayTimerWindow(timerId: string, title: string) {
  // If timer window already exists, just focus it
  if (timerWindows.has(timerId)) {
    const existingWindow = timerWindows.get(timerId);
    if (existingWindow && !existingWindow.isDestroyed()) {
      existingWindow.focus();
      return;
    }
  }

  const timerWin = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 200,
    minHeight: 100,
    maxWidth: 800,
    maxHeight: 600,
    frame: false, // Remove window frame for overlay effect
    alwaysOnTop: true, // Always stay on top
    skipTaskbar: true, // Don't show in taskbar
    transparent: true, // Transparent background
    resizable: true, // Allow resizing
    minimizable: false,
    maximizable: false,
    closable: true,
    title: `${title} - ${timerId}`,
    autoHideMenuBar: true,
  });

  // Position window in top-right corner by default
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width } = primaryDisplay.workAreaSize;
  timerWin.setPosition(width - 820, 20);

  // Load timer with specific timer ID
  const timerUrl = VITE_DEV_SERVER_URL
    ? `${VITE_DEV_SERVER_URL}#/timer-overlay/${timerId}`
    : `${path.join(RENDERER_DIST, 'index.html')}#/timer-overlay/${timerId}`;

  void timerWin.loadURL(timerUrl);

  // Store the window reference
  timerWindows.set(timerId, timerWin);

  // Close timer window when closed
  timerWin.on('closed', () => {
    timerWindows.delete(timerId);
  });

  return timerWin;
}

function closeTimerWindow(timerId: string) {
  const timerWin = timerWindows.get(timerId);
  if (timerWin && !timerWin.isDestroyed()) {
    timerWin.close();
    timerWindows.delete(timerId);
  }
}


// Timer overlay settings management
const SETTINGS_DIR = path.join(app.getPath('userData'), 'timer-settings');
const SETTINGS_FILE = path.join(SETTINGS_DIR, 'overlay-settings.json');

// Ensure settings directory exists
if (!fs.existsSync(SETTINGS_DIR)) {
  fs.mkdirSync(SETTINGS_DIR, { recursive: true });
}

interface TimerSettings {
  [timerId: string]: {
    width: number;
    height: number;
    x: number;
    y: number;
    opacity: number;
    theme: string;
  };
}

function loadTimerSettings(): TimerSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('설정 파일 로드 실패:', error);
  }
  return {};
}

function saveTimerSettings(settings: TimerSettings): void {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('설정 파일 저장 실패:', error);
  }
}

function getTimerSettings(timerId: string): any {
  const settings = loadTimerSettings();
  return settings[timerId] || null;
}

function setTimerSettings(timerId: string, settings: any): void {
  const allSettings = loadTimerSettings();
  allSettings[timerId] = settings;
  saveTimerSettings(allSettings);
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

void app.whenReady().then(() => {
  createWindow();

  // IPC handlers
  ipcMain.handle('create-timer-window', (_event, { timerId, title }) => {
    createOverlayTimerWindow(timerId, title);
  });

  ipcMain.handle('close-timer-window', (_event, timerId) => {
    closeTimerWindow(timerId);
  });

  ipcMain.handle('set-window-position', (_event, { x, y }) => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.setPosition(x, y);
    }
  });

  ipcMain.handle('get-window-position', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      const [x, y] = focusedWindow.getPosition();
      return { x, y };
    }
    return { x: 0, y: 0 };
  });

  ipcMain.handle('get-timer-settings', (_event, timerId) => {
    return getTimerSettings(timerId);
  });

  ipcMain.handle('set-timer-settings', (_event, timerId, settings) => {
    setTimerSettings(timerId, settings);
  });
});
