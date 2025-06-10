# editor-backend

[![Build Status](https://github.com/vega/editor-backend/workflows/Test/badge.svg)](https://github.com/vega/editor-backend/actions)

Deployed at https://vega-editor-backend.vercel.app/. Code is at
https://github.com/vega/editor-backend.

## Setup Instructions

1. Clone the repository.
    ```
    $ git clone git@github.com:vega/editor-backend.git
    ```

2. Install all dependencies.
    ```
    $ npm install
    ```

3. Put configurations in a `.env` file in the root directory.
    ```
    $ cp .env.sample .env
    ```

4. Sample configuration of a `.env` file can be:
    ```
    # [@domoritz](https://github.com/domoritz) created this app for OAuth testing.
    # You may create [your own application](https://github.com/settings/developers).

    # GitHub OAuth app credentials
    GITHUB_CLIENT_ID=a901f0948b144d29fbdf 
    GITHUB_CLIENT_SECRET=8a2269fd225321f19f2a19e7629e3ad63d94df68

    # Session ID configuration
    SESSION_SECRET=secret
    ```

5.  Run the back-end server.
    ```
    $ npm start
    ```

6.  Go to the home route (which usually is `http://localhost:3000/`). Otherwise
    it will be mentioned in the console where the above command is run.
    
## Documentation

Go to https://vega.github.io/editor-backend/.

## Code formatting

- Install [ESLint
  plugin](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  for automatically handling formatting of TypeScript files.
- Install [Rewrap
  plugin](https://marketplace.visualstudio.com/items?itemName=stkb.rewrap) to
  assist formatting of markdown files. Press <kbd>Alt</kbd> + <kbd>Q</kbd> to
  limit lines at 80 characters.
- The project uses ESLint to format the code. Run `npm run format` to fix
  formatting where it's possible to do so automatically.
