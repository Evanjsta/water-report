/**
 * Worker script to serve HTML files using Cloudflare Workers Sites
 */

export default {
  async fetch(request, env, ctx) {
    // Get the URL and pathname
    const url = new URL(request.url);
    let path = url.pathname;
    
    // Handle root path - serve index.html
    if (path === "/" || path === "") {
      // Create a new request with /index.html path
      const indexRequest = new Request(
        `${url.protocol}//${url.host}/index.html`,
        request
      );
      return env.ASSETS.fetch(indexRequest);
    }

    // For all other paths, let Workers Sites handle it
    try {
      // Use the standard ASSETS namespace from Workers Sites
      const response = await env.ASSETS.fetch(request);
      
      // If the response is successful, return it
      if (response.status < 400) {
        return response;
      }
      
      // If we get a 404, we'll fall through to our custom 404 page
      console.log(`Asset not found: ${path}`);
    } catch (e) {
      console.error(`Error fetching asset: ${e}`);
    }

    // Return a simple 404 page
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Page Not Found</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          h1 { color: #d9534f; }
        </style>
      </head>
      <body>
        <h1>404 - Page Not Found</h1>
        <p>The requested page "${path}" could not be found.</p>
        <p><a href="/">Go to Homepage</a></p>
      </body>
      </html>
    `, {
      status: 404,
      headers: {
        "Content-Type": "text/html"
      }
    });
  }
};

