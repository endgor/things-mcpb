/**
 * Todo operations for Things 3
 */

import { mapTodo, formatTags, scheduleItem, parseLocalDate, applyWhenValue } from './utils.js';

export class TodoOperations {
  
  /**
   * Add a new todo
   */
  static add(things, params) {
    // Create the todo
    const todoProps = {
      name: params.name
    };
    
    if (params.notes) {
      todoProps.notes = params.notes;
    }
    
    const todo = things.ToDo(todoProps);

    // Determine target location
    let targetList = null;

    // Check for list_id first
    if (params.list_id) {
      try {
        targetList = things.lists.byId(params.list_id);
      } catch (e) {
        // List not found, will add to inbox
      }
    } else if (params.list_title) {
      // Check projects
      try {
        const projects = things.projects();
        for (let project of projects) {
          if (project.name() === params.list_title) {
            targetList = project;
            break;
          }
        }
      } catch (e) {}

      // Check areas if not found in projects
      if (!targetList) {
        try {
          const areas = things.areas();
          for (let area of areas) {
            if (area.name() === params.list_title) {
              targetList = area;
              break;
            }
          }
        } catch (e) {}
      }
    }

    // Add todo to appropriate location
    if (targetList) {
      targetList.toDos.push(todo);
    } else {
      // Only add to general todos (inbox) if no specific list/project
      things.toDos.push(todo);
    }

    // Set tags (convert array to comma-separated string)
    if (params.tags && params.tags.length > 0) {
      todo.tagNames = formatTags(params.tags);
    }

    // Apply when value (supports: today, tomorrow, evening, anytime, someday, or date)
    if (params.activation_date) {
      applyWhenValue(things, todo, params.activation_date);
    }

    // Set due date (when actually due)
    if (params.due_date) {
      todo.dueDate = parseLocalDate(params.due_date);
    }

    // Add checklist items
    if (params.child_tasks && params.child_tasks.length > 0) {
      params.child_tasks.forEach(itemTitle => {
        try {
          const checklistItem = things.ToDo({ name: itemTitle });
          todo.toDos.push(checklistItem);
        } catch (e) {
          // Checklist item creation failed
        }
      });
    }

    // Add to heading within project
    if (params.heading && params.list_id) {
      try {
        const project = things.projects.byId(params.list_id);
        // Get headings (toDoGroups) from the project
        const headings = project.toDoGroups();
        let targetHeading = null;

        // Find the heading by name
        for (let heading of headings) {
          if (heading.name() === params.heading) {
            targetHeading = heading;
            break;
          }
        }

        if (targetHeading) {
          // Move todo to the heading
          things.move(todo, { to: targetHeading });
        }
      } catch (e) {
        // Heading not found or move failed
      }
    }
    
    return mapTodo(todo);
  }
  
  /**
   * Update an existing todo
   */
  static update(things, params) {
    // Try to find the item as either a todo or a project
    let todo = null;
    let isProject = false;
    
    try {
      todo = things.toDos.byId(params.id);
    } catch (e) {
      try {
        todo = things.projects.byId(params.id);
        isProject = true;
      } catch (e2) {
        throw new Error(`Todo/Project with id ${params.id} not found`);
      }
    }
    
    // Update basic properties
    if (params.name !== undefined) {
      todo.name = params.name;
    }
    
    if (params.notes !== undefined) {
      todo.notes = params.notes;
    }
    
    // Update tags - empty array means remove all tags
    if (params.tags !== undefined) {
      todo.tagNames = formatTags(params.tags);
    }
    
    // Update status
    if (params.completed === true) {
      todo.status = 'completed';
    } else if (params.canceled === true) {
      todo.status = 'canceled';
    }
    
    // Update dates
    if (params.activation_date !== undefined) {
      if (params.activation_date) {
        applyWhenValue(things, todo, params.activation_date);
      } else {
        // Clear activation date by scheduling to null (moves to Anytime)
        applyWhenValue(things, todo, 'anytime');
      }
    }
    
    if (params.due_date !== undefined) {
      todo.dueDate = params.due_date ? parseLocalDate(params.due_date) : null;
    }

    // Add/append checklist items
    if (params.child_tasks && params.child_tasks.length > 0) {
      params.child_tasks.forEach(itemTitle => {
        try {
          const checklistItem = things.ToDo({ name: itemTitle });
          todo.toDos.push(checklistItem);
        } catch (e) {
          // Checklist item creation failed
        }
      });
    }

    return mapTodo(todo);
  }
  
  /**
   * Get all todos, optionally filtered by project
   */
  static getAll(things, params) {
    let todos;

    if (params.project_uuid) {
      try {
        const project = things.projects.byId(params.project_uuid);
        todos = project.toDos();
      } catch (e) {
        return [];
      }
    } else {
      todos = things.toDos();
    }

    const includeItems = params.include_items !== false; // default true

    if (includeItems) {
      return todos.map(mapTodo);
    } else {
      // Just return basic info
      return todos.map(todo => ({
        id: todo.id(),
        name: todo.name(),
        status: todo.status()
      }));
    }
  }

  /**
   * Delete a todo (move to trash)
   */
  static delete(things, params) {
    const todo = things.toDos.byId(params.id);
    const todoInfo = {
      id: todo.id(),
      name: todo.name()
    };

    // Move to trash
    try {
      const trashList = things.lists.byId('TMTrashListSource');
      things.move(todo, { to: trashList });
    } catch (e) {
      // Fallback: try setting status to trashed
      try {
        todo.status = 'trashed';
      } catch (e2) {
        throw new Error(`Failed to delete todo: ${e.message}`);
      }
    }

    return {
      deleted: true,
      todo: todoInfo
    };
  }

  /**
   * Move a todo to a different project or area
   */
  static move(things, params) {
    const todo = things.toDos.byId(params.id);
    let destination = null;
    let destinationType = '';

    // Find destination by ID or title
    if (params.project_id) {
      destination = things.projects.byId(params.project_id);
      destinationType = 'project';
    } else if (params.project_title) {
      const projects = things.projects();
      for (let project of projects) {
        if (project.name() === params.project_title) {
          destination = project;
          destinationType = 'project';
          break;
        }
      }
    } else if (params.area_id) {
      destination = things.areas.byId(params.area_id);
      destinationType = 'area';
    } else if (params.area_title) {
      const areas = things.areas();
      for (let area of areas) {
        if (area.name() === params.area_title) {
          destination = area;
          destinationType = 'area';
          break;
        }
      }
    } else if (params.list_id) {
      // Move to a built-in list (Inbox, etc.)
      destination = things.lists.byId(params.list_id);
      destinationType = 'list';
    }

    if (!destination) {
      throw new Error('Destination not found');
    }

    // Move the todo
    if (destinationType === 'project') {
      todo.project = destination;
    } else if (destinationType === 'area') {
      todo.area = destination;
    } else {
      // Lists use move command
      things.move(todo, { to: destination });
    }

    return {
      moved: true,
      todo: {
        id: todo.id(),
        name: todo.name()
      },
      destination: {
        type: destinationType,
        name: destination.name ? destination.name() : params.list_id
      }
    };
  }
}
