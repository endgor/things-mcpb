# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.0] - 2025-11-20

### Added
- **Enhanced When Parameter**: Support for `today`, `tomorrow`, `evening`, `anytime`, `someday` keywords
- **Delete Operations**: `delete_todo`, `delete_project`, `empty_trash` tools
- **Move Todo**: `move_todo` tool to relocate todos between projects, areas, and lists
- **Tag Management**: `get_unused_tags` and `delete_tag` tools
- **Area CRUD**: `add_area`, `update_area`, `delete_area` tools
- Unit tests for new features (`when-parameter.test.js`, `new-tools.test.js`)

### Fixed
- Removed hardcoded auth token (security fix) - now requires `THINGS_AUTH_TOKEN` environment variable
- Fixed `move_todo` to use property assignment for projects/areas instead of move command

### Changed
- Updated repository URLs to fork (endgor/things-mcpb)
- Updated README with fork description and auth token setup instructions

## [1.5.2] - 2025-01-05

### Changed
- **MAJOR IMPROVEMENT**: Reduced package size from 12MB to 4.2MB (65% reduction)
- Optimized package script to exclude devDependencies (esbuild, @esbuild, @anthropic-ai/mcpb) from bundle
- Faster installation and reduced disk space usage

## [1.5.1] - 2025-01-05

### Fixed
- **CRITICAL**: Reverted manifest schema from 0.3 back to 0.2 for Claude Desktop compatibility
- Claude Desktop v1.0.211 only supports manifest version 0.2 (0.3 support coming in future release)

## [1.5.0] - 2025-01-05

### Added
- Tool metadata annotations (`readOnlyHint`, `destructiveHint`) for MCP Directory compliance
- All 21 tools now properly annotated with behavior hints

### Changed
- **BREAKING**: Upgraded manifest schema from 0.2 to 0.3
- Updated to latest `@anthropic-ai/mcpb` package (2.0.1)
- Updated all npm dependencies to latest versions

### Fixed
- Improved tool metadata for better MCP client integration

## [1.4.1] - 2024-10-27

### Fixed
- Various bug fixes and improvements

## [1.4.0] - 2024-10-27

### Added
- Enhanced JXA script architecture
- Improved error handling and validation

## [1.0.0] - 2024-11-08

### Added
- Initial release
- Things 3 integration via JXA
- 21 tools for complete task management
- Support for todos, projects, areas, and tags
