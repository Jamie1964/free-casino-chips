export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Helper to read JSON body
    async function readJSON(req) {
      try {
        return await req.json();
      } catch {
        return {};
      }
    }

    // Store page views
    if (path === "/api/view") {
      const { page } = await readJSON(request);
      if (!page) return new Response("Missing page", { status: 400 });

      await env.CASINO.put(`views:${page}`, "1", { metadata: { ts: Date.now() } });

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get global stats
    if (path === "/api/global-stats") {
      const list = await env.CASINO.list({ prefix: "views:" });
      const totalPageViews = list.keys.length;

      const likes = await env.CASINO.list({ prefix: "like:" });
      const dislikes = await env.CASINO.list({ prefix: "dislike:" });

      return new Response(
        JSON.stringify({
          totalPageViews,
          totalLikes: likes.keys.length,
          totalDislikes: dislikes.keys.length
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Like
    if (path === "/api/like") {
      const { page } = await readJSON(request);
      if (!page) return new Response("Missing page", { status: 400 });

      await env.CASINO.put(`like:${page}:${Date.now()}`, "1");
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Dislike
    if (path === "/api/dislike") {
      const { page } = await readJSON(request);
      if (!page) return new Response("Missing page", { status: 400 });

      await env.CASINO.put(`dislike:${page}:${Date.now()}`, "1");
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Top 10 pages
    if (path === "/api/top10") {
      const list = await env.CASINO.list({ prefix: "views:" });
      const pages = list.keys.map(k => k.name.replace("views:", ""));

      const counts = {};
      pages.forEach(p => counts[p] = (counts[p] || 0) + 1);

      const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      return new Response(JSON.stringify(sorted), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response("Not found", { status: 404 });
  }
};

