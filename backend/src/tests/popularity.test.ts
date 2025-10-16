import { describe, it, expect } from 'vitest';
import { computePopularityScore } from '../services/userService.js';

describe('computePopularityScore', () => {
  it('adds unique friends and half the shared hobbies', () => {
    const user = { hobbies: ['a', 'b', 'c'] };
    const friends = [
      ['a', 'x'], // 1 shared
      ['b', 'y', 'a'], // 2 shared (a,b)
      ['z'] // 0 shared
    ];
    const score = computePopularityScore(user, friends);
    // unique friends: 3, shared hobbies total: 3 -> 3 + 3*0.5 = 4.5
    expect(score).toBe(4.5);
  });
});


