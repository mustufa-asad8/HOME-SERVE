export const allowedTransitions = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in_progress', 'cancelled'],
  in_progress: ['completion_requested'],
  completion_requested: ['completed'],
  completed: [],
  cancelled: [],
};

const roleTransitions = {
  customer: {
    pending: ['cancelled'],
    confirmed: ['cancelled'],
    in_progress: [],
    completion_requested: ['completed'],
    completed: [],
    cancelled: [],
  },
  provider: {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['in_progress', 'cancelled'],
    in_progress: ['completion_requested'],
    completion_requested: [],
    completed: [],
    cancelled: [],
  },
  admin: {
    pending: ['cancelled'],
    confirmed: ['cancelled'],
    in_progress: [],
    completion_requested: [],
    completed: [],
    cancelled: [],
  },
};

export function canTransition(from, to) {
  return allowedTransitions[from]?.includes(to) ?? false;
}

export function canRoleTransition(role, from, to) {
  return roleTransitions[role]?.[from]?.includes(to) ?? false;
}
