// Sommelier AI — analyze a wine list image and/or recommend pairings.
// Uses Lovable AI Gateway (no API key from user required).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ReqBody = {
  mode: "scan" | "pair";
  imageDataUrl?: string; // for scan mode
  wineListText?: string; // optional textual list
  food?: string; // for pair mode
  preferences: {
    likes: string[];
    dislikes: string[];
    budget: "value" | "mid" | "premium" | "any";
    notes: string;
  };
  cellar: Array<{ name: string; rating: string; varietal?: string; region?: string }>;
};

const SYSTEM = `You are an expert sommelier with deep knowledge of grape varieties, regions, vintages, and food pairing.
You receive a wine list (as a photo or text) plus the diner's taste profile, prior tried wines, and optionally the food being eaten.
Recommend the BEST 5 wines from the list (strictly only wines that appear on the provided list — never invent bottles that aren't there).
Score each from 60-99 based on fit. Be concise but specific in the reasoning.

Respond with ONLY valid JSON in this exact shape — no markdown, no prose:
{
  "recommendations": [
    {
      "name": "string",
      "varietal": "string",
      "region": "string",
      "vintage": "string or empty",
      "format": "bottle | glass | unknown",
      "price": "string e.g. $48 or empty",
      "matchScore": number,
      "reasoning": "1-2 sentence sommelier-grade explanation tied to the diner's profile and food (if any)"
    }
  ],
  "summary": "1 sentence on the overall list quality and what to lean into"
}`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as ReqBody;
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userParts: Array<Record<string, unknown>> = [];
    const profileText = `
DINER PROFILE
- Likes: ${body.preferences.likes.join(", ") || "(none specified)"}
- Dislikes: ${body.preferences.dislikes.join(", ") || "(none specified)"}
- Budget: ${body.preferences.budget}
- Notes: ${body.preferences.notes || "(none)"}

PRIOR TRIED WINES (use these to refine taste inference):
${body.cellar.length ? body.cellar.map((c) => `- ${c.name} [${c.rating}]${c.varietal ? ` — ${c.varietal}` : ""}${c.region ? `, ${c.region}` : ""}`).join("\n") : "(none yet)"}

${body.mode === "pair" ? `FOOD BEING EATEN: ${body.food}` : "Recommend versatile picks unless food is mentioned in the list."}

${body.wineListText ? `WINE LIST (text):\n${body.wineListText}` : ""}
${body.imageDataUrl ? "The wine list is in the attached image. Read every readable bottle and price." : ""}

Return JSON only.
`.trim();

    userParts.push({ type: "text", text: profileText });
    if (body.imageDataUrl) {
      userParts.push({ type: "image_url", image_url: { url: body.imageDataUrl } });
    }

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userParts },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      return new Response(JSON.stringify({ error: "AI gateway error", detail: text }), {
        status: aiRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const content: string = data.choices?.[0]?.message?.content ?? "{}";
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { recommendations: [], summary: content };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
