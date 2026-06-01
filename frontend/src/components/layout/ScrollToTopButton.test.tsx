import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ScrollToTopButton from './ScrollToTopButton';

function setScrollY(value: number) {
  Object.defineProperty(window, 'scrollY', {
    value,
    writable: true,
  });

  act(() => {
    window.dispatchEvent(new Event('scroll'));
  });
}

describe('ScrollToTopButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
    });

    window.scrollTo = vi.fn();
  });

  it('is hidden initially', () => {
    render(<ScrollToTopButton />);

    expect(screen.queryByRole('button', { name: /scroll to top/i })).not.toBeInTheDocument();
  });

  it('appears after scrolling past threshold', () => {
    render(<ScrollToTopButton />);

    setScrollY(500);

    expect(screen.getByRole('button', { name: /scroll to top/i })).toBeInTheDocument();
  });

  it('hides again when scrolling above threshold', () => {
    render(<ScrollToTopButton />);

    setScrollY(500);

    expect(screen.getByRole('button', { name: /scroll to top/i })).toBeInTheDocument();

    setScrollY(100);

    expect(screen.queryByRole('button', { name: /scroll to top/i })).not.toBeInTheDocument();
  });

  it('smoothly scrolls to top when clicked', () => {
    render(<ScrollToTopButton />);

    setScrollY(500);

    fireEvent.click(screen.getByRole('button', { name: /scroll to top/i }));

    expect(window.scrollTo).toHaveBeenCalledExactlyOnceWith({
      top: 0,
      behavior: 'smooth',
    });
  });
});
