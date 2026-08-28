import { _electron as electron, expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const distMainPath = path.join(process.cwd(), 'dist-electron', 'main.js');

test('opens the main window after launch', async () => {
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

  const window = await electronApp.firstWindow();
  await expect(window.locator('.home-dashboard')).toBeVisible();

  await expect(window).toHaveTitle('Vite + React + TS');

  await electronApp.close();
});
