import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ApplicationStep1Page from '../../pages/application/step1';

jest.mock('next/head', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, onClick, ...p }: { children: React.ReactNode; href: string; onClick?: () => void }) => (
    <a href={href} onClick={onClick} {...p}>
      {children}
    </a>
  ),
}));

describe('ApplicationStep1Page', () => {
  const oldLocal = global.localStorage;
  const oldFetch = global.fetch;

  beforeEach(() => {
    const store: Record<string, string> = {};
    const ls = {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        for (const k of Object.keys(store)) delete store[k];
      },
    } as unknown as Storage;
    Object.defineProperty(window, 'localStorage', { value: ls, writable: true });
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.localStorage = oldLocal;
    global.fetch = oldFetch;
  });

  it('does not show Generate until certification, industry, and employee count are set', () => {
    render(<ApplicationStep1Page />);
    expect(screen.queryByRole('button', { name: /Generate My Checklist/i })).not.toBeInTheDocument();
  });

  it('shows generate button and calls API, then shows checklist (success path)', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        source: 'ai',
        items: [
          { id: '1', title: 'Policy', description: 'Signed policy document' },
        ],
      }),
    } as unknown as Response);

    await act(async () => {
      render(<ApplicationStep1Page />);
    });

    await user.type(screen.getByLabelText(/Industry/i), 'Manufacturing');
    await user.selectOptions(screen.getByLabelText(/Number of employees/i), '11-50');

    const gen = await screen.findByRole('button', { name: /Generate My Checklist/i });
    expect(gen).toBeInTheDocument();
    await user.click(gen);

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/ai/generate-checklist',
      expect.objectContaining({ method: 'POST' })
    );
    expect(await screen.findByText('Policy')).toBeInTheDocument();
    expect(screen.getByText('Signed policy document')).toBeInTheDocument();
    expect(screen.getByText(/Your personalized document checklist/i)).toBeInTheDocument();
  });
});
