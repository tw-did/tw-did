import { Mock, vi, describe, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useAccount } from 'wagmi';
import { UserPanel } from './UserPanel';

vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
  useConnect: vi.fn().mockReturnValue({ connect: vi.fn() }),
  useConfig: vi.fn().mockReturnValue({ connectors: [] }),
  useDisconnect: vi.fn().mockReturnValue({ disconnect: vi.fn() }),
}));

vi.mock('../contexts', () => ({
  useCredentials: vi.fn().mockReturnValue({ credentialViews: [] }),
  useAuth: vi.fn().mockReturnValue({ user: vi.fn() }),
}));

describe('UserPanel', () => {
  it('renders connect button when not connected', () => {
    (useAccount as Mock).mockReturnValue({
      address: null,
      isConnected: false,
    });

    render(<UserPanel />);

    expect(screen.getByTestId('connect-button')).toBeInTheDocument();
  });

  it('renders disconnect button and address when connected', () => {
    const mockAddress = '0x1234567890abcdef';

    (useAccount as Mock).mockReturnValue({
      address: mockAddress,
      isConnected: true,
    });

    render(<UserPanel />);

    expect(screen.getByTestId('disconnect-button')).toBeTruthy();
    expect(screen.getByTestId('address').textContent).toEqual(mockAddress);
  });
});
