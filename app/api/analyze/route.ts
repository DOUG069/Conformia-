import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import pdfParse from "pdf-parse";

const client = new Groq();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { text } = await pdfParse(buffer);

    if (!text || text.trim().length < 50) {
      return NextResponse.json({ error: "Impossible d'extraire le texte du PDF" }, { status: 422 });
    }

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Tu es un expert en conformitÃ© lÃ©gale franÃ§aise et europÃ©enne. Tu rÃ©ponds UNIQUEMENT en JSON valide, sans markdown, sans backticks, sans texte avant ou aprÃ¨s.",
        },
        {
          role: "user",
          content: `Analyse ce document juridique et retourne un objet JSON avec cette structure exacte :
{
  "score": <entier entre 0 et 100>,
  "domaine": "<RGPD | Droit du travail | Contrats | Mentions lÃ©gales | Autre>",
  "resume": "<rÃ©sumÃ© neutre en 1 phrase>",
  "risques": [
    { "niveau": "Ã©levÃ©", "description": "<description courte et prÃ©cise>" }
  ],
  "suggestions": [
    "<action concrÃ¨te Ã  mettre en place>"
  ]
}

RÃ¨gles :
- score 0-40 = non conforme, 41-70 = partiellement conforme, 71-100 = conforme
- 2 Ã  5 risques maximum
- 2 Ã  4 suggestions maximum

Document :
---
${text.slice(0, 6000)}
---`,
        },
      ],
    });

    const raw = response.choices[0].message.content?.trim() ?? "";
    const result = JSON.parse(raw);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[/api/analyze]", error);
    return NextResponse.json({ error: "Erreur lors de l'analyse" }, { status: 500 });
  }
}

