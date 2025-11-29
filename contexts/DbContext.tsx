
import { createContext } from 'react';
import { MSTUltimateDB } from '../db';

export const DbContext = createContext<MSTUltimateDB | null>(null);
