import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SCAN_PROMPT = `You are analyzing a photo of a needlepoint canvas. Extract the following and return ONLY a valid JSON object (no markdown, no code fence). Use null for any field you cannot read or are unsure about.

Return this exact structure:
{
  "name": "canvas name or title if visible",
  "designer": "designer name if visible",
  "retailer": "retailer/shop if visible",
  "mesh_count": "13" or "18" or "other",
  "thread_colors": ["color 1", "color 2"] or [],
  "lot_number": "lot number if visible on thread labels",
  "condition": "e.g. new, started, finished, needs repair"
}

Needlepoint-specific hints:
- BORDER COLORS: Purple border = Lycette Designs (retailer). Blue/white seersucker diagonal stripe = Morgan Julia Designs purchased direct.
- CANVAS NUMBER PREFIXES: MJD = Morgan Julia Designs. LO = Lycette original design.
- DESIGNERS: Morgan Julia Designs (anchor mark), Lycette Designs (purple border), MHB Studio (red heart + "love mhb" text), Penny Linn Designs (@pennylinndesigns on border).`;

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
  const mediaType = imageData.startsWith("data:image/png") ? "image/png" : "image/jpeg";

  const anthropic = new Anthropic({ apiKey });

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
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

    const text =
      message.content
        .filter((block) => block.type === "text")
        .map((b) => (b as { type: "text"; text: string }).text)
        .join("") || "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const raw = jsonMatch ? jsonMatch[0] : text;
    const data = JSON.parse(raw) as {
      name?: string | null;
      designer?: string | null;
      retailer?: string | null;
      mesh_count?: string | null;
      thread_colors?: string[] | null;
      lot_number?: string | null;
      condition?: string | null;
    };

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
    const message = err instanceof Error ? err.message : "Scan failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
