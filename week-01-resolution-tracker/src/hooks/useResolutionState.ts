import { useState, useEffect, useCallback } from 'react';
import { 
  ResolutionState, 
  WeekEntry, 
  STORAGE_KEY, 
  createDefaultState 
} from '@/types/resolution';

export const useResolutionState = () => {
  const [state, setState] = useState<ResolutionState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.version === 1) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load state from localStorage:', e);
    }
    return createDefaultState();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }, [state]);

  const updateWeek = useCallback((weekNumber: number, updates: Partial<WeekEntry>) => {
    setState(prev => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      weeks: prev.weeks.map(week =>
        week.week === weekNumber
          ? { ...week, ...updates, updatedAt: new Date().toISOString() }
          : week
      ),
    }));
  }, []);

  const exportState = useCallback(() => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  const importState = useCallback((jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.version === 1 && Array.isArray(parsed.weeks)) {
        setState({
          ...parsed,
          updatedAt: new Date().toISOString(),
        });
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to import state:', e);
      return false;
    }
  }, []);

  const resetState = useCallback(() => {
    setState(createDefaultState());
  }, []);

  return {
    state,
    updateWeek,
    exportState,
    importState,
    resetState,
  };
};
