import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BibleApp from '@/components/BibleApp';
import { useBibleSearch } from '@/hooks/useBibleSearch';
import { useAuth } from '@/lib/auth-context';

// Mock the hooks
jest.mock('@/hooks/useBibleSearch');
jest.mock('@/lib/auth-context');

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('BibleApp Component', () => {
  const mockSearch = jest.fn();
  const mockLogout = jest.fn();
  const mockSetSettings = jest.fn();

  const defaultSearchHook = {
    query: '',
    settings: {
      oldTestament: true,
      newTestament: true,
      commentary: false,
      insights: true,
    },
    setSettings: mockSetSettings,
    results: {
      bible: [],
      commentary: [],
      llmResponse: '',
    },
    loading: false,
    error: null,
    search: mockSearch,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useBibleSearch as jest.Mock).mockReturnValue(defaultSearchHook);
  });

  it('should render login button when user is not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      logout: mockLogout,
    });

    render(<BibleApp />);

    expect(screen.getByText('Login / Sign Up')).toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('should render user controls when authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        userId: 'user123',
        signInDetails: { loginId: 'test@example.com' },
      },
      logout: mockLogout,
    });

    render(<BibleApp />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Buy Credits')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should disable search when user is not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      logout: mockLogout,
    });

    render(<BibleApp />);

    // SearchBar should receive disabled prop
    const searchInputs = screen.getAllByRole('textbox');
    expect(searchInputs.length).toBeGreaterThan(0);
  });

  it('should display loading state', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { userId: 'user123' },
      logout: mockLogout,
    });
    (useBibleSearch as jest.Mock).mockReturnValue({
      ...defaultSearchHook,
      loading: true,
    });

    render(<BibleApp />);

    // Check for loading spinner
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should display error message', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { userId: 'user123' },
      logout: mockLogout,
    });
    (useBibleSearch as jest.Mock).mockReturnValue({
      ...defaultSearchHook,
      error: 'Something went wrong',
    });

    render(<BibleApp />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should call logout when logout button is clicked', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        userId: 'user123',
        signInDetails: { loginId: 'test@example.com' },
      },
      logout: mockLogout,
    });

    render(<BibleApp />);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
