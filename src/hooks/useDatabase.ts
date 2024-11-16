import { useEffect, useState } from 'react';
import { databaseService } from '../services/database';

export function useDatabase() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeDatabase() {
      try {
        await databaseService.initialize();
        const verified = await databaseService.verifyCollections();
        if (!verified) {
          throw new Error('Database verification failed');
        }
        setInitialized(true);
      } catch (err) {
        console.error('Database initialization error:', err);
        setError('Failed to initialize database');
      }
    }

    initializeDatabase();
  }, []);

  return { initialized, error };
}