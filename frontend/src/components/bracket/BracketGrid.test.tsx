import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { BracketRound as BracketRoundType } from '@/types/bracket';

import { BracketGrid } from './BracketGrid';

vi.mock('./BracketRound', () => ({
  default: ({ stage, title, matches }: BracketRoundType) => (
    <div data-testid="bracket-round">
      <span>{stage}</span>
      <span>{title}</span>
      <span>{matches.length} matches</span>
    </div>
  ),
}));

function makeRound(overrides: Partial<BracketRoundType> = {}): BracketRoundType {
  return {
    stage: 'final',
    title: 'Final',
    matches: [],
    ...overrides,
  };
}

let resizeObserverCallback: ResizeObserverCallback | undefined;

class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(callback: ResizeObserverCallback) {
    resizeObserverCallback = callback;
  }
}

function setHorizontalScrollMetrics(
  element: HTMLElement,
  {
    scrollWidth,
    clientWidth,
  }: {
    scrollWidth: number;
    clientWidth: number;
  },
) {
  Object.defineProperty(element, 'scrollWidth', {
    configurable: true,
    value: scrollWidth,
  });

  Object.defineProperty(element, 'clientWidth', {
    configurable: true,
    value: clientWidth,
  });
}

function triggerResizeObserver() {
  act(() => {
    resizeObserverCallback?.([], {} as ResizeObserver);
  });
}

function renderBracketGridWithOverflow(rounds: BracketRoundType[]) {
  render(<BracketGrid rounds={rounds} />);

  const contentScroll = screen.getByTestId('bracket-content-scroll');

  setHorizontalScrollMetrics(contentScroll, {
    scrollWidth: 1200,
    clientWidth: 800,
  });

  triggerResizeObserver();

  return contentScroll;
}

describe('BracketGrid', () => {
  beforeEach(() => {
    resizeObserverCallback = undefined;
    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('renders each bracket round', () => {
    const rounds = [
      makeRound({
        stage: 'semi_final',
        title: 'Semi-Finals',
      }),
      makeRound({
        stage: 'final',
        title: 'Final',
      }),
    ];

    render(<BracketGrid rounds={rounds} />);

    expect(screen.getAllByTestId('bracket-round')).toHaveLength(2);

    expect(screen.getByText('Semi-Finals')).toBeInTheDocument();
    expect(screen.getByText('Final')).toBeInTheDocument();
  });

  it('passes matches to each round', () => {
    render(
      <BracketGrid
        rounds={[
          makeRound({
            matches: [{ id: 1 }, { id: 2 }] as BracketRoundType['matches'],
          }),
        ]}
      />,
    );

    expect(screen.getByText('2 matches')).toBeInTheDocument();
  });

  it('keeps rounds in tournament order', () => {
    const rounds = [
      makeRound({
        stage: 'quarter_final',
        title: 'Quarter-Finals',
      }),
      makeRound({
        stage: 'semi_final',
        title: 'Semi-Finals',
      }),
      makeRound({
        stage: 'final',
        title: 'Final',
      }),
    ];

    render(<BracketGrid rounds={rounds} />);

    const renderedRounds = screen.getAllByTestId('bracket-round');

    expect(renderedRounds[0]).toHaveTextContent('quarter_final');
    expect(renderedRounds[1]).toHaveTextContent('semi_final');
    expect(renderedRounds[2]).toHaveTextContent('final');
  });

  it('renders no rounds when list is empty', () => {
    render(<BracketGrid rounds={[]} />);

    expect(screen.queryByTestId('bracket-round')).not.toBeInTheDocument();
  });
  it('does not render the horizontal scroll hint when bracket content fits', () => {
    render(<BracketGrid rounds={[makeRound()]} />);

    const contentScroll = screen.getByTestId('bracket-content-scroll');

    setHorizontalScrollMetrics(contentScroll, {
      scrollWidth: 800,
      clientWidth: 800,
    });

    triggerResizeObserver();

    expect(screen.queryByText('Scroll horizontally to view later rounds.')).not.toBeInTheDocument();
    expect(screen.queryByTestId('bracket-top-scroll')).not.toBeInTheDocument();
  });

  it('does not render the horizontal scroll hint when bracket content fits', () => {
    render(<BracketGrid rounds={[makeRound()]} />);

    const contentScroll = screen.getByTestId('bracket-content-scroll');

    setHorizontalScrollMetrics(contentScroll, {
      scrollWidth: 800,
      clientWidth: 800,
    });

    triggerResizeObserver();

    expect(screen.queryByText('Scroll horizontally to view later rounds.')).not.toBeInTheDocument();
    expect(screen.queryByTestId('bracket-top-scroll')).not.toBeInTheDocument();
  });

  it('renders the horizontal scroll hint when bracket content overflows', () => {
    renderBracketGridWithOverflow([makeRound(), makeRound({ stage: 'semi_final' })]);

    expect(screen.getByText('Scroll horizontally to view later rounds.')).toBeInTheDocument();
    expect(screen.getByTestId('bracket-top-scroll')).toBeInTheDocument();
  });

  it('sizes the top scroll spacer based on the number of rounds when content overflows', () => {
    renderBracketGridWithOverflow([
      makeRound({ stage: 'round_of_16' }),
      makeRound({ stage: 'quarter_final' }),
      makeRound({ stage: 'semi_final' }),
    ]);

    expect(screen.getByTestId('bracket-top-scroll-spacer')).toHaveStyle({
      width: '87rem',
    });
  });

  it('sizes the top scroll spacer based on the number of rounds when content overflows', () => {
    renderBracketGridWithOverflow([
      makeRound({ stage: 'round_of_16' }),
      makeRound({ stage: 'quarter_final' }),
      makeRound({ stage: 'semi_final' }),
    ]);

    expect(screen.getByTestId('bracket-top-scroll-spacer')).toHaveStyle({
      width: '87rem',
    });
  });

  it('sizes the top scroll spacer based on the number of rounds when content overflows', () => {
    renderBracketGridWithOverflow([
      makeRound({ stage: 'round_of_16' }),
      makeRound({ stage: 'quarter_final' }),
      makeRound({ stage: 'semi_final' }),
    ]);

    expect(screen.getByTestId('bracket-top-scroll-spacer')).toHaveStyle({
      width: '87rem',
    });
  });
});
