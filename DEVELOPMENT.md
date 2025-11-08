# Development Guide

## Prerequisites

- Ruby (version matching OpenProject requirements)
- Node.js (v18 or higher)
- npm (v8 or higher)

## Setting Up Development Environment

1. Clone the repository:
```bash
git clone https://github.com/glavoc/openproject-webifc_plugin.git
cd openproject-webifc_plugin
```

2. Install Ruby dependencies:
```bash
bundle install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

## Building the Frontend

The frontend uses Vite for building. To build the frontend assets:

```bash
cd frontend
npm run build
```

This compiles the TypeScript code and bundles all dependencies into a single JavaScript file at:
`app/assets/javascripts/openproject_webifc_plugin/viewer.js`

### Development Mode

To run Vite in development mode with hot reloading:

```bash
cd frontend
npm run dev
```

Note: In development mode, you may need to update the view file to reference the dev server URL.

## Project Structure

```
.
├── app/
│   ├── assets/
│   │   └── javascripts/
│   │       └── openproject_webifc_plugin/
│   │           └── viewer.js (generated)
│   ├── controllers/
│   │   └── openproject_webifc_plugin/
│   │       └── webifc_viewer_controller.rb
│   └── views/
│       └── openproject_webifc_plugin/
│           └── webifc_viewer/
│               └── index.html.erb
├── config/
│   └── locales/
│       └── en.yml
├── frontend/
│   ├── src/
│   │   └── viewer.ts (main viewer module)
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── lib/
    ├── config/
    │   └── routes.rb
    └── open_project/
        └── openproject_webifc_plugin/
            ├── engine.rb
            └── version.rb
```

## Testing

### Manual Testing

1. Start OpenProject with the plugin loaded
2. Create or navigate to a project
3. Enable the "WebIFC Viewer" module in project settings
4. Navigate to "Web IFC Viewer" in the project menu
5. Upload an IFC file using the upload button
6. Click on the uploaded file to view it in the 3D viewer

### Frontend Testing

To test the frontend viewer independently:

```bash
cd frontend
npm run dev
```

Then open the provided URL in your browser.

## Making Changes

### Backend Changes (Ruby)

1. Edit files in `app/controllers/`, `app/views/`, or `lib/`
2. Restart OpenProject to see changes

### Frontend Changes (TypeScript)

1. Edit files in `frontend/src/`
2. Rebuild the frontend:
```bash
cd frontend
npm run build
```
3. Refresh the browser to see changes

## Adding Dependencies

### Ruby Dependencies

Add to `openproject-openproject-webifc_plugin.gemspec` and run:
```bash
bundle install
```

### Frontend Dependencies

Add to `frontend/package.json` and run:
```bash
cd frontend
npm install
```

## Troubleshooting

### Frontend build fails

- Ensure Node.js version is 18 or higher
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

### Asset not loading in browser

- Ensure the frontend is built: `cd frontend && npm run build`
- Check that `app/assets/javascripts/openproject_webifc_plugin/viewer.js` exists
- Restart OpenProject to reload assets

### IFC file upload fails

- Check file permissions on OpenProject's attachment directory
- Verify user has "Upload IFC Files" permission
- Check Rails logs for detailed error messages

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Resources

- [OpenProject Plugin Development](https://www.openproject.org/docs/development/creating-a-plugin/)
- [WebIFC Viewer](https://github.com/glavoc/webifc)
- [@thatopen/components Documentation](https://docs.thatopen.com/)
