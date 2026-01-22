import React from 'react';
import { render, screen } from '@testing-library/react';
import AIInsights from '../../components/AIInsights';
import '@testing-library/jest-dom';

describe('AIInsights Component', () => {
  it('renders nothing when content is empty', () => {
    const { container } = render(<AIInsights content="" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders generic section when no headers are found', () => {
    const content = "Just some random text from AI that does not follow the structure.";
    render(<AIInsights content={content} />);
    
    expect(screen.getByText('AI Insight')).toBeInTheDocument();
    expect(screen.getByText(content)).toBeInTheDocument();
  });

  it('parses English structure correctly', () => {
    const content = `Connections:
This is the connection part.

Theological Significance:
This is the theology part.

A Call for You:
This is the application part.`;

    render(<AIInsights content={content} />);

    // Check titles (without colons)
    expect(screen.getByText('Connections')).toBeInTheDocument();
    expect(screen.getByText('Theological Significance')).toBeInTheDocument();
    expect(screen.getByText('A Call for You')).toBeInTheDocument();

    // Check content
    expect(screen.getByText(/This is the connection part/)).toBeInTheDocument();
    expect(screen.getByText(/This is the theology part/)).toBeInTheDocument();
    expect(screen.getByText(/This is the application part/)).toBeInTheDocument();
  });

  it('parses Polish structure correctly', () => {
    const content = `Powiązania:
To jest część o powiązaniach.

Znaczenie Teologiczne:
To jest teologia.

Wezwanie dla Ciebie:
To jest zastosowanie.`;

    render(<AIInsights content={content} />);

    expect(screen.getByText('Powiązania')).toBeInTheDocument();
    expect(screen.getByText('Znaczenie Teologiczne')).toBeInTheDocument();
    expect(screen.getByText('Wezwanie dla Ciebie')).toBeInTheDocument();

    expect(screen.getByText(/To jest część o powiązaniach/)).toBeInTheDocument();
  });

  it('handles variations in newlines', () => {
    // Case where there are extra newlines or no newlines after header
    const content = `Connections: Content immediately after.
Theological Significance:
Content on next line.`;

    render(<AIInsights content={content} />);

    expect(screen.getByText('Connections')).toBeInTheDocument();
    expect(screen.getByText(/Content immediately after/)).toBeInTheDocument();
    
    expect(screen.getByText('Theological Significance')).toBeInTheDocument();
    expect(screen.getByText(/Content on next line/)).toBeInTheDocument();
  });
});
