import React from 'react';
import { render, screen } from '@testing-library/react';
import CompetitionPage from '../pages/competition/[id]';
import mockRouter from 'next-router-mock';


test('renders competition page with ID', () => {
  mockRouter.setCurrentUrl('/competition/test-competition-id');
  mockRouter.query = { id: 'test-competition-id' };

  render(<CompetitionPage />);
  expect(screen.getByText('Competition: test-competition-id')).toBeInTheDocument();
});
