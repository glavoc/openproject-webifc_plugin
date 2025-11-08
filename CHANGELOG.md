# Changelog

All notable changes to this project will be documented in this file.

## [0.0.1] - 2024-11-08

### Added
- Initial integration of WebIFC viewer from [glavoc/webifc](https://github.com/glavoc/webifc)
- Ruby backend controller for managing IFC file uploads and downloads
- TypeScript frontend viewer using @thatopen/components
- Integration with OpenProject attachment system
- Project menu item for WebIFC viewer
- Permissions for viewing and uploading IFC files
- Support for viewing IFC files in an interactive 3D viewer
- File upload functionality with progress tracking
- List of available IFC files in the project

### Technical
- Vite build system for frontend assets
- TypeScript configuration for type safety
- Controller actions: index, upload, download, list
- Routes mounted under `/projects/:project_id/openproject_webifc_plugin/webifc_viewer`
- Asset pipeline integration for serving viewer JavaScript
