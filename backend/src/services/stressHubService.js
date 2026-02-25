const COLOR_IMPACTS = {
  BLUE: {
    description: 'Calming; reduces stress',
    stressDelta: -12,
  },
  RED: {
    description: 'Energizing; increases passion',
    stressDelta: 14,
  },
  YELLOW: {
    description: 'Uplifting; boosts positivity',
    stressDelta: -6,
  },
  GREEN: {
    description: 'Balancing; promotes harmony',
    stressDelta: -10,
  },
  PURPLE: {
    description: 'Introspective; encourages intuition',
    stressDelta: -4,
  },
  ORANGE: {
    description: 'Joyful; stimulates creativity',
    stressDelta: -5,
  },
  WHITE: {
    description: 'Protective; provides grounding',
    stressDelta: -8,
  },
};

const GAME_CONFIG = {
  BREATHING: {
    title: 'Breathing Exercise',
    basePoints: 20,
    pointsPerMinute: 1,
    description: 'Guided breath cycles to quickly lower stress.',
  },
  PUZZLE: {
    title: 'Quick Puzzle',
    basePoints: 25,
    pointsPerMinute: 2,
    description: 'Light cognitive challenge to reset focus.',
  },
  POMODORO: {
    title: 'Pomodoro Timer',
    basePoints: 30,
    pointsPerMinute: 1,
    description: 'Focus sprint with gamified streak points.',
  },
  MEDITATION: {
    title: 'Meditation Timer',
    basePoints: 28,
    pointsPerMinute: 1,
    description: 'Mindful sessions with calming sound prompts.',
    calmingSounds: ['Rain', 'Forest', 'Ocean', 'White Noise'],
  },
};

const clampScore = (value) => {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
};

const normalizeColors = (selectedColors = []) =>
  selectedColors
    .map((color) => String(color || '').trim().toUpperCase())
    .filter(Boolean);

const analyzeStressByColors = (selectedColors = []) => {
  const normalizedColors = normalizeColors(selectedColors);

  const invalidColors = normalizedColors.filter((color) => !COLOR_IMPACTS[color]);
  if (invalidColors.length > 0) {
    throw new Error(`Invalid colors: ${invalidColors.join(', ')}`);
  }

  const baseScore = 50;
  const scoreDelta = normalizedColors.reduce(
    (total, color) => total + COLOR_IMPACTS[color].stressDelta,
    0
  );
  const stressScore = clampScore(baseScore + scoreDelta);

  let stressLevel = 'MEDIUM';
  if (stressScore >= 70) stressLevel = 'HIGH';
  if (stressScore <= 35) stressLevel = 'LOW';

  const colorInsights = normalizedColors.map((color) => ({
    color,
    ...COLOR_IMPACTS[color],
  }));

  return {
    normalizedColors,
    stressScore,
    stressLevel,
    colorInsights,
  };
};

const getSmartSuggestions = (stressLevel) => {
  if (stressLevel !== 'HIGH') return [];

  return [
    'Take a 5-minute breathing exercise (4-4-6 pattern).',
    'Start a 10-minute Pomodoro with one small task only.',
    'Use a 7-minute meditation timer with calming sounds.',
    'Hydrate and stretch for 3 minutes before continuing study.',
  ];
};

const calculateRelaxationPoints = (activityType, durationMinutes, completed) => {
  const game = GAME_CONFIG[activityType];
  if (!game || !completed) return 0;
  return game.basePoints + Math.max(0, durationMinutes) * game.pointsPerMinute;
};

module.exports = {
  COLOR_IMPACTS,
  GAME_CONFIG,
  analyzeStressByColors,
  getSmartSuggestions,
  calculateRelaxationPoints,
};
