import { _electron as electron, expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const distMainPath = path.join(process.cwd(), 'dist-electron', 'main.js');

// Playwright requires fixture arguments to use object destructuring.
// eslint-disable-next-line no-empty-pattern
test('creates and closes a timer overlay without deleting the timer', async ({}, testInfo) => {
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

    const timerItems = mainWindow.getByTestId('timer-item');
    const initialCount = await timerItems.count();

    await mainWindow.getByTestId('duration-seconds').fill('5');

    const overlayWindowPromise = electronApp.waitForEvent(
      'window',
      (page) => page !== mainWindow
    );

    await mainWindow.getByTestId('create-timer').click();

    const overlayWindow = await overlayWindowPromise;
    await overlayWindow.waitForLoadState('domcontentloaded');

    await expect(overlayWindow).toHaveURL(/#\/timer-overlay\//);
    await expect(overlayWindow.getByTestId('timer-display')).toHaveText(
      '00:05.00'
    );
    await overlayWindow.screenshot({
      path: testInfo.outputPath('overlay-default.png'),
    });

    await overlayWindow.emulateMedia({ reducedMotion: 'reduce' });
    await electronApp.evaluate(({ BrowserWindow }) => {
      const overlay = BrowserWindow.getAllWindows().find((window) =>
        window.webContents.getURL().includes('/timer-overlay/')
      );
      overlay?.setSize(240, 140);
    });
    await expect(overlayWindow.getByTestId('timer-hud')).toBeVisible();
    await expect(overlayWindow.getByTestId('timer-toggle')).toBeVisible();
    const viewportFits = await overlayWindow.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    expect(viewportFits).toBeTruthy();
    const animationDuration = await overlayWindow
      .getByTestId('timer-display')
      .evaluate((element) => getComputedStyle(element).animationDuration);
    expect(Number.parseFloat(animationDuration)).toBeLessThanOrEqual(0.000001);
    await overlayWindow.screenshot({
      path: testInfo.outputPath('overlay-small-reduced-motion.png'),
    });
    await expect(timerItems).toHaveCount(initialCount + 1);
    const managerViewportFits = await mainWindow.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    expect(managerViewportFits).toBeTruthy();

    const newTimer = mainWindow.getByTestId('timer-item').last();
    await expect(newTimer).not.toContainText(/ID:/);

    const closePromise = overlayWindow.waitForEvent('close');
    await overlayWindow.getByTestId('close-timer-overlay').click();

    await closePromise;
    await expect(timerItems).toHaveCount(initialCount + 1);

    await newTimer.getByTestId('remove-timer').click();
    await expect(timerItems).toHaveCount(initialCount);
  } finally {
    await electronApp.close();
  }
});
