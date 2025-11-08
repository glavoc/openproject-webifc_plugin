# OpenProject WebIFC Plugin

This plugin integrates the WebIFC viewer from [glavoc/webifc](https://github.com/glavoc/webifc) into OpenProject, allowing users to view IFC (Industry Foundation Classes) files directly within the OpenProject interface.

## Features

- View IFC files in an interactive 3D viewer
- Upload IFC files to projects
- Store IFC files using OpenProject's standard attachment system
- Integration with OpenProject's project menu and permissions

## Installation

1. Add this plugin to your OpenProject `Gemfile.plugins`:
```ruby
gem "openproject-webifc_plugin", path: "path/to/openproject-webifc_plugin"
```

2. Install the plugin dependencies:
```bash
bundle install
```

3. Build the frontend assets:
```bash
cd frontend
npm install
npm run build
```

4. Restart OpenProject

## Building Frontend

The frontend is built using Vite and TypeScript. To rebuild the frontend assets:

```bash
cd frontend
npm install
npm run build
```

This will generate the viewer JavaScript module in `app/assets/javascripts/openproject_webifc_plugin/viewer.js`.

## Usage

1. Enable the "WebIFC Viewer" module in your project settings
2. Navigate to the "Web IFC Viewer" menu item in your project
3. Upload IFC files using the "Upload IFC File" button
4. Click on any uploaded IFC file to view it in the 3D viewer

## Permissions

The plugin adds two permissions:
- **View WebIFC Viewer**: Allows viewing IFC files and accessing the viewer
- **Upload IFC Files**: Allows uploading new IFC files to the project

## Technical Details

### Backend (Ruby)

- Controller: `OpenprojectWebifcPlugin::WebifcViewerController`
- Routes: Defined in `lib/config/routes.rb`
- Attachments: Uses OpenProject's standard `Attachment` model
- Files are stored in OpenProject's default attachment directory

### Frontend (TypeScript)

- Built with Vite
- Uses @thatopen/components for IFC viewing
- Main module: `frontend/src/viewer.ts`
- Exports `initWebifcViewer` and `loadIfcFile` functions

## Issue Tracker

https://community.openproject.org/projects/openproject-webifc-plugin/work_packages
