import React from 'react'; // ✅ Required for Babel+Jest
import { render, screen } from '@testing-library/react';
import Home from '../pages/index';

test('renders welcome message', () => {
  render(<Home />);
  expect(screen.getByText('Welcome to IPL Fantasy App')).toBeInTheDocument();
});
