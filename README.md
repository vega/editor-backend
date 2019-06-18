# editor-backend

[![Build Status](https://travis-ci.com/vega/editor-backend.svg?branch=master)](https://travis-ci.com/vega/editor-backend)

Deployed at https://vega.now.sh. 

## Setup Instructions

1. Clone the repository.
    ```
    $ git clone git@github.com:vega/editor-backend.git
    ```

2. Install all dependencies.
    ```
    $ yarn install
    ```

3. Put configurations in a `.env` file in the root directory.
    ```
    $ cp .env.sample .env
    ```

4. Sample configuration of a `.env` file can be:
    ```
    NODE_ENV=development
    PORT=9000

    # [@domoritz](https://github.com/domoritz) created this app for OAuth testing.
    # You may create [your own application](https://github.com/settings/developers).
    GITHUB_CLIENT_ID=a901f0948b144d29fbdf 
    GITHUB_CLIENT_SECRET=dfdb84ff29fde4eaa160078d13e024530238ebe0

    SESSION_SECRET=secret

    # Frontend development server
    HOMEPAGE_URL=http://localhost:8080/

    DOMAINS=http://localhost:8080,http://localhost:8081

    ```

5.  Run the back-end server.
    ```
    $ yarn dev
    ```

6. For testing OAuth on frontend, pull the `backend-testing` branch in your
   editor local repository from [vega/editor](https://github.com/vega/editor).
   ```
   $ git fetch origin/backend-testing
   $ git checkout backend-testing
   ```

7. Start the front-end server and go to `http://localhost:8080/`, or whichever
   port you started the front-end server on and find the authentication button
   in the header.
   ![auth](/static/auth.png)

8. Click the login/logout button to see cookie set and unset.
   ![demo](/static/auth.gif)


## Code formatting

The project uses ESLint to format the code. Run `yarn format` to fix
formatting where it's possible to do so automatically.
