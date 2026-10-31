import { useState, useEffect, useCallback } from 'react';
import { HealthStatus } from '../types';
import { fetchHealthStatus } from '../services/api';

export function useHealth(pollIntervalMs = 15000) {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);

  const checkHealth = useCallback(async () => {
    try {
      const data = await fetchHealthStatus();
      setHealth(data);
      setIsBackendOnline(data.status !== 'error');
    } catch {
      setIsBackendOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, pollIntervalMs);
    return () => clearInterval(interval);
  }, [checkHealth, pollIntervalMs]);

  return { health, loading, isBackendOnline, refetch: checkHealth };
}
