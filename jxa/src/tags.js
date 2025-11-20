/**
 * Tag operations for Things 3
 */

import { mapTodo, mapProject, parseTags } from './utils.js';

export class TagOperations {

  /**
   * Get all tags
   */
  static getAll(things, params) {
    try {
      const tags = things.tags();
      return tags.map(tag => tag.name());
    } catch (e) {
      return [];
    }
  }

  /**
   * Get items with a specific tag (todos and projects)
   */
  static getTaggedItems(things, params) {
    const tagName = params.tag_title;
    const result = {
      todos: [],
      projects: []
    };

    // Get tagged todos
    try {
      const allTodos = things.toDos();
      const taggedTodos = allTodos.filter(todo => {
        try {
          const tagNames = todo.tagNames() || '';
          const tags = parseTags(tagNames);
          return tags.includes(tagName);
        } catch (e) {
          return false;
        }
      });
      result.todos = taggedTodos.map(mapTodo);
    } catch (e) {
      // Todos not accessible
    }

    // Get tagged projects
    try {
      const allProjects = things.projects();
      const taggedProjects = allProjects.filter(project => {
        try {
          const tagNames = project.tagNames() || '';
          const tags = parseTags(tagNames);
          return tags.includes(tagName);
        } catch (e) {
          return false;
        }
      });
      result.projects = taggedProjects.map(mapProject);
    } catch (e) {
      // Projects not accessible
    }

    return result;
  }

  /**
   * Get unused tags (tags not assigned to any todo or project)
   */
  static getUnusedTags(things, params) {
    try {
      // Get all defined tags
      const allTags = things.tags().map(tag => tag.name());
      const usedTags = new Set();

      // Check todos for tag usage
      try {
        const todos = things.toDos();
        todos.forEach(todo => {
          try {
            const tagNames = todo.tagNames() || '';
            parseTags(tagNames).forEach(tag => usedTags.add(tag));
          } catch (e) {}
        });
      } catch (e) {}

      // Check projects for tag usage
      try {
        const projects = things.projects();
        projects.forEach(project => {
          try {
            const tagNames = project.tagNames() || '';
            parseTags(tagNames).forEach(tag => usedTags.add(tag));
          } catch (e) {}
        });
      } catch (e) {}

      // Find tags that are not used
      const unusedTags = allTags.filter(tag => !usedTags.has(tag));

      return {
        unusedTags: unusedTags,
        totalTags: allTags.length,
        usedCount: usedTags.size,
        unusedCount: unusedTags.length
      };
    } catch (e) {
      return {
        unusedTags: [],
        totalTags: 0,
        usedCount: 0,
        unusedCount: 0,
        error: e.message
      };
    }
  }

  /**
   * Delete a tag completely
   * Removes from all items and deletes the tag definition
   */
  static deleteTag(things, params) {
    const tagToDelete = params.tag_name;
    let removedFromCount = 0;
    let tagDeleted = false;

    // Remove from todos
    try {
      const todos = things.toDos();
      todos.forEach(todo => {
        try {
          const tagNames = todo.tagNames() || '';
          const tags = parseTags(tagNames);
          if (tags.includes(tagToDelete)) {
            const newTags = tags.filter(t => t !== tagToDelete);
            todo.tagNames = newTags.join(', ');
            removedFromCount++;
          }
        } catch (e) {}
      });
    } catch (e) {}

    // Remove from projects
    try {
      const projects = things.projects();
      projects.forEach(project => {
        try {
          const tagNames = project.tagNames() || '';
          const tags = parseTags(tagNames);
          if (tags.includes(tagToDelete)) {
            const newTags = tags.filter(t => t !== tagToDelete);
            project.tagNames = newTags.join(', ');
            removedFromCount++;
          }
        } catch (e) {}
      });
    } catch (e) {}

    // Delete the tag definition itself
    try {
      const allTags = things.tags();
      for (let i = 0; i < allTags.length; i++) {
        if (allTags[i].name() === tagToDelete) {
          things.delete(allTags[i]);
          tagDeleted = true;
          break;
        }
      }
    } catch (e) {
      // Tag deletion failed - may not be supported
    }

    if (tagDeleted) {
      return {
        tagName: tagToDelete,
        deleted: true,
        removedFromItems: removedFromCount,
        message: `Tag "${tagToDelete}" deleted` + (removedFromCount > 0 ? ` and removed from ${removedFromCount} item(s)` : '')
      };
    } else {
      return {
        tagName: tagToDelete,
        deleted: false,
        removedFromItems: removedFromCount,
        message: removedFromCount > 0
          ? `Tag "${tagToDelete}" removed from ${removedFromCount} item(s) but could not delete tag definition`
          : `Tag "${tagToDelete}" not found`
      };
    }
  }
}