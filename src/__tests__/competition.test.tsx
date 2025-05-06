import React from 'react';
import { render, screen } from '@testing-library/react';
import CompetitionPage from '../pages/competition/[id]';
import mockRouter from 'next-router-mock';

// ✅ No need to mock next/router explicitly — jest.config.js handles it

test('renders competition page with ID', () => {
  mockRouter.setCurrentUrl('/competition/test-competition-id');
  // ✅ Manually mock the query param
  mockRouter.query = { id: 'test-competition-id' };

  render(<CompetitionPage />);
  expect(screen.getByText('Competition: test-competition-id')).toBeInTheDocument();
});
