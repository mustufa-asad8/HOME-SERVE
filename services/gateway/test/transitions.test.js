import test from 'node:test';
import assert from 'node:assert/strict';
import { canRoleTransition, canTransition } from '../src/utils/transitions.js';

test('provider lifecycle stops at completion request', () => {
  assert.equal(canRoleTransition('provider', 'pending', 'confirmed'), true);
  assert.equal(canRoleTransition('provider', 'confirmed', 'in_progress'), true);
  assert.equal(canRoleTransition('provider', 'in_progress', 'completion_requested'), true);
  assert.equal(canRoleTransition('provider', 'completion_requested', 'completed'), false);
});

test('customers cancel eligible visits and confirm provider checkout', () => {
  assert.equal(canRoleTransition('customer', 'pending', 'cancelled'), true);
  assert.equal(canRoleTransition('customer', 'confirmed', 'cancelled'), true);
  assert.equal(canRoleTransition('customer', 'completion_requested', 'completed'), true);
  assert.equal(canRoleTransition('customer', 'in_progress', 'completed'), false);
  assert.equal(canRoleTransition('customer', 'pending', 'confirmed'), false);
});

test('admins may cancel but cannot impersonate providers or customers', () => {
  assert.equal(canRoleTransition('admin', 'pending', 'cancelled'), true);
  assert.equal(canRoleTransition('admin', 'confirmed', 'in_progress'), false);
  assert.equal(canRoleTransition('admin', 'completion_requested', 'completed'), false);
});

test('global lifecycle and terminal states are enforced', () => {
  assert.equal(canTransition('in_progress', 'completion_requested'), true);
  assert.equal(canTransition('completion_requested', 'completed'), true);
  assert.equal(canTransition('completed', 'confirmed'), false);
  assert.equal(canTransition('cancelled', 'pending'), false);
});
