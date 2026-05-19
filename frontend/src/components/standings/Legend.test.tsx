import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Legend from './Legend';

describe('Legend', () => {
  it('renders standings abbreviations and labels', () => {
    render(<Legend />);

    expect(screen.getByText('MP')).toBeInTheDocument();
    expect(screen.getByText('= Matches Played')).toBeInTheDocument();
    expect(screen.getByText('Pts')).toBeInTheDocument();
    expect(screen.getByText('= Points')).toBeInTheDocument();
  });
});
