import dotenv from 'dotenv';
import { engine } from './engine.js';
import './api/server.js'; // Start the API server

dotenv.config();

async function bootstrap() {
  console.log('Starting CortexForge Cognitive Engine...');

  try {
    await engine.initialize();
    await engine.start();
    console.log('CortexForge is fully operational');
  } catch (error) {
    console.error('Failed to bootstrap CortexForge:', error);
    process.exit(1);
  }
}

bootstrap();
