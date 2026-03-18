import { createContext, useContext } from 'react';
import type { StyleStore } from '../../lib/model';

const StyleContext = createContext<StyleStore | null>(null);

export function StyleProvider({ store, children }: { store: StyleStore; children: React.ReactNode }) {
  return <StyleContext.Provider value={store}>{children}</StyleContext.Provider>;
}

export function useStyleStore(): StyleStore {
  const ctx = useContext(StyleContext);
  if (!ctx) throw new Error('StyleProvider가 필요합니다');
  return ctx;
}
