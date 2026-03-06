const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const toDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
};

const dateKey = (date) => date.toISOString().split('T')[0];

const isWeekend = (date) => {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
};

const defaultAvailability = {
  defaultDailyHours: 3,
  weekendDailyHours: 4,
  blackoutDates: [],
  dailyOverrides: [],
};

const defaultPreferences = {
  sessionLengthMinutes: 60,
  maxDailySessions: 4,
  fatigueSensitivity: 'medium',
  includeBufferDays: 1,
  preferredFocusBlocks: [],
};

const getAvailability = (availability = {}) => ({
  ...defaultAvailability,
  ...availability,
  blackoutDates: availability.blackoutDates || [],
  dailyOverrides: availability.dailyOverrides || [],
});

const getPreferences = (preferences = {}) => ({
  ...defaultPreferences,
  ...preferences,
});

const isBlackout = (date, availability) => {
  const key = dateKey(date);
  return availability.blackoutDates
    .map((entry) => dateKey(new Date(entry)))
    .includes(key);
};

const getOverrideHours = (date, availability) => {
  const key = dateKey(date);
  const override = availability.dailyOverrides.find(
    (entry) => dateKey(new Date(entry.date)) === key
  );
  return override ? override.hours : undefined;
};

const getDayCapacityHours = (date, availability) => {
  if (isBlackout(date, availability)) return 0;

  const override = getOverrideHours(date, availability);
  if (typeof override === 'number') {
    return Math.max(0, override);
  }

  const weekend = isWeekend(date);
  const base = weekend
    ? availability.weekendDailyHours
    : availability.defaultDailyHours;

  return Math.max(0, base);
};

const computeWindow = (plan) => {
  const startDate = toDate(plan.startDate) || new Date();

  const moduleDueDates = (plan.modules || [])
    .map((module) => toDate(module.dueDate))
    .filter(Boolean);

  const targetDate =
    toDate(plan.targetDate) ||
    (moduleDueDates.length
      ? new Date(Math.max(...moduleDueDates.map((d) => d.getTime())))
      : new Date(startDate.getTime() + 30 * MILLISECONDS_IN_DAY));

  const preferences = getPreferences(plan.preferences);
  const endDate = new Date(targetDate);

  if (preferences.includeBufferDays) {
    endDate.setUTCDate(endDate.getUTCDate() - preferences.includeBufferDays);
    if (endDate < startDate) {
      endDate.setTime(targetDate.getTime());
    }
  }

  return { startDate, endDate, targetDate };
};

const estimateHours = (module) => {
  if (module.estimatedHours) return module.estimatedHours;
  if (module.totalTopics) return module.totalTopics * 1.5;
  if (module.remainingDays) return module.remainingDays * 1.2;

  switch (module.type) {
    case 'assignment':
      return 8;
    case 'exam':
      return 20;
    default:
      return 15;
  }
};

const difficultyWeight = (difficulty = 'medium') => {
  switch (difficulty) {
    case 'easy':
      return 0.9;
    case 'hard':
      return 1.2;
    default:
      return 1;
  }
};

const computeModuleState = (modules, startDate, targetDate) =>
  (modules || []).map((module, index) => {
    const dueDate = toDate(module.dueDate) || targetDate;
    const hours = estimateHours(module);
    const daysToDue = Math.max(
      1,
      Math.ceil((dueDate.getTime() - startDate.getTime()) / MILLISECONDS_IN_DAY)
    );
    const urgencyBoost = clamp(10 / daysToDue, 0.5, 10);
    const basePriority = module.priority || 3;
    const difficultyFactor = difficultyWeight(module.difficulty);

    return {
      ...module,
      _tempId: `${module.name || 'Module'}-${index}`,
      dueDate,
      estimatedHours: hours,
      hoursRemaining: hours,
      weight:
        basePriority * 0.5 + urgencyBoost * 0.3 + difficultyFactor * 0.2,
    };
  });

const generateTimeline = (startDate, endDate, availability) => {
  const timeline = [];
  const cursor = new Date(
    Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate()
    )
  );

  while (cursor <= endDate) {
    timeline.push({
      date: new Date(cursor),
      capacityHours: getDayCapacityHours(cursor, availability),
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return timeline;
};

const selectModule = (modules, currentDate) => {
  const todayKey = dateKey(currentDate);
  const eligible = modules
    .filter((module) => module.hoursRemaining > 0)
    .map((module) => {
      const daysToDue = Math.max(
        1,
        Math.ceil(
          (module.dueDate.getTime() - currentDate.getTime()) /
            MILLISECONDS_IN_DAY
        )
      );
      const deadlineFactor = clamp(10 / daysToDue, 0.5, 10);
      const remainingRatio = module.hoursRemaining / module.estimatedHours;
      const score =
        module.weight +
        deadlineFactor * 0.4 +
        clamp(remainingRatio, 0.1, 1) * 0.2;

      return {
        module,
        score,
        overdue: module.dueDate < currentDate && dateKey(module.dueDate) !== todayKey,
      };
    })
    .sort((a, b) => {
      if (a.overdue && !b.overdue) return -1;
      if (!a.overdue && b.overdue) return 1;
      return b.score - a.score;
    });

  return eligible.length ? eligible[0].module : undefined;
};

const getFocusType = (module, currentDate) => {
  const daysToDue = Math.max(
    0,
    Math.ceil(
      (module.dueDate.getTime() - currentDate.getTime()) / MILLISECONDS_IN_DAY
    )
  );

  if (module.type === 'exam' && daysToDue <= 2) return 'assessment';
  if (module.type === 'exam') return 'revision';
  if (module.type === 'assignment' && daysToDue <= 1) return 'assessment';
  return 'learn';
};

const getIntensity = (module) => {
  switch (module.difficulty) {
    case 'hard':
      return 'deep';
    case 'easy':
      return 'light';
    default:
      return 'standard';
  }
};

const buildRecommendations = (module, focusType) => {
  const suggestions = [];

  if (module.type === 'exam') {
    suggestions.push('Attempt timed practice questions');
    suggestions.push('Summarize weak areas at end of session');
  } else if (module.type === 'assignment') {
    suggestions.push('Break deliverable into sub tasks before starting');
  } else {
    suggestions.push('Review lecture notes then apply active recall');
  }

  if (focusType === 'assessment') {
    suggestions.push('Validate answers against rubric immediately');
  } else if (focusType === 'revision') {
    suggestions.push('Use spaced repetition cards after the session');
  }

  return suggestions;
};

const allocateSessions = (timeline, modules, preferences) => {
  const sessions = [];
  const sessionLengthHours = Math.max(
    0.5,
    (preferences.sessionLengthMinutes || 60) / 60
  );
  const maxSessionsPerDay = preferences.maxDailySessions || 4;

  timeline.forEach((slot) => {
    let hoursLeft = slot.capacityHours;
    let sessionsToday = 0;

    while (hoursLeft > 0.25 && sessionsToday < maxSessionsPerDay) {
      const module = selectModule(modules, slot.date);
      if (!module) break;

      const duration = Math.min(
        sessionLengthHours,
        module.hoursRemaining,
        hoursLeft
      );

      if (duration < 0.25) break;

      const focusType = getFocusType(module, slot.date);
      const intensity = getIntensity(module);
      const recommendations = buildRecommendations(module, focusType);

      sessions.push({
        scheduledDate: slot.date,
        durationHours: Number(duration.toFixed(2)),
        moduleName: module.name,
        moduleType: module.type,
        focusType,
        intensity,
        strategy:
          focusType === 'assessment'
            ? 'Simulate exam conditions and review answers immediately'
            : 'Apply Pomodoro (25/5) with short reflection at the end',
        recommendations,
      });

      module.hoursRemaining = Number(
        Math.max(0, module.hoursRemaining - duration).toFixed(2)
      );
      module.assignedHours =
        (module.assignedHours || 0) + Number(duration.toFixed(2));

      hoursLeft = Number(Math.max(0, hoursLeft - duration).toFixed(2));
      sessionsToday += 1;

      const modulesRemaining = modules.some((m) => m.hoursRemaining > 0);
      if (!modulesRemaining) break;
    }
  });

  return sessions;
};

const computeSummary = (timeline, modules, sessions, targetDate) => {
  const capacityHours = Number(
    timeline.reduce((sum, slot) => sum + slot.capacityHours, 0).toFixed(2)
  );
  const requiredHours = Number(
    modules.reduce((sum, module) => sum + module.estimatedHours, 0).toFixed(2)
  );
  const totalStudyHours = Number(
    sessions.reduce((sum, session) => sum + session.durationHours, 0).toFixed(2)
  );

  const workloadRatio = requiredHours / (capacityHours || requiredHours || 1);
  const workloadLabel =
    workloadRatio < 0.7
      ? 'comfortable'
      : workloadRatio <= 1
      ? 'balanced'
      : 'overloaded';

  const moduleBreakdown = modules.map((module) => ({
    moduleName: module.name,
    hoursAssigned: Number((module.assignedHours || 0).toFixed(2)),
  }));

  const riskAlerts = [];
  if (requiredHours > capacityHours) {
    riskAlerts.push(
      `Only ${capacityHours}h available before ${targetDate
        .toISOString()
        .split('T')[0]}, but ${requiredHours}h are needed.`
    );
  }

  modules.forEach((module) => {
    if ((module.hoursRemaining || 0) > 0) {
      riskAlerts.push(
        `${module.name} still needs ${module.hoursRemaining.toFixed(
          1
        )}h. Add more availability or reduce scope.`
      );
    }
  });

  return {
    totalStudyHours,
    totalDays: timeline.length,
    capacityHours,
    requiredHours,
    workloadLabel,
    riskAlerts,
    moduleBreakdown,
  };
};

const generateStudyPlanSchedule = (plan = {}) => {
  const availability = getAvailability(plan.availability);
  const preferences = getPreferences(plan.preferences);
  const { startDate, endDate, targetDate } = computeWindow(plan);
  const timeline = generateTimeline(startDate, endDate, availability);
  const modules = computeModuleState(plan.modules || [], startDate, targetDate);

  const sessions = allocateSessions(timeline, modules, preferences);
  const summary = computeSummary(timeline, modules, sessions, targetDate);

  return {
    sessions,
    summary,
    modules: modules.map((module) => {
      const { _tempId, weight, ...rest } = module;
      return rest;
    }),
  };
};

module.exports = {
  generateStudyPlanSchedule,
};
