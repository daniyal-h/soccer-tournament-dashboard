export const LEADERBOARD_CATEGORIES = ['goals', 'assists', 'yellow_cards'] as const;

export const EMPTY_MESSAGES = {
  goals: 'No goals have been recorded yet.',
  assists: 'No assists have been recorded yet.',
  yellow_cards: 'No yellow cards have been recorded yet.',
};

export const CATEGORY_CONTENT = {
  goals: {
    title: 'Top Scorers',
    description: 'Tournament goal leaders ranked by total goals scored.',
    loading: 'Loading top scorers...',
    valueLabel: 'Goals',
  },

  assists: {
    title: 'Top Assists',
    description: 'Tournament creators ranked by total assists.',
    loading: 'Loading top playmakers...',
    valueLabel: 'Assists',
  },

  yellow_cards: {
    title: 'Yellow Cards',
    description: 'Players ranked by total yellow cards received.',
    loading: 'Loading discipline rankings...',
    valueLabel: 'Cards',
  },
};
