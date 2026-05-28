export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Only handle /api/pageviews
    if (url.pathname === "/api/pageviews") {
      const page = url.searchParams.get("page");

      if (!page) {
        return new Response(
          JSON.stringify({ error: "Missing ?page=name parameter" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const key = `views:${page}`;

      // Read current count
      let current = await env.PAGEVIEWS.get(key);
      let newValue = (parseInt(current) || 0) + 1;

      // Save updated count
      await env.PAGEVIEWS.put(key, newValue.toString());

      return new Response(
        JSON.stringify({ page, views: newValue }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Default: serve static site
    return env.ASSETS.fetch(request);
  }
};

