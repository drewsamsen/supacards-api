#!/bin/bash

# Install dependencies
npm ci

# Build the TypeScript project
npm run build

# Make the script executable
chmod +x vercel-build.sh 