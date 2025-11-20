#!/usr/bin/env node

/**
 * Unit tests for MCP Server functionality
 * 
 * Tests the core MCP protocol implementation, tool registration,
 * and request/response handling
 */

import { TestSuite, expect, MockMCPRequest, ValidationHelper } from '../test-utils.js';
import { TOOL_DEFINITIONS } from '../../server/tool-definitions.js';

const suite = new TestSuite('MCP Server Unit Tests');

// Test tool definitions structure
suite.test('all tool definitions have required properties', () => {
  expect.toBeTruthy(Array.isArray(TOOL_DEFINITIONS));
  expect.toBeTruthy(TOOL_DEFINITIONS.length > 0);
  
  TOOL_DEFINITIONS.forEach(tool => {
    ValidationHelper.validateToolDefinition(tool);
  });
});

// Test that all expected tools are defined
suite.test('all expected tools are defined', () => {
  const expectedTools = [
    // Todo operations
    'add_todo', 'update_todo', 'get_todos', 'delete_todo', 'move_todo',
    // Project operations
    'add_project', 'update_project', 'get_projects', 'delete_project',
    // List operations
    'get_inbox', 'get_today', 'get_anytime', 'get_upcoming', 'get_someday',
    'get_logbook', 'get_trash', 'empty_trash',
    // Search operations
    'search_todos', 'search_items', 'search_advanced', 'get_recent', 'show_item',
    // Tag operations
    'get_tags', 'get_tagged_items', 'get_unused_tags', 'delete_tag',
    // Area operations
    'get_areas', 'add_area', 'update_area', 'delete_area'
  ];

  const toolNames = TOOL_DEFINITIONS.map(tool => tool.name);

  expectedTools.forEach(expectedTool => {
    expect.toBeTruthy(
      toolNames.includes(expectedTool),
      `Tool ${expectedTool} should be defined`
    );
  });

  expect.toEqual(toolNames.length, expectedTools.length);
});

// Test tool naming consistency
suite.test('tool names follow consistent pattern', () => {
  const validPatterns = [
    /^add_\w+$/,     // add_todo, add_project, add_area
    /^update_\w+$/,  // update_todo, update_project, update_area
    /^get_\w+$/,     // get_todos, get_inbox, etc.
    /^search_\w+$/,  // search_todos, search_items
    /^show_\w+$/,    // show_item
    /^delete_\w+$/,  // delete_todo, delete_project, delete_tag, delete_area
    /^move_\w+$/,    // move_todo
    /^empty_\w+$/    // empty_trash
  ];

  TOOL_DEFINITIONS.forEach(tool => {
    const matchesPattern = validPatterns.some(pattern => pattern.test(tool.name));
    expect.toBeTruthy(
      matchesPattern,
      `Tool name ${tool.name} should follow standard pattern`
    );
  });
});

// Test specific tool schemas
suite.test('add_todo tool has correct schema', () => {
  const addTodo = TOOL_DEFINITIONS.find(tool => tool.name === 'add_todo');
  expect.toBeTruthy(addTodo);
  
  expect.toHaveProperty(addTodo.inputSchema, 'properties');
  expect.toHaveProperty(addTodo.inputSchema.properties, 'title');
  expect.toEqual(addTodo.inputSchema.properties.title.type, 'string');
  
  // Should support user-friendly parameters
  expect.toHaveProperty(addTodo.inputSchema.properties, 'when');
  expect.toHaveProperty(addTodo.inputSchema.properties, 'deadline');
  
  // Required fields
  if (addTodo.inputSchema.required) {
    expect.toBeTruthy(addTodo.inputSchema.required.includes('title'));
  }
});

suite.test('update_todo tool supports checklist_items', () => {
  const updateTodo = TOOL_DEFINITIONS.find(tool => tool.name === 'update_todo');
  expect.toBeTruthy(updateTodo);
  
  expect.toHaveProperty(updateTodo.inputSchema.properties, 'checklist_items');
  expect.toEqual(updateTodo.inputSchema.properties.checklist_items.type, 'array');
  expect.toEqual(updateTodo.inputSchema.properties.checklist_items.items.type, 'string');
});

suite.test('list operation tools have consistent schemas', () => {
  const listTools = [
    'get_inbox', 'get_today', 'get_anytime', 'get_upcoming', 
    'get_someday', 'get_logbook', 'get_trash'
  ];
  
  listTools.forEach(toolName => {
    const tool = TOOL_DEFINITIONS.find(t => t.name === toolName);
    expect.toBeTruthy(tool, `${toolName} should be defined`);
    
    // List operations should have minimal required parameters
    expect.toEqual(tool.inputSchema.type, 'object');
    
    // Should not require any parameters (all optional)
    if (tool.inputSchema.required) {
      expect.toEqual(tool.inputSchema.required.length, 0);
    }
  });
});

// Test parameter validation patterns
suite.test('tools use consistent parameter validation', () => {
  const dateParameters = ['when', 'deadline', 'activation_date', 'due_date'];
  const tagParameters = ['tags'];
  const idParameters = ['id', 'project_id', 'area_id', 'list_id'];
  
  TOOL_DEFINITIONS.forEach(tool => {
    if (!tool.inputSchema.properties) return;
    
    // Check date parameters
    dateParameters.forEach(param => {
      if (tool.inputSchema.properties[param]) {
        const paramDef = tool.inputSchema.properties[param];
        expect.toEqual(paramDef.type, 'string');
        
        // Should have format validation for dates
        if (param === 'when' || param === 'deadline' || param === 'activation_date' || param === 'due_date') {
          const desc = paramDef.description.toLowerCase();
          expect.toBeTruthy(desc.includes('date') || desc.includes('yyyy-mm-dd'));
        }
      }
    });
    
    // Check tag parameters
    tagParameters.forEach(param => {
      if (tool.inputSchema.properties[param]) {
        const paramDef = tool.inputSchema.properties[param];
        expect.toEqual(paramDef.type, 'array');
        expect.toEqual(paramDef.items.type, 'string');
      }
    });
    
    // Check ID parameters
    idParameters.forEach(param => {
      if (tool.inputSchema.properties[param]) {
        const paramDef = tool.inputSchema.properties[param];
        expect.toEqual(paramDef.type, 'string');
      }
    });
  });
});

// Test tool descriptions are informative
suite.test('all tools have informative descriptions', () => {
  TOOL_DEFINITIONS.forEach(tool => {
    expect.toBeTruthy(tool.description);
    expect.toBeTruthy(tool.description.length > 10);
    expect.toBeTruthy(tool.description.length < 200); // Not too verbose
    
    // Should not just repeat the tool name
    expect.toBeFalsy(tool.description === tool.name);
    
    // Should contain key action words
    const actionWords = ['add', 'create', 'update', 'modify', 'get', 'retrieve', 'search', 'find', 'delete', 'remove', 'show', 'display', 'relocate', 'empty', 'permanently'];
    const hasActionWord = actionWords.some(word =>
      tool.description.toLowerCase().includes(word)
    );
    expect.toBeTruthy(hasActionWord, `Tool ${tool.name} description should contain action word`);
  });
});

// Test that user-friendly parameters are documented
suite.test('user-friendly parameters are properly documented', () => {
  const userFriendlyParams = [
    { param: 'when', description: /when.*work|schedul/i },
    { param: 'deadline', description: /when.*due|deadline/i }
  ];
  
  TOOL_DEFINITIONS.forEach(tool => {
    if (!tool.inputSchema.properties) return;
    
    userFriendlyParams.forEach(({ param, description }) => {
      if (tool.inputSchema.properties[param]) {
        const paramDef = tool.inputSchema.properties[param];
        expect.toBeTruthy(paramDef.description);
        expect.toBeTruthy(
          description.test(paramDef.description),
          `Parameter ${param} in ${tool.name} should have descriptive documentation`
        );
      }
    });
  });
});

// Test tool schema validation
suite.test('tool schemas are valid JSON Schema', () => {
  TOOL_DEFINITIONS.forEach(tool => {
    const schema = tool.inputSchema;
    
    // Basic JSON Schema structure
    expect.toHaveProperty(schema, 'type');
    expect.toEqual(schema.type, 'object');
    
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([propName, propDef]) => {
        expect.toHaveProperty(propDef, 'type');
        expect.toBeTruthy(['string', 'number', 'integer', 'boolean', 'array', 'object'].includes(propDef.type));
        
        if (propDef.type === 'array') {
          expect.toHaveProperty(propDef, 'items');
          expect.toHaveProperty(propDef.items, 'type');
        }
      });
    }
    
    if (schema.required) {
      expect.toBeTruthy(Array.isArray(schema.required));
      
      if (schema.properties) {
        schema.required.forEach(requiredProp => {
          expect.toBeTruthy(
            schema.properties.hasOwnProperty(requiredProp),
            `Required property ${requiredProp} should be defined in properties for tool ${tool.name}`
          );
        });
      }
    }
  });
});

// Test tool count is reasonable
suite.test('has reasonable number of tools', () => {
  expect.toBeTruthy(TOOL_DEFINITIONS.length >= 20);
  expect.toBeTruthy(TOOL_DEFINITIONS.length <= 35);
});

// Test no duplicate tool names
suite.test('has no duplicate tool names', () => {
  const toolNames = TOOL_DEFINITIONS.map(tool => tool.name);
  const uniqueNames = [...new Set(toolNames)];
  
  expect.toEqual(toolNames.length, uniqueNames.length);
});

// Run the tests
suite.run().catch(() => process.exit(1));