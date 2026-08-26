import { _electron as electron, expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const distMainPath = path.join(process.cwd(), 'dist-electron', 'main.js');

test('creates a tray icon with basic menu actions', async () => {
  test.skip(
    !fs.existsSync(distMainPath),
    'Run `npm run build` before executing Electron E2E tests.',
  );

  const electronApp = await electron.launch({
    args: [distMainPath],
    env: {
      ...process.env,
      ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
    },
  });

  try {
    const mainWindow = await electronApp.firstWindow();
    await mainWindow.waitForLoadState('domcontentloaded');

    const trayInfo = await mainWindow.evaluate(() => {
      return Reflect.get(window, 'electronAPI').getTrayInfo();
    });

    expect(trayInfo.hasTray).toBeTruthy();
    expect(trayInfo.menuLabels).toEqual(expect.arrayContaining(['Open', 'Quit']));
  } finally {
    await electronApp.close();
  }
});
