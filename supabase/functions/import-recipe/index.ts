/**
 * Supabase Edge Function: import-recipe
 *
 * Fetches a recipe web page server-side (avoiding browser CORS), strips it to
 * text, and uses OpenAI to extract a recipe in Dishly's schema — filling any
 * gaps (difficulty, per-step minutes) with best-guess values. The hero image
 * prefers the page's real og:image / JSON-LD image, falling back to a keyword
 * stock photo.
 *
 * Request:  { url: string }
 * Response: { recipe: Recipe } | { error: string }
 */
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const MODEL = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o-mini';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const EXTRACT_PROMPT = `Extract the single main recipe from this web page text as
strict JSON. Fill any missing details with sensible best-guess values (never
leave fields empty). Return ONLY:
{ "recipe": {
  "title": string,
  "prep": integer minutes (estimate if absent),
  "cook": integer minutes (estimate if absent),
  "difficulty": "Easy" | "Medium" | "Hard" (estimate from technique/step count),
  "dietary": string[] lowercase applicable tags,
  "allergens": string[] lowercase major allergens the dish CONTAINS (from:
    peanuts, tree nuts, dairy, egg, gluten, soy, shellfish, fish; [] if none),
  "calories": string like "520 kcal per serving · Serves 2" (estimate if absent),
  "ingredients": [ { "name": string, "g"?: number, "text"?: string } ],
  "steps": [ { "n": integer, "min": integer minutes (estimate per step), "template": string } ]
} }
If the page has no recipe, return { "error": "no recipe found" }.`;

/** Pull a hero image URL from og:image or a JSON-LD "image" field. */
function extractImage(html: string): string | null {
  const og = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
  );
  if (og?.[1]) return og[1];
  const ld = html.match(/"image"\s*:\s*"([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i);
  if (ld?.[1]) return ld[1];
  return null;
}

/** Strip scripts/styles/tags to a plain-text approximation of the page. */
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 8000);
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

function imageFallback(title: string): string {
  const kw = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).slice(0, 2).join(',') || 'food';
  return `https://loremflickr.com/800/600/${encodeURIComponent(kw)}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!OPENAI_API_KEY) return json({ error: 'OPENAI_API_KEY secret is not set.' }, 500);

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }
  const url = (body.url ?? '').trim();
  if (!/^https?:\/\/.+/i.test(url)) return json({ error: 'Enter a valid http(s) URL.' }, 400);

  // 1. Fetch the page server-side.
  let html: string;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DishlyBot/1.0)' },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return json({ error: `Couldn’t load the page (HTTP ${res.status}).` }, 422);
    html = await res.text();
  } catch {
    return json({ error: 'Couldn’t reach that URL.' }, 422);
  }

  const pageImage = extractImage(html);
  const text = htmlToText(html);
  if (text.length < 40) return json({ error: 'That page had no readable content.' }, 422);

  // 2. Extract the recipe with OpenAI.
  let parsed: any;
  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: EXTRACT_PROMPT },
          { role: 'user', content: `URL: ${url}\n\nPAGE TEXT:\n${text}` },
        ],
      }),
    });
    if (!resp.ok) return json({ error: 'Extraction failed', detail: await resp.text() }, 502);
    const data = await resp.json();
    parsed = JSON.parse(data.choices?.[0]?.message?.content ?? '{}');
  } catch (err) {
    return json({ error: 'Extraction failed', detail: String(err) }, 500);
  }

  if (parsed.error || !parsed.recipe) return json({ error: 'No recipe found on that page.' }, 422);

  const r = parsed.recipe;
  const title = String(r.title ?? 'Imported Recipe');
  let host = 'the web';
  try {
    host = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    // keep default
  }

  // 3. Assemble + gap-fill into Dishly's Recipe shape.
  const recipe = {
    id: `ai-import-${slugify(title)}-${Date.now().toString(36)}`,
    title,
    author: `Imported from ${host}`,
    image: pageImage ?? imageFallback(title),
    sourceUrl: url,
    rating: null,
    prep: Number(r.prep) || 10,
    cook: Number(r.cook) || 20,
    difficulty: ['Easy', 'Medium', 'Hard'].includes(r.difficulty) ? r.difficulty : 'Medium',
    dietary: Array.isArray(r.dietary) ? r.dietary.map(String) : [],
    allergens: Array.isArray(r.allergens) ? r.allergens.map(String) : [],
    calories: String(r.calories ?? 'Nutrition not specified'),
    ingredients: Array.isArray(r.ingredients)
      ? r.ingredients.map((i: any) => ({
          name: String(i?.name ?? ''),
          g: typeof i?.g === 'number' ? i.g : undefined,
          text: i?.text != null ? String(i.text) : undefined,
        }))
      : [],
    steps: Array.isArray(r.steps)
      ? r.steps.map((s: any, n: number) => ({
          n: Number(s?.n) || n + 1,
          min: Number(s?.min) || 5,
          template: String(s?.template ?? ''),
        }))
      : [],
  };

  return json({ recipe });
});
