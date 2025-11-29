
import { useContext } from 'react';
import { DbContext } from '../contexts/DbContext';
import { MSTUltimateDB } from '../db';

export const useDb = (): MSTUltimateDB => {
  const db = useContext(DbContext);
  if (!db) {
    throw new Error('useDb must be used within a DbContext.Provider');
  }
  return db;
};
