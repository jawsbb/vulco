import { ReactNode } from 'react';
import { PatrimoineContext, usePatrimoineState } from './usePatrimoine';

export const PatrimoineProvider = ({ children }: { children: ReactNode }) => {
  const value = usePatrimoineState();
  return <PatrimoineContext.Provider value={value}>{children}</PatrimoineContext.Provider>;
};
