# editor-backend

[![Build
Status](https://travis-ci.com/vega/editor-backend.svg?branch=master)](https://travis-ci.com/vega/editor-backend)

Deployed at https://vega.now.sh. Code is at
https://github.com/vega/editor-backend. 

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
    # [@domoritz](https://github.com/domoritz) created this app for OAuth testing.
    # You may create [your own application](https://github.com/settings/developers).
    GITHUB_CLIENT_ID=a901f0948b144d29fbdf 
    GITHUB_CLIENT_SECRET=dfdb84ff29fde4eaa160078d13e024530238ebe0

    SESSION_SECRET=secret

    ```

5.  Run the back-end server.
    ```
    $ yarn start
    ```

6.  Go to the home route (which usually is `http://localhost:3000/`). Otherwise
    it will be mentioned in the console where the above command is run.
    
## Documentation

Go to https://vega.github.io/editor-backend/.

## Code formatting

The project uses ESLint to format the code. Run `yarn format` to fix formatting
where it's possible to do so automatically.
