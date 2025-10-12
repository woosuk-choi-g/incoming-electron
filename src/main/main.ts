import { app, BrowserWindow } from 'electron';
import * as path from 'path';

let mainWindow: Electron.BrowserWindow;

function createWindow(): void {
  // 새 브라우저 창을 생성합니다.
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // 그리고 앱의 index.html을 로드합니다.
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // 개발자 도구를 엽니다.
  mainWindow.webContents.openDevTools();

  // 창이 닫혔을 때의 이벤트를 처리합니다.
  mainWindow.on('closed', () => {
    mainWindow = null!;
  });
}

// 이 이벤트는 Electron이 초기화되고 브라우저 창을 생성할 준비가 되었을 때 발생합니다.
// 몇몇 API는 이 이벤트가 발생한 후에만 사용할 수 있습니다.
app.on('ready', createWindow);

// 모든 창이 닫혔을 때 애플리케이션을 종료합니다.
app.on('window-all-closed', () => {
  // macOS에서는 사용자가 Cmd + Q로 애플리케이션을 종료할 때까지
  // 애플리케이션과 메뉴 바를 활성 상태로 유지하는 것이 일반적입니다.
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // macOS에서는 창이 모두 닫혔다가 Dock 아이콘이 클릭되면
  // 창을 다시 열려고 시도합니다.
  if (mainWindow === null) {
    createWindow();
  }
});
