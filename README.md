# CRUD Demo WebApp

A simple web frontend for the CRUD Demo API, providing a user interface for managing items with id, name, and date fields.

## Features

- User-friendly interface for CRUD operations
- Integration with the CRUD Demo API
- Responsive design using Bootstrap
- Plan view showing project progress
- Ready for OpenShift deployment

## Dependencies

- Node.js and Express for the web server
- Axios for API communication
- Bootstrap for styling
- EJS for HTML templating
- Moment.js for date validation

## Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Configure the API URL:
   - By default, the app uses `https://crud-demo-api-git-erikfirsttest.apps.dekradk.dekra.nu`
   - To change it, set the `API_URL` environment variable

3. Run the server:
   ```
   npm start
   ```

4. The web app will be accessible at http://localhost:8080

## Pages

- **Home Page (/)**: Manage items (create, read, update, delete)
- **Plan Page (/plan)**: View the project plan and architecture

## OpenShift Deployment

### Option 1: Deploy using OpenShift CLI (oc)

1. Login to OpenShift:
   ```
   oc login
   ```

2. Create a new project:
   ```
   oc new-project crud-demo-webapp
   ```

3. Create a new app from source:
   ```
   oc new-app https://github.com/yourusername/crud-demo-webapp.git
   ```

4. Set the API_URL environment variable:
   ```
   oc set env deployment/crud-demo-webapp API_URL=https://crud-demo-api-git-erikfirsttest.apps.dekradk.dekra.nu
   ```

5. Expose the service:
   ```
   oc expose service crud-demo-webapp
   ```

### Option 2: Deploy using OpenShift Web Console

1. Create a new project
2. Select "Add to Project" > "Import from Git"
3. Enter your repository URL
4. Add environment variable: API_URL=https://crud-demo-api-git-erikfirsttest.apps.dekradk.dekra.nu
5. Click "Create"
