import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import EventCard from '@/components/matchEvents/timeline/EventCard';

import type { MatchEvent } from '@/types/matchEvent';

import { PENALTY_SHOOTOUT_COMMENT } from '@/constants/matchEvents';

const team = {
  id: 1,
  name: 'Canada',
  short_name: 'CAN',
  logo_url: null,
};

const player = {
  id: 10,
  external_api_id: 100,
  display_name: 'A. Davies',
  first_name: 'Alphonso',
  last_name: 'Davies',
  photo_url: null,
  nationality: 'Canada',
  date_of_birth: null,
  height: null,
};

const secondaryPlayer = {
  id: 11,
  external_api_id: 101,
  display_name: 'J. David',
  first_name: 'Jonathan',
  last_name: 'David',
  photo_url: null,
  nationality: 'Canada',
  date_of_birth: null,
  height: null,
};

const baseEvent: MatchEvent = {
  team,
  player,
  secondary_player: secondaryPlayer,
  player_name: null,
  secondary_player_name: null,
  player_external_id: null,
  secondary_player_external_id: null,
  event_type: 'goal',
  minute: 12,
  extra_minute: null,
  detail: null,
  comments: null,
};

vi.mock('@/components/ui/card', () => ({
  Card: ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div data-testid="event-card" className={className}>
      {children}
    </div>
  ),
}));

function makeEvent(overrides: Partial<MatchEvent> = {}): MatchEvent {
  return {
    ...baseEvent,
    ...overrides,
  };
}

describe('EventCard', () => {
  it('applies base event card styling', () => {
    render(<EventCard event={baseEvent} score="1-0" />);

    expect(screen.getByTestId('event-card')).toHaveClass('w-[42vw]', 'p-4', 'shadow-md', 'sm:w-80');
  });

  it('renders goal event title, player name, minute, assist, and score', () => {
    render(<EventCard event={baseEvent} score="1-0" />);

    expect(screen.getByText('GOAL!')).toBeInTheDocument();
    expect(screen.getByText('A. Davies')).toBeInTheDocument();
    expect(screen.getByText("12'")).toBeInTheDocument();
    expect(screen.getByText('Assisted by J. David')).toBeInTheDocument();
    expect(screen.getByText('1-0')).toBeInTheDocument();
  });

  it('uses provided display names over nested player names', () => {
    render(
      <EventCard
        event={makeEvent({
          player_name: 'Displayed Player',
          secondary_player_name: 'Displayed Assistant',
        })}
        score="1-0"
      />,
    );

    expect(screen.getByText('Displayed Player')).toBeInTheDocument();
    expect(screen.getByText('Assisted by Displayed Assistant')).toBeInTheDocument();
    expect(screen.queryByText('A. Davies')).not.toBeInTheDocument();
  });

  it('renders stoppage-time minute when extra_minute is present', () => {
    render(<EventCard event={makeEvent({ minute: 45, extra_minute: 3 })} score="1-0" />);

    expect(screen.getByText("45+3'")).toBeInTheDocument();
  });

  it('renders substitution replacement text and no score badge', () => {
    render(
      <EventCard
        event={makeEvent({
          event_type: 'substitution',
          player_name: 'C. Larin',
          secondary_player_name: 'J. David',
        })}
        score="1-0"
      />,
    );

    expect(screen.getByText('SUB')).toBeInTheDocument();
    expect(screen.getByText('J. David')).toBeInTheDocument();
    expect(screen.getByText('Replaced C. Larin')).toBeInTheDocument();
    expect(screen.queryByText('1-0')).not.toBeInTheDocument();
  });

  it('does not render assist text when goal event has no secondary player', () => {
    render(
      <EventCard
        event={makeEvent({
          secondary_player: null,
          secondary_player_name: null,
        })}
        score="1-0"
      />,
    );

    expect(screen.queryByText(/Assisted by/)).not.toBeInTheDocument();
    expect(screen.getByText('1-0')).toBeInTheDocument();
  });

  it('does not render replacement text for non-substitution events with secondary players', () => {
    render(
      <EventCard
        event={makeEvent({
          event_type: 'yellow_card',
          secondary_player_name: 'J. David',
        })}
        score="0-0"
      />,
    );

    expect(screen.queryByText('Replaced J. David')).not.toBeInTheDocument();
  });

  it('renders detail and comments for non-shootout events', () => {
    render(
      <EventCard
        event={makeEvent({
          event_type: 'yellow_card',
          detail: 'Foul',
          comments: 'Late challenge',
        })}
        score="0-0"
      />,
    );

    expect(screen.getByText('YELLOW CARD')).toBeInTheDocument();
    expect(screen.getByText('Foul')).toBeInTheDocument();
    expect(screen.getByText('Late challenge')).toBeInTheDocument();
    expect(screen.queryByText('0-0')).not.toBeInTheDocument();
  });

  it('renders regular penalty goals as goal events with score and assist', () => {
    render(
      <EventCard
        event={makeEvent({
          event_type: 'penalty_goal',
          comments: null,
        })}
        score="2-1"
      />,
    );

    expect(screen.getByText('PENALTY SCORED!')).toBeInTheDocument();
    expect(screen.getByText('2-1')).toBeInTheDocument();
    expect(screen.getByText('Assisted by J. David')).toBeInTheDocument();
  });

  it('renders penalty shootout scored penalty state', () => {
    render(
      <EventCard
        event={makeEvent({
          event_type: 'penalty_goal',
          comments: PENALTY_SHOOTOUT_COMMENT,
        })}
        score="4-3"
      />,
    );

    expect(screen.getByText('4-3')).toBeInTheDocument();
    expect(screen.getByText('Scored penalty')).toBeInTheDocument();
    expect(screen.queryByText(PENALTY_SHOOTOUT_COMMENT)).not.toBeInTheDocument();
    expect(screen.queryByText(/Assisted by/)).not.toBeInTheDocument();
  });

  it('renders penalty shootout missed penalty state', () => {
    render(
      <EventCard
        event={makeEvent({
          event_type: 'penalty_miss',
          comments: PENALTY_SHOOTOUT_COMMENT,
        })}
        score="4-3"
      />,
    );

    expect(screen.getByText('PENALTY MISSED')).toBeInTheDocument();
    expect(screen.getByText('4-3')).toBeInTheDocument();
    expect(screen.getByText('Missed penalty')).toBeInTheDocument();
  });

  it('renders own goal as a goal event with score but without assist text when no secondary player exists', () => {
    render(
      <EventCard
        event={makeEvent({
          event_type: 'own_goal',
          secondary_player: null,
          secondary_player_name: null,
        })}
        score="0-1"
      />,
    );

    expect(screen.getByText('OWN GOAL')).toBeInTheDocument();
    expect(screen.getByText('0-1')).toBeInTheDocument();
    expect(screen.queryByText(/Assisted by/)).not.toBeInTheDocument();
  });
});
