/**
 * Project operations for Things 3
 */

import { mapProject, mapTodo, formatTags, scheduleItem, parseLocalDate, applyWhenValue } from './utils.js';

export class ProjectOperations {
  
  /**
   * Add a new project
   */
  static add(things, params) {
    const projectProps = {
      name: params.name
    };
    
    if (params.notes) {
      projectProps.notes = params.notes;
    }
    
    const project = things.Project(projectProps);
    things.projects.push(project);
    
    // Set tags (convert array to comma-separated string)
    if (params.tags && params.tags.length > 0) {
      project.tagNames = formatTags(params.tags);
    }
    
    // Apply when value (supports: today, tomorrow, evening, anytime, someday, or date)
    if (params.activation_date) {
      applyWhenValue(things, project, params.activation_date);
    }
    
    // Set due date (when actually due)
    if (params.due_date) {
      project.dueDate = parseLocalDate(params.due_date);
    }
    
    // Add to area
    if (params.area_id) {
      try {
        const area = things.areas.byId(params.area_id);
        project.area = area;
      } catch (e) {
        // Area not found
      }
    } else if (params.area_title) {
      try {
        const areas = things.areas();
        for (let area of areas) {
          if (area.name() === params.area_title) {
            project.area = area;
            break;
          }
        }
      } catch (e) {
        // Areas not accessible or area not found
      }
    }
    
    // Add todos to project
    if (params.todos && params.todos.length > 0) {
      params.todos.forEach(todoTitle => {
        const todo = things.ToDo({ name: todoTitle });
        project.toDos.push(todo);
      });
    }
    
    return mapProject(project);
  }
  
  /**
   * Update an existing project
   */
  static update(things, params) {
    const project = things.projects.byId(params.id);
    
    // Update basic properties
    if (params.name !== undefined) {
      project.name = params.name;
    }
    
    if (params.notes !== undefined) {
      project.notes = params.notes;
    }
    
    // Update tags - empty array means remove all tags
    if (params.tags !== undefined) {
      project.tagNames = formatTags(params.tags);
    }
    
    // Update status
    if (params.completed === true) {
      project.status = 'completed';
    } else if (params.canceled === true) {
      project.status = 'canceled';
    }
    
    // Update dates
    if (params.activation_date !== undefined) {
      if (params.activation_date) {
        applyWhenValue(things, project, params.activation_date);
      } else {
        // Clear activation date (moves to Anytime)
        applyWhenValue(things, project, 'anytime');
      }
    }
    
    if (params.due_date !== undefined) {
      project.dueDate = params.due_date ? parseLocalDate(params.due_date) : null;
    }
    
    return mapProject(project);
  }
  
  /**
   * Get all projects
   */
  static getAll(things, params) {
    const projects = things.projects();
    const includeItems = params.include_items || false;

    return projects.map(project => {
      const mapped = mapProject(project);

      if (includeItems) {
        try {
          mapped.todos = project.toDos().map(mapTodo);
        } catch (e) {
          mapped.todos = [];
        }
      }

      return mapped;
    });
  }

  /**
   * Delete a project (move to trash)
   */
  static delete(things, params) {
    const project = things.projects.byId(params.id);
    const projectInfo = {
      id: project.id(),
      name: project.name()
    };

    // Move to trash
    try {
      const trashList = things.lists.byId('TMTrashListSource');
      things.move(project, { to: trashList });
    } catch (e) {
      // Fallback: try setting status to trashed
      try {
        project.status = 'trashed';
      } catch (e2) {
        throw new Error(`Failed to delete project: ${e.message}`);
      }
    }

    return {
      deleted: true,
      project: projectInfo
    };
  }
}