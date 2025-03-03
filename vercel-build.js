// This is a simple build script for Vercel
console.log('Starting Vercel build process...');
console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());
console.log('Environment:', process.env.NODE_ENV);

try {
  console.log('Build process completed successfully!');
} catch (error) {
  console.error('Build failed with error:', error);
  process.exit(1);
} 