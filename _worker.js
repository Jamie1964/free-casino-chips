export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // Only handle /api/pageviews
        if (url.pathname === "/api/pageviews") {
            const page = url.searchParams.get("page") || "unknown";

            // KV keys
            const viewsKey = `views:${page}`;
            const uniqueKey = `unique:${page}`;
            const visitorKey = `visitor:${page}:${request.headers.get("CF-Connecting-IP")}`;

            // Get current counts
            let views = await env.PAGEVIEWS.get(viewsKey, { type: "json" }) || 0;
            let unique = await env.PAGEVIEWS.get(uniqueKey, { type: "json" }) || 0;

            // Increment total views
            views++;
            await env.PAGEVIEWS.put(viewsKey, JSON.stringify(views));

            // Check if this visitor is unique (24-hour window)
            const seen = await env.PAGEVIEWS.get(visitorKey);
            if (!seen) {
                unique++;
                await env.PAGEVIEWS.put(uniqueKey, JSON.stringify(unique));

                // Mark visitor as seen for 24 hours
                await env.PAGEVIEWS.put(visitorKey, "1", { expirationTtl: 86400 });
            }

            // Return JSON response
            return new Response(JSON.stringify({
                page,
                views,
                unique
            }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // Default: serve static assets
        return env.ASSETS.fetch(request);
    }
};

