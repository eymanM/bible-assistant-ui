import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '../../components/Sidebar';
import { en } from '../../lib/locales/en';

// Mock the usage of hooks
jest.mock('../../lib/language-context', () => ({
  useLanguage: () => ({
    t: en,
    language: 'en',
    setLanguage: jest.fn(),
  }),
}));

// Mock Next/Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

describe('Sidebar Component', () => {
  const mockProps = {
    settings: {
      oldTestament: true,
      newTestament: true,
      commentary: true,
      insights: true,
    },
    setSettings: jest.fn(),
    query: '',
    onSearch: jest.fn(),
    onHistoryClick: jest.fn(),
    isOpen: true,
    onClose: jest.fn(),
    onLanguageChange: jest.fn(),
  };

  it('renders correctly', () => {
    render(<Sidebar {...mockProps} />);
    expect(screen.getByText('Bible Assistant')).toBeInTheDocument();
    expect(screen.getByText('Old Testament')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked (mobile)', () => {
    render(<Sidebar {...mockProps} />);
    const closeButton = screen.getByLabelText('Close sidebar');
    fireEvent.click(closeButton);
    expect(mockProps.onClose).toHaveBeenCalled();
  });
});
