import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../pages/dashboard';

test('renders dashboard page', () => {
  render(<Dashboard />);
  expect(screen.getByText('Your Competitions')).toBeInTheDocument();
});
