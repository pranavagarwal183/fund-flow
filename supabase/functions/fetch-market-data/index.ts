// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'content-type': 'application/json' } });
    }

    const { scheme_codes } = await req.json();
    if (!Array.isArray(scheme_codes) || scheme_codes.length === 0) {
      return new Response(JSON.stringify({ error: 'scheme_codes array required' }), { status: 400, headers: { 'content-type': 'application/json' } });
    }

    // In production, fetch from a paid market data API with server-side API key and caching
    // Placeholder: synthesize minimal data for each scheme
    const now = Date.now();
    const days = 30;
    const response = scheme_codes.map((code: string) => {
      const base = 100 + Math.random() * 50;
      const series = Array.from({ length: days }, (_, i) => {
        const t = i / days;
        const value = base * (1 + 0.02 * Math.sin(6.28 * t) + 0.05 * t) * (1 + (Math.random() - 0.5) * 0.02);
        return { date: new Date(now - (days - i) * 24 * 3600 * 1000).toISOString().slice(0, 10), nav: Number(value.toFixed(2)) };
      });
      const nav = series[series.length - 1].nav;
      return {
        scheme_code: code,
        fund_name: `Fund ${code}`,
        category: 'Flexi Cap',
        metrics: {
          nav,
          return_1y: Number((5 + Math.random() * 15).toFixed(2)),
          return_3y: Number((8 + Math.random() * 20).toFixed(2)),
        },
        series,
      };
    });

    return new Response(JSON.stringify({ data: response }), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Unknown error' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
});


