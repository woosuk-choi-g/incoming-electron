import {
  app,
  BrowserWindow,
  ipcMain,
  screen,
  Menu,
  Tray,
  nativeImage,
  type MenuItemConstructorOptions,
  shell,
} from 'electron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const NODE_ENV = process.env.NODE_ENV ?? 'development';
const envRoot = path.resolve(__dirname, '..');
const envPaths = [
  path.join(envRoot, `.env.${NODE_ENV}`),
  path.join(envRoot, `.env.${NODE_ENV}.local`),
];

envPaths.forEach((envPath, index) => {
  if (fs.existsSync(envPath)) {
    dotenv.config({
      path: envPath,
      override: index > 0,
    });
  }
});

const configNames = [
  'OVERLAY_FRAME',
  'OVERLAY_ALWAYS_ON_TOP',
  'OVERLAY_SKIP_TASKBAR',
  'OVERLAY_AUTO_HIDE_MENU_BAR',
] as const;

const configs = configNames.reduce(
  (acc, name) => {
    acc[name] = process.env[name] === 'true';
    return acc;
  },
  {} as Record<(typeof configNames)[number], boolean>
);

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
const APP_ROOT = process.env.APP_ROOT ?? path.join(__dirname, '..');
process.env.APP_ROOT = APP_ROOT;

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(APP_ROOT, 'dist');

const VITE_PUBLIC_DIR =
  process.env.VITE_PUBLIC ??
  (VITE_DEV_SERVER_URL ? path.join(APP_ROOT, 'public') : RENDERER_DIST);

process.env.VITE_PUBLIC = VITE_PUBLIC_DIR;

let win: BrowserWindow | null;
let timerWindows: Map<string, BrowserWindow> = new Map(); // Manage multiple timer windows
let tray: Tray | null = null; // Keep tray alive for app lifetime
let isQuitting = false;
let trayMenuLabels: string[] = [];

function getTrayIcon() {
  const platformAsset =
    process.platform === 'win32' ? 'tray-icon.png' : 'tray-iconTemplate.png';
  const explicitPath = path.join(VITE_PUBLIC_DIR, platformAsset);

  if (fs.existsSync(explicitPath)) {
    const resolved = nativeImage.createFromPath(explicitPath);
    if (!resolved.isEmpty()) {
      return resolved;
    }
  }

  const fallbackPath = path.join(VITE_PUBLIC_DIR, 'electron-vite.svg');
  const svgFallback = nativeImage.createFromPath(fallbackPath);
  if (!svgFallback.isEmpty()) {
    return svgFallback;
  }

  const fallbackDataUrl =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACTSURBVHgBpZKBCYAgEEV/TeAIjuIIbdQIuUGt0CS1gW1iZ2jIVaTnhw+Cvs8/OYDJA4Y8kR3ZR2/kmazxJbpUEfQ/Dm/UG7wVwHkjlQdMFfDdJMFaACebnjJGyDWgcnZu2/lrCrl6NCoEHJBrDwEr5NrT6ko/UV8xdLAC2N49mlc5CylpYh8wCwqrvbBGLoKGvz8Bfq0QPWEUo/EAAAAASUVORK5CYII=';
  return nativeImage.createFromDataURL(fallbackDataUrl);
}

function showOrCreateMainWindow() {
  if (win && !win.isDestroyed()) {
    if (win.isMinimized()) {
      win.restore();
    }
    win.show();
    win.focus();
    return;
  }
  createWindow();
}

function createTray() {
  if (tray) {
    return tray;
  }

  const icon = getTrayIcon();
  tray = new Tray(icon);

  tray.setToolTip(app.getName());

  const menuTemplate: MenuItemConstructorOptions[] = [
    {
      label: 'Open',
      click: () => {
        showOrCreateMainWindow();
      },
    },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ];
  const contextMenu = Menu.buildFromTemplate(menuTemplate);
  trayMenuLabels = contextMenu.items
    .map((item) => item.label)
    .filter((label): label is string => Boolean(label));

  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    showOrCreateMainWindow();
  });

  return tray;
}

function getTrayInfo() {
  return {
    hasTray: Boolean(tray) && !tray?.isDestroyed(),
    menuLabels: trayMenuLabels,
  };
}

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(VITE_PUBLIC_DIR, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  win.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      if (process.platform === 'darwin') {
        app.hide();
      } else {
        win?.hide();
      }
    }
  });

  win.on('closed', () => {
    win = null;
  });

  if (VITE_DEV_SERVER_URL) {
    void win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    void win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }
}

function createOverlayTimerWindow(
  timerId: string,
  title: string,
  duration: number
) {
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
    frame: configs.OVERLAY_FRAME,
    alwaysOnTop: configs.OVERLAY_ALWAYS_ON_TOP,
    skipTaskbar: configs.OVERLAY_SKIP_TASKBAR,
    transparent: true, // Transparent background
    resizable: true, // Allow resizing
    minimizable: false,
    maximizable: false,
    closable: true,
    title: `${title} - ${timerId}`,
    autoHideMenuBar: configs.OVERLAY_AUTO_HIDE_MENU_BAR,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });

  // Position window in top-right corner by default
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width } = primaryDisplay.workAreaSize;
  timerWin.setPosition(width - 820, 20);

  // Load timer with specific timer ID
  const timerSearchParams = new URLSearchParams({
    title,
    duration: duration.toString(),
  });
  const timerRoute = `#/timer-overlay/${encodeURIComponent(timerId)}?${timerSearchParams.toString()}`;
  const timerUrl = VITE_DEV_SERVER_URL
    ? `${VITE_DEV_SERVER_URL}${timerRoute}`
    : `${path.join(RENDERER_DIST, 'index.html')}${timerRoute}`;

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
  if (process.platform !== 'darwin' && isQuitting) {
    win = null;
    app.quit();
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
  createTray();

  app.on('before-quit', () => {
    isQuitting = true;
    if (tray) {
      tray.destroy();
      tray = null;
      trayMenuLabels = [];
    }
  });

  // IPC handlers
  ipcMain.handle(
    'create-timer-window',
    (_event, { timerId, title, duration }) => {
      if (
        typeof timerId !== 'string' ||
        timerId.length === 0 ||
        typeof title !== 'string' ||
        title.length === 0 ||
        typeof duration !== 'number' ||
        !Number.isFinite(duration) ||
        duration <= 0
      ) {
        throw new Error('올바른 타이머 설정이 필요합니다.');
      }

      createOverlayTimerWindow(timerId, title, duration);
    }
  );

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

  ipcMain.handle('get-tray-info', () => {
    return getTrayInfo();
  });

  ipcMain.handle('open-external', (_event, url) => {
    shell.openExternal(url);
  });
});
