import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Supported Flash models in priority order
const CANDIDATE_MODELS = [
  "gemini-3.7-flash",
  "gemini-2.5-flash",
  "gemini-3.1-flash-lite",
];

async function generateWithFallback(ai: GoogleGenAI, prompt: string) {
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    // Retry up to 2 times for each model if experiencing temporary 503/429
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction:
              "អ្នកជាជំនួយការរដ្ឋបាលសាលារៀនកម្ពុជា មានជំនាញខ្ពស់ក្នុងការសង្ខេបកំណត់ហេតុប្រជុំជាភាសាខ្មែរផ្លូវការ ខ្លី ខ្លឹម និងត្រឹមត្រូវ។",
            temperature: 0.3,
          },
        });

        const text = response.text?.trim();
        if (text) {
          return text;
        }
      } catch (err: any) {
        lastError = err;
        const isTransient =
          err?.status === "UNAVAILABLE" ||
          err?.message?.includes("503") ||
          err?.message?.includes("high demand") ||
          err?.message?.includes("429") ||
          err?.message?.includes("rate limit");

        if (isTransient && attempt < 2) {
          // Wait 1 second before retrying same model
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        // If not transient or second attempt failed, break to next model
        break;
      }
    }
  }

  throw lastError || new Error("មិនអាចទាញយកសេចក្តីសង្ខេបពីគ្រប់ម៉ូដែល AI បានទេ។");
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY មិនត្រូវបានកំណត់នៅក្នុងបរិស្ថានទេ។ សូមពិនិត្យមើលការកំណត់ Settings > Secrets។",
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      title = "",
      agenda = [],
      decisions = [],
      schoolName = "",
      date = "",
      introParagraph = "",
    } = body;

    const agendaList = Array.isArray(agenda)
      ? agenda
          .filter((item: string) => item && item.trim() !== "")
          .map((a: string, i: number) => `${i + 1}. ${a}`)
          .join("\n")
      : "";

    const decisionList = Array.isArray(decisions)
      ? decisions
          .filter((item: string) => item && item.trim() !== "")
          .map((d: string, i: number) => `${i + 1}. ${d}`)
          .join("\n")
      : "";

    if (!agendaList && !decisionList && !title) {
      return NextResponse.json(
        {
          error:
            "សូមបញ្ចូលរបៀបវារៈ (Agenda) ឬសេចក្តីសម្រេច (Decisions) យ៉ាងហោចណាស់មួយ ដើម្បីឱ្យ Gemini AI អាចធ្វើការសង្ខេបបាន។",
        },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const prompt = `
អ្នកគឺជាអ្នករៀបចំ និងកត់ត្រាកំណត់ហេតុប្រជុំផ្នែកអប់រំ និងរដ្ឋបាលសាលារៀននៅកម្ពុជា។
សូមជួយបង្កើត "សេចក្តីសង្ខេបកិច្ចប្រជុំ (Executive Summary)" យ៉ាងសង្ខេប ខ្លី ខ្លឹម ផ្លូវការ និងច្បាស់លាស់ជាភាសាខ្មែរ ដោយផ្អែកលើព័ត៌មានកិច្ចប្រជុំដូចខាងក្រោម៖

- កិច្ចប្រជុំស្ដីពី៖ ${title || "កិច្ចប្រជុំសាលារៀន"}
- ស្ថាប័ន/សាលារៀន៖ ${schoolName || "សាលាបឋមសិក្សា"}
- កាលបរិច្ឆេទ៖ ${date || "មិនបានបញ្ជាក់"}
- កថាខណ្ឌផ្តើម (បើមាន)៖ ${introParagraph || "គ្មាន"}

--- របៀបវារៈនៃកិច្ចប្រជុំ (Agenda) ---
${agendaList || "(គ្មានរបៀបវារៈ)"}

--- សេចក្តីសម្រេច និងវិធានការអនុវត្ត (Decisions) ---
${decisionList || "(គ្មានសេចក្តីសម្រេច)"}

សេចក្តីណែនាំសម្រាប់ការសង្ខេប៖
១. សរសេរជាកថាខណ្ឌខ្លីៗ ឬជាចំណុចគន្លឹះសំខាន់ៗដែលឆ្លុះបញ្ចាំងពីគោលបំណងសំខាន់នៃរបៀបវារៈ និងលទ្ធផលសម្រេចបានជាក់ស្តែង។
២. ប្រើប្រាស់ពាក្យពេចន៍រដ្ឋបាលគរុកោសល្យផ្លូវការ ត្រឹមត្រូវតាមវេយ្យាករណ៍ខ្មែរ។
៣. មិនចាំបាច់បន្ថែមបុព្វកថាវែងអន្លាយទេ ផ្តល់តែខ្លឹមសារសង្ខេបផ្ទាល់តែម្តង។
៤. ប្រវែងសមស្របប្រមាណ ៣ ទៅ ៦ បន្ទាត់ ឬចំណុចខ្លីៗ ងាយយល់ និងងាយស្រង់យកទៅប្រើប្រាស់។
`;

    const summaryText = await generateWithFallback(ai, prompt);

    return NextResponse.json({ summary: summaryText });
  } catch (error: any) {
    console.error("Gemini summarize error:", error);

    // Extract user-friendly error description
    let errMsg = "មានបញ្ហាក្នុងការទាក់ទងជាមួយ Gemini AI API។ សូមព្យាយាមម្តងទៀត។";
    if (error?.message) {
      if (error.message.includes("503") || error.message.includes("high demand") || error.message.includes("UNAVAILABLE")) {
        errMsg = "សេវា Gemini AI កំពុងមានការប្រើប្រាស់ខ្ពស់បណ្តោះអាសន្ន។ សូមរង់ចាំបន្តិច រួចចុច 'បង្កើតសេចក្តីសង្ខេប AI' ម្តងទៀត។";
      } else if (error.message.includes("429") || error.message.includes("quota")) {
        errMsg = "ការស្នើសុំលើសកម្រិតកំណត់ (Rate limit) បណ្តោះអាសន្ន។ សូមរង់ចាំបន្តិច រួចព្យាយាមម្តងទៀត។";
      } else {
        errMsg = error.message;
      }
    }

    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
}
