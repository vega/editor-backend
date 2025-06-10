import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Create Hono app
const app = new Hono<{ Bindings: CloudflareBindings }>();

// Types for Cloudflare Workers environment
interface CloudflareBindings {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  SESSION_SECRET: string;
  NODE_ENV: string;
}

// Allowed origins for CORS
const allowedOrigins = [
  'https://vega.github.io',
  'http://localhost:8081',
  'http://localhost:8080',
  'http://localhost:1234',
  'http://0.0.0.0:8080',
];

// CORS middleware
app.use('*', cors({
  origin: (origin) => {
    if (!origin || origin === 'null' || allowedOrigins.includes(origin)) {
      return origin;
    }
    return null;
  },
  credentials: true
}));

// Home route
app.get('/', async (c) => {
  const host = c.req.header('host') || 'localhost';
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Vega Editor Backend</title>
      <style>
        body { font-family: sans-serif; margin: 20px; }
        .token { background: #f0f0f0; padding: 10px; word-break: break-all; margin: 10px 0; }
        .result { background: #e0ffe0; padding: 10px; margin: 10px 0; word-break: break-all; }
        .result pre { white-space: pre-wrap; }
        .debug-section { border: 1px solid #ccc; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <h2>Welcome to editor-backend!</h2>
      <p>Here is the list of routes available in this project.</p>
      <ul>
        <li>Log in: <a href="/auth/github?redirect=debug">${host}/auth/github</a></li>
        <li>Log out: <a href="/auth/github/logout?redirect=debug">${host}/auth/github/logout</a></li>
        <li>Vega Editor API documentation: <a href="https://vega.github.io/editor-backend">https://vega.github.io/editor-backend</a></li>
      </ul>
      
      <div class="debug-section">
        <h3>Current Auth Token:</h3>
        <div class="token" id="token">Loading...</div>
        
        <h3>Auth Check Result:</h3>
        <div class="result" id="result">Loading...</div>
      </div>
      
      <script>
        // Check if we have an access token in the URL (from OAuth callback)
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        
        if (accessToken) {
          // Store the token and clean up the URL
          localStorage.setItem('vega_editor_auth_token', accessToken);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        const token = localStorage.getItem('vega_editor_auth_token');
        document.getElementById('token').textContent = token || 'No token found';
        
        if (token) {
          fetch('/auth/github/check', {
            headers: {
              'Authorization': 'Bearer ' + token
            }
          })
          .then(response => response.json())
          .then(data => {
            document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
          })
          .catch(error => {
            document.getElementById('result').textContent = 'Error: ' + error.message;
          });
        } else {
          document.getElementById('result').textContent = 'No token available to test';
        }
      </script>
    </body>
    </html>
  `;
  
  return c.html(html);
});

// GitHub OAuth routes
app.get('/auth/github', async (c) => {
  const env = c.env;
  const clientId = env.GITHUB_CLIENT_ID;
  const redirectParam = c.req.query('redirect');
  const redirectUrl = c.req.query('redirect_url');
  const baseUrl = c.req.url.split('/auth')[0];
  
  // Build callback URL with parameters
  const params = new URLSearchParams();
  if (redirectParam) params.set('redirect', redirectParam);
  if (redirectUrl) params.set('redirect_url', redirectUrl);
  const queryString = params.toString();
  const redirectUri = `${baseUrl}/auth/github/callback${queryString ? `?${queryString}` : ''}`;
  
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=gist`;
  
  return c.redirect(authUrl);
});

app.get('/auth/github/callback', async (c) => {
  const code = c.req.query('code');
  const redirectParam = c.req.query('redirect');
  const redirectUrl = c.req.query('redirect_url');
  const env = c.env;
  
  if (!code) {
    return c.text('Authorization code not provided', 400);
  }
  
  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.access_token) {
      // For debug view, redirect back to root with token in URL
      if (redirectParam === 'debug') {
        const baseUrl = c.req.url.split('/auth')[0];
        return c.redirect(`${baseUrl}/?access_token=${tokenData.access_token}`);
      } else {
        // For popup windows (like from localhost:1234), return HTML that posts message and closes
        const html = `
          <html>
          <script>
            const authToken = "${tokenData.access_token}";
            
            if (authToken) {
              localStorage.setItem('vega_editor_auth_token', authToken);
            }
            
            if (window.opener === null) {
              window.location = '/';
            } else {
              try {
                window.opener.postMessage(
                  {type: 'auth', token: authToken}, '*'
                );
                window.close();
              } catch (e) {
                window.location = 'https://vega.github.io/editor/?access_token=${tokenData.access_token}';
              }
            }
          </script>
          </html>
        `;
        return c.html(html);
      }
    } else {
      return c.text('Failed to get access token', 400);
    }
  } catch (error) {
    return c.text('OAuth callback failed', 500);
  }
});

app.get('/auth/github/logout', async (c) => {
  const redirectParam = c.req.query('redirect');
  
  if (redirectParam === 'debug') {
    // For debug view, return HTML that clears localStorage and redirects
    const baseUrl = c.req.url.split('/auth')[0];
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Logging out...</title>
      </head>
      <body>
        <p>Logging out...</p>
        <script>
          localStorage.removeItem('vega_editor_auth_token');
          window.location.href = '${baseUrl}/';
        </script>
      </body>
      </html>
    `;
    return c.html(html);
  } else {
    // For editor, redirect to vega editor
    return c.redirect('https://vega.github.io/editor/');
  }
});

app.get('/auth/github/check', async (c) => {
  const authHeader = c.req.header('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ authenticated: false }, 401);
  }
  
  const token = authHeader.substring(7);
  
  try {
    // Verify token with GitHub API
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'vega-editor-backend',
      },
    });
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      return c.json({
        isAuthenticated: true,
        handle: userData.login,
        name: userData.name,
        profilePicUrl: userData.avatar_url,
        authToken: token,
        githubAccessToken: token,
      });
    } else {
      const errorText = await userResponse.text();
      return c.json({ authenticated: false, error: errorText, status: userResponse.status }, 401);
    }
  } catch (error) {
    return c.json({ authenticated: false, error: error.message }, 500);
  }
});

app.get('/auth/github/token', async (c) => {
  const authHeader = c.req.header('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401);
  }
  
  const token = authHeader.substring(7);
  return c.json({ access_token: token });
});

export default app;