import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

async function globalTeardown() {
  // Clean up auth file if it exists
  const authFile = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    'auth.json'
  );
  
  if (fs.existsSync(authFile)) {
    fs.unlinkSync(authFile);
    console.log('Authentication state cleaned up');
  }
  
  // Add any other cleanup tasks here
  console.log('Global teardown completed');
}

export default globalTeardown;
