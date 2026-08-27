import { _electron as electron, expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const distMainPath = path.join(process.cwd(), 'dist-electron', 'main.js');

test('creates and closes a timer overlay window via the manager UI', async () => {
  test.skip(
    !fs.existsSync(distMainPath),
    'Run `npm run build` before executing Electron E2E tests.'
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
    await expect(mainWindow.locator('.home-dashboard')).toBeVisible();

    const timerItems = mainWindow.locator('.timer-item');
    const initialCount = await timerItems.count();

    await mainWindow.locator('input[name="seconds"]').fill('5');

    const overlayWindowPromise = electronApp.waitForEvent(
      'window',
      (page) => page !== mainWindow
    );

    await mainWindow.locator('.add-timer-button').click();

    const overlayWindow = await overlayWindowPromise;
    await overlayWindow.waitForLoadState('domcontentloaded');

    await expect(overlayWindow).toHaveURL(/#\/timer-overlay\//);
    await expect(overlayWindow.locator('.timer-time')).toHaveText('00:05.00');
    await expect(timerItems).toHaveCount(initialCount + 1);

    const newTimer = mainWindow.locator('.timer-item').last();
    const timerIdLine = await newTimer
      .locator('.timer-info p')
      .first()
      .textContent();
    const timerId = timerIdLine?.split('ID:')[1]?.trim();
    expect(timerId, 'New timer should expose its ID text').toBeTruthy();

    const closePromise = overlayWindow.waitForEvent('close');
    await newTimer.locator('.remove-timer-button').click();

    await closePromise;
    await expect(timerItems).toHaveCount(initialCount);
  } finally {
    await electronApp.close();
  }
});
