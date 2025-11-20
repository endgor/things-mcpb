/**
 * Area operations for Things 3
 */

import { mapArea, mapTodo, formatTags } from './utils.js';

export class AreaOperations {

  /**
   * Get all areas
   */
  static getAll(things, params) {
    let areas;
    try {
      areas = things.areas();
    } catch (e) {
      return [];
    }

    const includeItems = params.include_items || false;

    return areas.map(area => {
      const mapped = mapArea(area);

      if (includeItems) {
        try {
          mapped.todos = area.toDos().map(mapTodo);
        } catch (e) {
          mapped.todos = [];
        }
      }

      return mapped;
    });
  }

  /**
   * Add a new area
   */
  static add(things, params) {
    const areaProps = {
      name: params.name
    };

    const area = things.Area(areaProps);
    things.areas.push(area);

    // Set tags if provided
    if (params.tags && params.tags.length > 0) {
      area.tagNames = formatTags(params.tags);
    }

    return mapArea(area);
  }

  /**
   * Update an existing area
   */
  static update(things, params) {
    const area = things.areas.byId(params.id);

    // Update name
    if (params.name !== undefined) {
      area.name = params.name;
    }

    // Update tags
    if (params.tags !== undefined) {
      area.tagNames = formatTags(params.tags);
    }

    // Update collapsed state
    if (params.collapsed !== undefined) {
      area.collapsed = params.collapsed;
    }

    return mapArea(area);
  }

  /**
   * Delete an area
   * Note: This will move all items in the area to no area
   */
  static delete(things, params) {
    const area = things.areas.byId(params.id);
    const areaInfo = {
      id: area.id(),
      name: area.name()
    };

    // Delete the area
    try {
      things.delete(area);
    } catch (e) {
      throw new Error(`Failed to delete area: ${e.message}`);
    }

    return {
      deleted: true,
      area: areaInfo
    };
  }
}