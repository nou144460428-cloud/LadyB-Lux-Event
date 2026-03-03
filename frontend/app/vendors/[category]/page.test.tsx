import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../page';

// Mock the CategoryCard component to isolate the Home component for unit testing.
jest.mock('@/components/CategoryCard', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function DummyCategoryCard({ title, icon }: any) {
    return (
      <div data-testid="category-card">
        <h2>{title}</h2>
        <span>{icon}</span>
      </div>
    );
  };
});

describe('Home Page', () => {
  it('renders the main heading and subheading', () => {
    render(<Home />);

    const heading = screen.getByRole('heading', { name: /🎉 Plan Your Perfect Event/i });
    expect(heading).toBeInTheDocument();

    const subheading = screen.getByText(
      /Connect with the best vendors for cakes, decorations, entertainment, and more!/i
    );
    expect(subheading).toBeInTheDocument();
  });

  it('renders the "Browse by Category" section with all categories', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: /Browse by Category/i })).toBeInTheDocument();

    // Check for each category card title rendered via the mock
    expect(screen.getByText('Event Planners')).toBeInTheDocument();
    expect(screen.getByText('Decorations & Rentals')).toBeInTheDocument();
    expect(screen.getByText('Cakes')).toBeInTheDocument();
    expect(screen.getByText('Small Chops')).toBeInTheDocument();

    // Verify that 4 cards are rendered
    const categoryCards = screen.getAllByTestId('category-card');
    expect(categoryCards).toHaveLength(4);
  });

  it('renders the "How It Works" section with all four steps', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: /How It Works/i })).toBeInTheDocument();

    // Check for each step's title and description
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByText(/Create your account/i)).toBeInTheDocument();

    expect(screen.getByText('Create Event')).toBeInTheDocument();
    expect(screen.getByText(/Set event date & location/i)).toBeInTheDocument();

    expect(screen.getByText('Browse Vendors')).toBeInTheDocument();
    expect(screen.getByText(/Find & add to cart/i)).toBeInTheDocument();

    expect(screen.getByText('Pay & Confirm')).toBeInTheDocument();
    expect(screen.getByText(/Complete payment/i)).toBeInTheDocument();
  });
});
