import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to your app's login page
    await page.goto(`${baseURL}/login`);
    
    // Perform authentication steps here
    // Example: fill login form, click submit, wait for redirect
    // await page.fill('[data-testid="username"]', process.env.TEST_USERNAME || 'testuser');
    // await page.fill('[data-testid="password"]', process.env.TEST_PASSWORD || 'testpass');
    // await page.click('[data-testid="login-button"]');
    // await page.waitForURL('**/dashboard');
    
    // Save signed-in state to 'auth.json'
    const authFile = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      'auth.json'
    );
    await page.context().storageState({ path: authFile });
    
    console.log('Authentication setup completed');
  } catch (error) {
    console.log('Authentication setup skipped - login page not available or auth not required');
  } finally {
    await browser.close();
  }
}

export default globalSetup;
