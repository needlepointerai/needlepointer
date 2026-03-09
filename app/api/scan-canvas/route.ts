import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SCAN_PROMPT = `You are analyzing a photo of a needlepoint canvas. Extract the following and return ONLY a valid JSON object (no markdown, no code fence). Use null for any field you cannot read or are unsure about.

Return this exact structure:
{
  "name": "canvas name or title if visible - look for text printed ON the canvas itself, or any tags/labels",
  "designer": "designer name if visible",
  "retailer": "retailer/shop if visible",
  "mesh_count": "13" or "18" or "other",
  "thread_colors": ["36 - admiral blue", "198 - ahoy!", "10 - classic navy", "58 - oyster"] or [],
  "lot_number": "lot number if visible on thread labels",
  "condition": "e.g. new, started, finished, needs repair"
}

Needlepoint-specific hints:
- BORDER COLORS: Purple border = Lycette Designs (retailer). Blue/white seersucker diagonal stripe = Morgan Julia Designs purchased direct.
- CANVAS NUMBER PREFIXES: MJD = Morgan Julia Designs. LO = Lycette original design.
- DESIGNERS: Morgan Julia Designs (anchor mark), Lycette Designs (purple border), MHB Studio (red heart + "love mhb" text), Penny Linn Designs (@pennylinndesigns on border).
- THREAD TAGS: Read all thread color tags carefully. Each tag shows "color: NUMBER - NAME" and "lot #: NUMBER". Extract each as "NUMBER - NAME" in thread_colors array.
- CANVAS NAME: If you cannot determine the name from the image, use null. Do not guess.`;

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured" },
      { status: 503 }
    );
  }

  let body: { image: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const imageData = body.image;
  if (!imageData || typeof imageData !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid 'image' (base64 string)" },
      { status: 400 }
    );
  }

  const base64 = imageData.replace(/^data:image\/\w+;base64,/, "");
  const mediaType = imageData.startsWith("data:image/png") ? "image/png" : imageData.startsWith("data:image/gif") ? "image/gif" : imageData.startsWith("data:image/webp") ? "image/webp" : "image/jpeg";

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    let message;
    try {
      console.log("API key present:", !!process.env.ANTHROPIC_API_KEY);
      message = await anthropic.messages.create({
        model: "claude-opus-4-5-20251101",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: SCAN_PROMPT },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: base64,
                },
              },
            ],
          },
        ],
      });
    } catch (apiErr) {
      console.error("[scan-canvas] Anthropic API error:", apiErr);
      console.error("[scan-canvas] Error name:", apiErr instanceof Error ? apiErr.name : "N/A");
      console.error("[scan-canvas] Error message:", apiErr instanceof Error ? apiErr.message : String(apiErr));
      console.error("[scan-canvas] Error stack:", apiErr instanceof Error ? apiErr.stack : "N/A");
      const errObj = apiErr as Record<string, unknown>;
      if (errObj && typeof errObj === "object") {
        console.error("[scan-canvas] Full error object keys:", Object.keys(errObj));
        if ("status" in errObj) console.error("[scan-canvas] status:", errObj.status);
        if ("error" in errObj) console.error("[scan-canvas] error:", errObj.error);
        if ("body" in errObj) console.error("[scan-canvas] body:", errObj.body);
      }
      throw apiErr;
    }

    const text =
      message.content
        .filter((block) => block.type === "text")
        .map((b) => (b as { type: "text"; text: string }).text)
        .join("") || "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const raw = jsonMatch ? jsonMatch[0] : text;
    let data: {
      name?: string | null;
      designer?: string | null;
      retailer?: string | null;
      mesh_count?: string | null;
      thread_colors?: string[] | null;
      lot_number?: string | null;
      condition?: string | null;
    };
    try {
      data = JSON.parse(raw) as typeof data;
    } catch (parseErr) {
      console.error("[scan-canvas] JSON parse error:", parseErr);
      console.error("[scan-canvas] Raw text from model:", raw?.slice(0, 500));
      throw parseErr;
    }

    return NextResponse.json({
      name: data.name ?? null,
      designer: data.designer ?? null,
      retailer: data.retailer ?? null,
      mesh_count: data.mesh_count ?? null,
      thread_colors: Array.isArray(data.thread_colors) ? data.thread_colors : [],
      lot_number: data.lot_number ?? null,
      condition: data.condition ?? null,
    });
  } catch (err) {
    console.error("[scan-canvas] Caught error:", err);
    console.error("[scan-canvas] Full error object:", JSON.stringify(err, Object.getOwnPropertyNames(err as object), 2));
    const message = err instanceof Error ? err.message : "Scan failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
