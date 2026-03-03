import React from 'react';
import { render, screen } from '@testing-library/react';
import CategoryCard from '../CategoryCard';

describe('CategoryCard Component', () => {
  it('should render the title and icon correctly', () => {
    render(<CategoryCard title="Test Category" icon="🧪" />);

    expect(screen.getByRole('heading', { name: /Test Category/i })).toBeInTheDocument();
    expect(screen.getByText('🧪')).toBeInTheDocument();
  });

  it('should render a link pointing to the correct category page', () => {
    render(<CategoryCard title="Event Planners" icon="📋" />);

    const linkElement = screen.getByRole('link', { name: /Event Planners/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', '/vendors/event-planners');
  });

  it('should correctly slugify titles containing special characters like "&"', () => {
    render(<CategoryCard title="Decorations & Rentals" icon="🎨" />);

    const linkElement = screen.getByRole('link', { name: /Decorations & Rentals/i });
    expect(linkElement).toHaveAttribute('href', '/vendors/decorations-rentals');
  });
});