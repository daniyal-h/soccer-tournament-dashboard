import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import NotFound from './NotFound';

it('renders the not found heading', () => {
  render(<NotFound />);

  expect(screen.getByRole('heading', { name: /not found/i })).toBeInTheDocument();
});
