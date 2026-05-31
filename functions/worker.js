export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;

        // CORS headers
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        };

        // Handle OPTIONS preflight
        if (request.method === "OPTIONS") {
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        // -----------------------------
        // PAGE VIEW COUNTER
        // -----------------------------
        if (path === "/api/views") {
            try {
                const page = url.searchParams.get("page");
                if (!page) {
                    return new Response(JSON.stringify({ error: "Missing page parameter" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json", ...corsHeaders }
                    });
                }

                const key = `views_${page}`;
                let count = await env.PAGE_VIEWS.get(key);
                count = count ? parseInt(count) + 1 : 1;

                await env.PAGE_VIEWS.put(key, count.toString());

                return new Response(JSON.stringify({ page, views: count }), {
                    headers: { "Content-Type": "application/json", ...corsHeaders }
                });
            } catch (err) {
                return new Response(JSON.stringify({ error: err.toString() }), {
                    status: 500,
                    headers: { "Content-Type": "application/json", ...corsHeaders }
                });
            }
        }

        // -----------------------------
        // FEEDBACK HANDLER (UNIVERSAL)
        // -----------------------------
        if (path.startsWith("/api/") && path.endsWith("-feedback")) {
            try {
                const casino = path.replace("/api/", "").replace("-feedback", "");
                const kvName = `FEEDBACK_${casino.toUpperCase()}`;

                if (!env[kvName]) {
                    return new Response(JSON.stringify({ error: "Invalid casino feedback endpoint" }), {
                        status: 404,
                        headers: { "Content-Type": "application/json", ...corsHeaders }
                    });
                }

                if (request.method !== "POST") {
                    return new Response(JSON.stringify({ error: "POST only" }), {
                        status: 405,
                        headers: { "Content-Type": "application/json", ...corsHeaders }
                    });
                }

                const body = await request.json();
                const entry = {
                    time: Date.now(),
                    rating: body.rating || null,
                    message: body.message || "",
                    page: casino
                };

                await env[kvName].put(`fb_${Date.now()}`, JSON.stringify(entry));

                return new Response(JSON.stringify({ success: true }), {
                    headers: { "Content-Type": "application/json", ...corsHeaders }
                });
            } catch (err) {
                return new Response(JSON.stringify({ error: err.toString() }), {
                    status: 500,
                    headers: { "Content-Type": "application/json", ...corsHeaders }
                });
            }
        }

        // -----------------------------
        // DEFAULT RESPONSE
        // -----------------------------
        return new Response("Worker online", {
            headers: corsHeaders
        });
    }
};

