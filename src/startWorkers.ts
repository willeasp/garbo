import discord from './discord'
import { DiscordWorker } from './lib/DiscordWorker';
import { workers } from './workers'

console.log('Starting workers...')

async function startWorker(worker: DiscordWorker<any>) {
  const maxRetries = 5;
  let delay = 1000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await worker.run();
      if (attempt === 0) {
        console.log(`Started worker: ${worker.name || 'unnamed worker'}`);
      } else {
        console.log(`Started worker after ${attempt} retries: ${worker.name || 'unnamed worker'}`);
      }
      return;
    } catch (error) {
      if (attempt === maxRetries) {
        console.error(`Failed to start worker after ${maxRetries} retries: ${worker.name || 'unnamed worker'}`);
        throw error;
      }
      console.log(`Retry ${attempt + 1} failed for worker: ${worker.name || 'unnamed worker'}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
}

Promise.all(workers.map(worker => startWorker(worker)))
  .catch((error) => {
    console.error('Error starting workers:', error);
    process.exit(1);
  });

async function connectWithRetry<T>(fn: () => Promise<T>, maxRetries = 5, delay = 1000): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      const error = err as Error;
      console.log(`Connection attempt ${attempt} failed: ${error.message}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
  throw new Error('Failed to connect after maximum retries');
}

try {
  await connectWithRetry(() => discord.login());
  console.log('Discord bot started');
} catch (error) {
  console.error('Failed to start Discord bot:', error);
  process.exit(1);
}
