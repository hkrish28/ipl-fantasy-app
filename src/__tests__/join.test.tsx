import React from 'react';
import { render, screen } from '@testing-library/react';
import JoinPage from '../pages/join';

test('renders join page', () => {
  render(<JoinPage />);
  expect(screen.getByText('Join a Competition')).toBeInTheDocument();
});
