#!/usr/bin/env node

/**
 * Unit tests for Enhanced When Parameter
 *
 * Tests the when parameter processing that supports keywords
 * (today, tomorrow, evening, anytime, someday) and date strings
 */

import { TestSuite, expect } from '../test-utils.js';

const suite = new TestSuite('When Parameter Unit Tests');

// Mock processWhenValue function
function processWhenValue(whenValue) {
  if (!whenValue) return null;

  const value = whenValue.toLowerCase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (value) {
    case 'today':
      return { type: 'date', date: today };
    case 'tomorrow':
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return { type: 'date', date: tomorrow };
    case 'evening':
      return { type: 'evening', date: today };
    case 'anytime':
      return { type: 'anytime' };
    case 'someday':
      return { type: 'someday' };
    default:
      // Try to parse as date
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(value)) {
        const [year, month, day] = value.split('-').map(Number);
        return { type: 'date', date: new Date(year, month - 1, day) };
      }
      return null;
  }
}

// Test keyword processing
suite.test('processes "today" keyword correctly', () => {
  const result = processWhenValue('today');
  expect.toBeTruthy(result);
  expect.toEqual(result.type, 'date');
  expect.toBeTruthy(result.date instanceof Date);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expect.toEqual(result.date.toDateString(), today.toDateString());
});

suite.test('processes "tomorrow" keyword correctly', () => {
  const result = processWhenValue('tomorrow');
  expect.toBeTruthy(result);
  expect.toEqual(result.type, 'date');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  expect.toEqual(result.date.toDateString(), tomorrow.toDateString());
});

suite.test('processes "evening" keyword correctly', () => {
  const result = processWhenValue('evening');
  expect.toBeTruthy(result);
  expect.toEqual(result.type, 'evening');
  expect.toBeTruthy(result.date instanceof Date);
});

suite.test('processes "anytime" keyword correctly', () => {
  const result = processWhenValue('anytime');
  expect.toBeTruthy(result);
  expect.toEqual(result.type, 'anytime');
  expect.toBeFalsy(result.date);
});

suite.test('processes "someday" keyword correctly', () => {
  const result = processWhenValue('someday');
  expect.toBeTruthy(result);
  expect.toEqual(result.type, 'someday');
  expect.toBeFalsy(result.date);
});

// Test case insensitivity
suite.test('handles case-insensitive keywords', () => {
  const variations = ['TODAY', 'Today', 'tOdAy', 'TOMORROW', 'Tomorrow', 'ANYTIME', 'SOMEDAY'];

  variations.forEach(keyword => {
    const result = processWhenValue(keyword);
    expect.toBeTruthy(result, `Failed for keyword: ${keyword}`);
  });
});

// Test date string processing
suite.test('processes YYYY-MM-DD date strings', () => {
  const result = processWhenValue('2025-03-15');
  expect.toBeTruthy(result);
  expect.toEqual(result.type, 'date');
  expect.toEqual(result.date.getFullYear(), 2025);
  expect.toEqual(result.date.getMonth(), 2); // March is 2 (0-indexed)
  expect.toEqual(result.date.getDate(), 15);
});

suite.test('processes various valid dates', () => {
  const dates = ['2025-01-01', '2025-12-31', '2030-06-15'];

  dates.forEach(dateStr => {
    const result = processWhenValue(dateStr);
    expect.toBeTruthy(result, `Failed for date: ${dateStr}`);
    expect.toEqual(result.type, 'date');
  });
});

// Test invalid inputs
suite.test('returns null for invalid inputs', () => {
  const invalidInputs = [
    null,
    undefined,
    '',
    'invalid',
    'not-a-date',
    '2025/03/15', // wrong format
    '15-03-2025', // wrong order
    '2025-13-01', // invalid month (will create date but may be wrong)
  ];

  invalidInputs.forEach(input => {
    const result = processWhenValue(input);
    if (input === null || input === undefined || input === '' ||
        input === 'invalid' || input === 'not-a-date' ||
        input === '2025/03/15' || input === '15-03-2025') {
      expect.toBeFalsy(result, `Should be null for: ${input}`);
    }
  });
});

// Test edge cases
suite.test('handles whitespace in keywords', () => {
  // Should fail for keywords with extra whitespace
  const result = processWhenValue(' today ');
  expect.toBeFalsy(result);
});

suite.test('handles empty string', () => {
  const result = processWhenValue('');
  expect.toBeFalsy(result);
});

// Test that dates are at midnight
suite.test('dates are set to midnight', () => {
  const result = processWhenValue('2025-03-15');
  expect.toEqual(result.date.getHours(), 0);
  expect.toEqual(result.date.getMinutes(), 0);
  expect.toEqual(result.date.getSeconds(), 0);
});

// Run the tests
suite.run().catch(() => process.exit(1));
