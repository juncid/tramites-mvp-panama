import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

/**
 * Wrapper personalizado que incluye providers necesarios
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

/**
 * Render personalizado que incluye providers
 */
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

/**
 * Setup helper que incluye userEvent
 */
export const setup = (jsx: ReactElement) => {
  return {
    user: userEvent.setup(),
    ...customRender(jsx),
  };
};

// Re-export todo de testing library
export * from '@testing-library/react';
export { customRender as render };
