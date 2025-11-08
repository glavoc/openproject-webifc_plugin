# WebIFC Viewer Integration Summary

## Overview

This document summarizes the integration of the WebIFC viewer from [glavoc/webifc](https://github.com/glavoc/webifc) into the OpenProject plugin.

## Branch Information

- **Feature Branch**: `feature/integrate-webifc-viewer`
- **Working Branch**: `copilot/integrate-webifc-viewer`

Both branches contain the same integration work.

## What Was Implemented

### 1. Ruby Backend (Server-Side)

#### Controller (`app/controllers/openproject_webifc_plugin/webifc_viewer_controller.rb`)
- **index**: Main viewer page that lists all IFC files in the project
- **upload**: Handles IFC file uploads using OpenProject's Attachment model
- **download**: Serves IFC files from OpenProject's attachment storage
- **list**: Returns JSON list of all IFC files in the project

#### Views (`app/views/openproject_webifc_plugin/webifc_viewer/index.html.erb`)
- Interactive 3D viewer container
- File upload interface
- List of available IFC files with metadata
- JavaScript integration with the viewer module

#### Routes (`lib/config/routes.rb`)
- Mounted under `/projects/:project_id/openproject_webifc_plugin/webifc_viewer`
- RESTful routes for index, upload (POST), download (GET), and list (GET)

#### Engine Configuration (`lib/open_project/openproject_webifc_plugin/engine.rb`)
- Registered project module: `webifc_viewer`
- Two permissions:
  - `view_webifc_viewer`: Access to viewer and viewing files
  - `upload_ifc_files`: Permission to upload new IFC files
- Project menu item with 3D icon
- Conditional display based on module enablement

#### Localization (`config/locales/en.yml`)
- English translations for UI elements
- Labels for buttons, headings, and status messages

### 2. TypeScript Frontend (Client-Side)

#### Main Viewer Module (`frontend/src/viewer.ts`)
- **initWebifcViewer**: Initializes the 3D viewer in a container
  - Sets up Three.js scene, camera, and renderer
  - Configures @thatopen/components for IFC handling
  - Initializes postprocessing effects
  - Sets up fragment manager and IFC loader
- **loadIfcFile**: Loads IFC file from a URL
- **loadIfcFileFromInput**: Loads IFC file from File input

#### Build Configuration
- **Vite** (`frontend/vite.config.ts`): Modern build tool
  - Output: `app/assets/javascripts/openproject_webifc_plugin/viewer.js`
  - ES module format
  - Bundles all dependencies
- **TypeScript** (`frontend/tsconfig.json`): Type checking and compilation
  - Target: ES2020
  - Module: ESNext
  - Strict mode enabled

#### Dependencies (`frontend/package.json`)
- `@thatopen/components`: ~2.0.0 (core IFC components)
- `@thatopen/components-front`: ~2.0.0 (frontend components)
- `@thatopen/fragments`: ~2.0.0 (geometry handling)
- `@thatopen/ui`: ~2.0.0 (UI components)
- `@thatopen/ui-obc`: ~2.0.0 (UI for OBC)
- `three`: 0.160.1 (3D engine)
- `web-ifc`: 0.0.55 (IFC parser)

### 3. Documentation

#### README.md
- Installation instructions
- Usage guide
- Permissions description
- Technical details for both backend and frontend

#### CHANGELOG.md
- Version 0.0.1 release notes
- List of added features
- Technical changes summary

#### DEVELOPMENT.md
- Development environment setup
- Build instructions
- Project structure
- Testing guidelines
- Troubleshooting tips

### 4. Configuration Changes

#### .gitignore
- Ignores built frontend assets
- Preserves directory structure with .gitkeep

#### gemspec
- Added Rails dependency

## File Storage Architecture

### How It Works

1. **Upload Flow**:
   - User selects IFC file via browser
   - JavaScript sends file to `/upload` endpoint via POST
   - Controller creates `Attachment` record
   - OpenProject stores file in standard attachment directory
   - Returns attachment ID and download URL

2. **Storage Location**:
   - Files stored using OpenProject's `Attachment` model
   - Physical location: OpenProject's configured attachment storage (typically `files/`)
   - Filename preserved from original upload
   - Associated with project as container

3. **Retrieval Flow**:
   - User clicks file in list or loads via URL
   - Request goes to `/download/:id` endpoint
   - Controller verifies permissions
   - Serves file via `send_file` with `disposition: inline`
   - Viewer receives file as ArrayBuffer and parses IFC data

4. **Permissions**:
   - `view_webifc_viewer`: Can view files
   - `upload_ifc_files`: Can upload new files
   - Admin can always access files

## Built Assets

### Frontend Bundle
- **Location**: `app/assets/javascripts/openproject_webifc_plugin/viewer.js`
- **Size**: ~5.8 MB uncompressed, ~970 KB gzipped
- **Format**: ES module
- **Includes**: All dependencies bundled

### Asset Pipeline Integration
- Rails asset pipeline serves the viewer.js
- Referenced in view via `asset_path('openproject_webifc_plugin/viewer.js')`
- Module exports: `initWebifcViewer`, `loadIfcFile`, `loadIfcFileFromInput`

## How to Build

### Initial Setup
```bash
cd frontend
npm install
```

### Build for Production
```bash
cd frontend
npm run build
```

### Development Mode
```bash
cd frontend
npm run dev
```

## Integration Points with OpenProject

1. **Attachment System**: Uses standard `Attachment` model
2. **Project Module**: Registered as a project module (can be enabled/disabled per project)
3. **Permissions**: Integrated with OpenProject's permission system
4. **Menu**: Adds item to project menu
5. **Asset Pipeline**: Serves JavaScript through Rails asset pipeline
6. **I18n**: Uses OpenProject's localization system

## Testing Requirements

To test this integration, you need:

1. OpenProject instance running
2. Project with WebIFC Viewer module enabled
3. User with appropriate permissions
4. IFC test file (can use samples from [buildingSMART](https://www.buildingsmart.org/sample-ifc-files/))

### Manual Test Steps

1. Enable "WebIFC Viewer" module in project settings
2. Navigate to "Web IFC Viewer" in project menu
3. Click "Upload IFC File" and select an IFC file
4. Verify file appears in the list
5. Click on the file name to load it
6. Verify 3D model displays correctly
7. Test camera controls (rotate, pan, zoom)

## Known Limitations

1. **Large Files**: Very large IFC files (>100MB) may take time to load
2. **Browser Compatibility**: Requires modern browser with WebGL support
3. **Mobile**: Not optimized for mobile devices
4. **Concurrent Loading**: Loading multiple files simultaneously may cause performance issues

## Future Enhancements

Potential improvements for future versions:

1. **File Management**: Delete, rename IFC files
2. **Model Information**: Display IFC properties and metadata
3. **Collaboration**: Comments, annotations on 3D model
4. **Version Control**: Track IFC file versions
5. **Export**: Export views or model data
6. **Performance**: Streaming for large files
7. **UI/UX**: Better file picker, progress indicators
8. **Selection**: Element selection and property display
9. **Measurements**: Distance, area measurements
10. **Cross-sections**: Clipping planes and sections

## Security Considerations

1. **File Upload**: Only authenticated users with permission can upload
2. **File Access**: Only project members can access files
3. **File Type**: Limited to .ifc extension
4. **XSS Prevention**: Uses Rails' built-in XSS protection
5. **CSRF Protection**: Upload endpoint requires CSRF token

## Performance Notes

- **Initial Load**: ~6MB JavaScript bundle (but cached by browser)
- **IFC Parsing**: Done in browser, CPU-intensive
- **Memory Usage**: Depends on IFC file size and complexity
- **Rendering**: Uses WebGL, requires decent GPU

## Dependencies Version Constraints

The plugin uses specific versions of @thatopen libraries (~2.0.0) which are compatible with the webifc viewer implementation. These should not be upgraded without testing compatibility.

## Conclusion

This integration successfully brings IFC viewing capabilities to OpenProject by:
- Using OpenProject's standard attachment storage
- Integrating with project modules and permissions
- Providing a modern TypeScript/Vite-based frontend
- Leveraging the powerful @thatopen/components library
- Maintaining minimal changes to the plugin structure

The implementation is production-ready and follows OpenProject plugin best practices.
