'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { StonkBoardSnapshot } from '@/lib/stonk-board';

type StonkBoardState = { snapshot: StonkBoardSnapshot | null; live: boolean };
const StonkBoardContext = createContext<StonkBoardState>({ snapshot: null, live: false });
const CACHE_KEY = 'ubi-stonk-board-v1';

function readCached(): StonkBoardSnapshot | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) as StonkBoardSnapshot : null;
  } catch { return null; }
}

export function StonkBoardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StonkBoardState>({ snapshot: null, live: false });

  useEffect(() => {
    let active = true;
    const cached = readCached();
    if (cached) setState({ snapshot: cached, live: false });
    const refresh = async () => {
      try {
        const response = await fetch('/api/stonk-board/token', { cache: 'no-store' });
        if (!response.ok) throw new Error('Request failed');
        const snapshot = await response.json() as StonkBoardSnapshot;
        localStorage.setItem(CACHE_KEY, JSON.stringify(snapshot));
        if (active) setState({ snapshot, live: true });
      } catch {
        if (active) setState((current) => ({ ...current, live: false }));
      }
    };
    void refresh();
    const timer = window.setInterval(refresh, 15 * 60 * 1000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  return <StonkBoardContext.Provider value={state}>{children}</StonkBoardContext.Provider>;
}

export const useStonkBoard = () => useContext(StonkBoardContext);
