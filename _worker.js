export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // -----------------------------
    // INDEX PAGE VIEW COUNTER
    // -----------------------------
    if (url.pathname === "/api/index-views") {
      let current = await env.PAGE_VIEWS.get("index", { type: "text" });
      current = parseInt(current || "0", 10);

      const updated = current + 1;
      await env.PAGE_VIEWS.put("index", updated.toString());

      return new Response(JSON.stringify({ views: updated }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // -----------------------------
    // FEEDBACK ENDPOINT
    // -----------------------------
    if (url.pathname === "/api/feedback") {
      if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "POST only" }), {
          headers: { "Content-Type": "application/json" },
          status: 405
        });
      }

      let data;
      try {
        data = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: "invalid JSON" }), {
          headers: { "Content-Type": "application/json" },
          status: 400
        });
      }

      if (!data.rating || !data.experience) {
        return new Response(JSON.stringify({ error: "missing fields" }), {
          headers: { "Content-Type": "application/json" },
          status: 400
        });
      }

      const entry = {
        rating: data.rating,
        experience: data.experience,
        time: Date.now()
      };

      await env.FEEDBACK_KV.put("fb-" + crypto.randomUUID(), JSON.stringify(entry));

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // -----------------------------
    // STATIC ASSET HANDLING
    // -----------------------------
    return env.ASSETS.fetch(request);
  }
};

