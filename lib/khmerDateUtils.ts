/**
 * Khmer Number & Time Formatting Utilities
 * Handles digit translation (0-9 -> ០-៩), full word conversion (៨:០០ -> ម៉ោងប្រាំបី និងសូន្យនាទី(៨:០០)),
 * and list numbering conversions (1. -> ១.).
 */

export const KHMER_DIGITS_MAP: Record<string, string> = {
  "0": "០",
  "1": "១",
  "2": "២",
  "3": "៣",
  "4": "៤",
  "5": "៥",
  "6": "៦",
  "7": "៧",
  "8": "៨",
  "9": "៩",
};

export const ARABIC_DIGITS_MAP: Record<string, string> = {
  "០": "0",
  "១": "1",
  "២": "2",
  "៣": "3",
  "៤": "4",
  "៥": "5",
  "៦": "6",
  "៧": "7",
  "៨": "8",
  "៩": "9",
};

const KHMER_NUM_WORDS: Record<number, string> = {
  0: "សូន្យ",
  1: "មួយ",
  2: "ពីរ",
  3: "បី",
  4: "បួន",
  5: "ប្រាំ",
  6: "ប្រាំមួយ",
  7: "ប្រាំពីរ",
  8: "ប្រាំបី",
  9: "ប្រាំបួន",
  10: "ដប់",
  11: "ដប់មួយ",
  12: "ដប់ពីរ",
  13: "ដប់បី",
  14: "ដប់បួន",
  15: "ដប់ប្រាំ",
  16: "ដប់ប្រាំមួយ",
  17: "ដប់ប្រាំពីរ",
  18: "ដប់ប្រាំបី",
  19: "ដប់ប្រាំបួន",
  20: "ម្ភៃ",
  30: "សាមសិប",
  40: "សែសិប",
  50: "ហាសិប",
  60: "ហុកសិប",
  70: "ចិតសិប",
  80: "ប៉ែតសិប",
  90: "កៅសិប",
};

/**
 * Converts a number (0-99) into Khmer words.
 * E.g. 8 -> "ប្រាំបី", 0 -> "សូន្យ", 30 -> "សាមសិប", 45 -> "សែសិបប្រាំ"
 */
export function numberToKhmerWord(num: number): string {
  if (num in KHMER_NUM_WORDS) {
    return KHMER_NUM_WORDS[num];
  }
  if (num > 20 && num < 100) {
    const tens = Math.floor(num / 10) * 10;
    const ones = num % 10;
    return `${KHMER_NUM_WORDS[tens]}${KHMER_NUM_WORDS[ones]}`;
  }
  return toKhmerDigits(num);
}

/**
 * Converts all ASCII Arabic digits (0-9) inside any string or number to Khmer digits (០-៩).
 * Example: 1 -> "១", "1." -> "១.", "2025" -> "២០២៥"
 */
export function toKhmerDigits(input: string | number | undefined | null): string {
  if (input === undefined || input === null) return "";
  const str = String(input);
  return str.replace(/[0-9]/g, (char) => KHMER_DIGITS_MAP[char] || char);
}

/**
 * Converts an item index into standard Khmer numbering (e.g. index 0 -> "១.")
 */
export function toKhmerListIndex(index: number): string {
  return `${toKhmerDigits(index + 1)}.`;
}

/**
 * Formats a time string or time range into Khmer words and Khmer digits.
 * Example 1: "08:00" or "៨:០០" or "ម៉ោង ៨:០០" -> "ម៉ោងប្រាំបី និងសូន្យនាទី(៨:០០)"
 * Example 2: "08:30" -> "ម៉ោងប្រាំបី និងសាមសិបនាទី(៨:៣០)"
 * Example 3: "ចាប់ពីម៉ោង ០៨:០០ ដល់ម៉ោង ១១:០០ ព្រឹក" ->
 * "ចាប់ពីម៉ោងប្រាំបី និងសូន្យនាទី(៨:០០) ដល់ម៉ោងដប់មួយ និងសូន្យនាទី(១១:០០) ព្រឹក"
 */
export function formatKhmerTimeString(timeStr: string | undefined | null): string {
  if (!timeStr) return "";

  // Helper function to format an individual HH:MM time match
  const convertSingleTime = (hoursStr: string, minutesStr: string): string => {
    // Normalise arabic digits
    const normH = hoursStr.replace(/[០-៩]/g, (d) => ARABIC_DIGITS_MAP[d] || d);
    const normM = minutesStr.replace(/[០-៩]/g, (d) => ARABIC_DIGITS_MAP[d] || d);
    const h = parseInt(normH, 10);
    const m = parseInt(normM, 10);

    if (isNaN(h)) return `${hoursStr}:${minutesStr}`;

    const hWord = numberToKhmerWord(h);
    const mWord = isNaN(m) || m === 0 ? "សូន្យ" : numberToKhmerWord(m);
    const khDigitsTime = `${toKhmerDigits(normH.padStart(1, "0"))}:${toKhmerDigits(normM.padStart(2, "0"))}`;

    return `ម៉ោង${hWord} និង${mWord}នាទី(${khDigitsTime})`;
  };

  let formatted = timeStr;

  // Pattern A: "ម៉ោង HH:MM" or "ម៉ោងHH:MM" (with arabic or khmer digits)
  formatted = formatted.replace(
    /ម៉ោង\s*([0-9០-៩]{1,2}):([0-9០-៩]{2})/g,
    (_, h, m) => convertSingleTime(h, m)
  );

  // Pattern B: standalone "HH:MM" (not already preceded by ម៉ោង)
  formatted = formatted.replace(
    /(?<!ម៉ោង\s*|ម៉ោង)([0-9០-៩]{1,2}):([0-9០-៩]{2})/g,
    (_, h, m) => convertSingleTime(h, m)
  );

  // Also replace any lingering old "សូននាទី" with "សូន្យនាទី"
  formatted = formatted.replace(/សូននាទី/g, "សូន្យនាទី");

  // Also convert any remaining loose english digits to Khmer digits
  formatted = toKhmerDigits(formatted);

  return formatted;
}

/**
 * Replaces leading bullet numbers in strings like "1. Item" or "1- Item" with Khmer digits "១. Item"
 */
export function convertTextNumbersToKhmer(text: string | undefined | null): string {
  if (!text) return "";
  return toKhmerDigits(text);
}

/**
 * Formats Markdown text for clean administrative display (cleans **bold**, * bullets, etc.)
 */
export function cleanMarkdownForAdministrativePrint(text: string | undefined | null): string {
  if (!text) return "";
  let clean = text;
  // Remove markdown headers
  clean = clean.replace(/^#+\s+/gm, "");
  // Format bold **text** to clean text or keep content
  clean = clean.replace(/\*\*([^*]+)\*\*/g, "$1");
  // Format bullet asterisks to clean dash or dot
  clean = clean.replace(/^\*\s+/gm, "• ");
  return toKhmerDigits(clean);
}

/**
 * Generates an authentic Khmer administrative opening paragraph (កថាខណ្ឌផ្តើមនៃកិច្ចប្រជុំ)
 * with full Khmer digit and time wording conversion.
 */
export function generateKhmerIntroParagraph(params: {
  dateStr?: string;
  timeStr?: string;
  schoolName?: string;
  meetingChair?: string;
  title?: string;
}): string {
  const school = params.schoolName || "សាលាបឋមសិក្សា រោគ";
  const chair = params.meetingChair || "លោកស្រី សុខ សារើន (នាយិកាសាលា)";
  const title = params.title || "ការពិនិត្យ វាយតម្លៃការងារ និងពង្រឹងគុណភាពអប់រំ";
  const rawTime = params.timeStr || "ម៉ោង ០៨:០០ ព្រឹក";
  const time = formatKhmerTimeString(rawTime);
  const rawDate = params.dateStr || "ថ្ងៃទី១៥ ខែកក្កដា ឆ្នាំ២០២៥";
  const date = toKhmerDigits(rawDate);

  const cleanTitle =
    title.replace(/^(កំណត់ហេតុប្រជុំលើកទី\d+\s*(\([^)]*\))?|កំណត់ហេតុ\s*(ស្ដីពី)?)/g, "").trim() ||
    "ពិនិត្យ និងវាយតម្លៃការងារ";

  return `${date} វេលា${time} នៅ${school} បានបើកកិច្ចប្រជុំមួយដើម្បី ${cleanTitle} ដែលដឹកនាំដោយ${chair} ជាប្រធានអង្គប្រជុំ។`;
}
