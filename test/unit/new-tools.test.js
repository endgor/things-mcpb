#!/usr/bin/env node

/**
 * Unit tests for New Tool Definitions
 *
 * Tests that all new tools (delete, move, area, tag management)
 * are properly defined with correct schemas
 */

import { TestSuite, expect } from '../test-utils.js';
import { TOOL_DEFINITIONS } from '../../server/tool-definitions.js';

const suite = new TestSuite('New Tools Unit Tests');

// Helper to find tool by name
function findTool(name) {
  return TOOL_DEFINITIONS.find(t => t.name === name);
}

// Test delete operations exist
suite.test('delete_todo tool is defined', () => {
  const tool = findTool('delete_todo');
  expect.toBeTruthy(tool);
  expect.toEqual(tool.name, 'delete_todo');
  expect.toBeTruthy(tool.inputSchema.properties.id);
  expect.toContain(tool.inputSchema.required, 'id');
  expect.toEqual(tool.destructiveHint, true);
});

suite.test('delete_project tool is defined', () => {
  const tool = findTool('delete_project');
  expect.toBeTruthy(tool);
  expect.toEqual(tool.name, 'delete_project');
  expect.toBeTruthy(tool.inputSchema.properties.id);
  expect.toContain(tool.inputSchema.required, 'id');
  expect.toEqual(tool.destructiveHint, true);
});

suite.test('empty_trash tool is defined', () => {
  const tool = findTool('empty_trash');
  expect.toBeTruthy(tool);
  expect.toEqual(tool.name, 'empty_trash');
  expect.toEqual(tool.destructiveHint, true);
});

// Test move operation exists
suite.test('move_todo tool is defined', () => {
  const tool = findTool('move_todo');
  expect.toBeTruthy(tool);
  expect.toEqual(tool.name, 'move_todo');
  expect.toBeTruthy(tool.inputSchema.properties.id);
  expect.toBeTruthy(tool.inputSchema.properties.project_id);
  expect.toBeTruthy(tool.inputSchema.properties.project_title);
  expect.toBeTruthy(tool.inputSchema.properties.area_id);
  expect.toBeTruthy(tool.inputSchema.properties.area_title);
  expect.toBeTruthy(tool.inputSchema.properties.list_id);
  expect.toContain(tool.inputSchema.required, 'id');
});

// Test tag management tools exist
suite.test('get_unused_tags tool is defined', () => {
  const tool = findTool('get_unused_tags');
  expect.toBeTruthy(tool);
  expect.toEqual(tool.name, 'get_unused_tags');
  expect.toEqual(tool.readOnlyHint, true);
});

suite.test('delete_tag tool is defined', () => {
  const tool = findTool('delete_tag');
  expect.toBeTruthy(tool);
  expect.toEqual(tool.name, 'delete_tag');
  expect.toBeTruthy(tool.inputSchema.properties.tag_name);
  expect.toContain(tool.inputSchema.required, 'tag_name');
  expect.toEqual(tool.destructiveHint, true);
});

// Test area CRUD tools exist
suite.test('add_area tool is defined', () => {
  const tool = findTool('add_area');
  expect.toBeTruthy(tool);
  expect.toEqual(tool.name, 'add_area');
  expect.toBeTruthy(tool.inputSchema.properties.title);
  expect.toBeTruthy(tool.inputSchema.properties.tags);
  expect.toContain(tool.inputSchema.required, 'title');
});

suite.test('update_area tool is defined', () => {
  const tool = findTool('update_area');
  expect.toBeTruthy(tool);
  expect.toEqual(tool.name, 'update_area');
  expect.toBeTruthy(tool.inputSchema.properties.id);
  expect.toBeTruthy(tool.inputSchema.properties.title);
  expect.toBeTruthy(tool.inputSchema.properties.tags);
  expect.toBeTruthy(tool.inputSchema.properties.collapsed);
  expect.toContain(tool.inputSchema.required, 'id');
});

suite.test('delete_area tool is defined', () => {
  const tool = findTool('delete_area');
  expect.toBeTruthy(tool);
  expect.toEqual(tool.name, 'delete_area');
  expect.toBeTruthy(tool.inputSchema.properties.id);
  expect.toContain(tool.inputSchema.required, 'id');
  expect.toEqual(tool.destructiveHint, true);
});

// Test when parameter descriptions are updated
suite.test('add_todo has enhanced when description', () => {
  const tool = findTool('add_todo');
  expect.toBeTruthy(tool);
  const whenDesc = tool.inputSchema.properties.when.description;
  expect.toContain(whenDesc, 'today');
  expect.toContain(whenDesc, 'anytime');
  expect.toContain(whenDesc, 'someday');
});

suite.test('update_todo has enhanced when description', () => {
  const tool = findTool('update_todo');
  expect.toBeTruthy(tool);
  const whenDesc = tool.inputSchema.properties.when.description;
  expect.toContain(whenDesc, 'today');
  expect.toContain(whenDesc, 'anytime');
  expect.toContain(whenDesc, 'someday');
});

suite.test('add_project has enhanced when description', () => {
  const tool = findTool('add_project');
  expect.toBeTruthy(tool);
  const whenDesc = tool.inputSchema.properties.when.description;
  expect.toContain(whenDesc, 'today');
  expect.toContain(whenDesc, 'anytime');
  expect.toContain(whenDesc, 'someday');
});

suite.test('update_project has enhanced when description', () => {
  const tool = findTool('update_project');
  expect.toBeTruthy(tool);
  const whenDesc = tool.inputSchema.properties.when.description;
  expect.toContain(whenDesc, 'today');
  expect.toContain(whenDesc, 'anytime');
  expect.toContain(whenDesc, 'someday');
});

// Test total tool count
suite.test('correct number of tools are defined', () => {
  // Should have original tools + 9 new tools
  // delete_todo, delete_project, empty_trash, move_todo
  // get_unused_tags, delete_tag
  // add_area, update_area, delete_area
  expect.toBeTruthy(TOOL_DEFINITIONS.length >= 21);
});

// Run the tests
suite.run().catch(() => process.exit(1));
