const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

exports.default = async function(context) {
  console.log('Running before-pack script...');
  
  const appDir = context.appDir;
  const backendSource = path.join(appDir, 'backend');
  const backendDest = path.join(appDir, 'backend');
  
  console.log('Installing backend production dependencies...');
  
  try {
    // Install only production dependencies for backend
    execSync('npm install --production --omit=dev', {
      cwd: backendSource,
      stdio: 'inherit'
    });
    
    console.log('Backend dependencies installed successfully');
    
    // Ensure .env file exists
    const envFile = path.join(backendSource, '.env');
    if (!fs.existsSync(envFile)) {
      console.warn('Warning: .env file not found in backend directory');
      console.warn('Please ensure database configuration is set up before running the app');
    }
    
  } catch (error) {
    console.error('Error during before-pack:', error);
    throw error;
  }
};
