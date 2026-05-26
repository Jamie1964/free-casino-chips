export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // -----------------------------
    // INDEX PAGE VIEW COUNTER
    // -----------------------------
    if (url.pathname === "/api/index-views") {
      const current = parseInt(await env.PAGE_VIEWS.get("index") || "0", 10);
      const updated = current + 1;
      await env.PAGE_VIEWS.put("index", updated.toString());

      return new Response(JSON.stringify({ views: updated }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // -----------------------------
    // STATIC ASSET HANDLING
    // -----------------------------
    return env.ASSETS.fetch(request);
  }
};

