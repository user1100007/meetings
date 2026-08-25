/**
 * Khmer Lunar Calendar & Cambodian Public Holidays Engine
 * Implements Solar to Lunar conversions, Buddhist Era, Chhankitek (ចន្ទគតិ),
 * Animal Years (ឆ្នាំសត្វ), Sak (ស័ក), Sil Days (ថ្ងៃសីល), and Official Cambodian Holidays.
 */

export interface KhmerDateDetail {
  solarDate: Date;
  solarDay: number;
  solarMonth: number; // 1-12
  solarYear: number;
  dayOfWeek: number; // 0=Sunday, 6=Saturday
  dayOfWeekKhmer: string;
  dayOfWeekKhmerShort: string;
  
  // Lunar Details
  lunarDay: number; // 1-15
  lunarPhase: "កើត" | "រោច"; // Waxing (កើត) or Waning (រោច)
  lunarMonthName: string; // មិគសិរ, បុស្ស, មាឃ...
  lunarMonthIndex: number;
  animalYear: string; // ជូត, ឆ្លូវ, ខាល...
  sak: string; // ឯកស័ក, ទោស័ក, ត្រីស័ក...
  beYear: number; // Buddhist Era (ព.ស.)
  
  // Indicators
  isSila: boolean; // ថ្ងៃសីល (៨កើត, ១៥កើត, ៨រោច, ១៤/១៥រោច)
  silaDescription?: string; // ពេញបូណ៌មី, ដាច់ខែ...
  isHoliday: boolean;
  holidayName?: string;
  isSchoolHoliday?: boolean;

  // Formatted Texts for Copying
  fullAdminKhmerText: string; // e.g. ឆ្នាំពីរពាន់ម្ភៃប្រាំ ខែកក្កដា ថ្ងៃទីបី ត្រូវនឹងថ្ងៃព្រហស្បតិ៍...
  standardKhmerDateText: string; // e.g. ថ្ងៃព្រហស្បតិ៍ ៨កើត ខែអាសាឍ ឆ្នាំម្សាញ់ សប្តស័ក ព.ស.២៥៦៩ ត្រូវនឹងថ្ងៃទី០៣ ខែកក្កដា ឆ្នាំ២០២៥
  solarKhmerText: string; // e.g. ថ្ងៃទី០៣ ខែកក្កដា ឆ្នាំ២០២៥
}

export const KHMER_DAYS_OF_WEEK = [
  "ថ្ងៃអាទិត្យ",
  "ថ្ងៃច័ន្ទ",
  "ថ្ងៃអង្គារ",
  "ថ្ងៃពុធ",
  "ថ្ងៃព្រហស្បតិ៍",
  "ថ្ងៃសុក្រ",
  "ថ្ងៃសៅរ៍",
];

export const KHMER_DAYS_SHORT = ["អា", "ច", "អ", "ព", "ព្រ", "សុ", "ស"];

export const KHMER_SOLAR_MONTHS = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
];

export const KHMER_LUNAR_MONTHS = [
  "មិគសិរ",
  "បុស្ស",
  "មាឃ",
  "ផល្គុន",
  "ចេត្រ",
  "ពិសាខ",
  "ជេដ្ឋ",
  "អាសាឍ",
  "ស្រាពណ៍",
  "ភទ្របទ",
  "អស្សុជ",
  "កត្តិក",
];

export const KHMER_ANIMAL_YEARS = [
  "ជូត",
  "ឆ្លូវ",
  "ខាល",
  "ថោះ",
  "រោង",
  "ម្សាញ់",
  "មមី",
  "មមែ",
  "វក",
  "រកា",
  "ច",
  "កុរ",
];

export const KHMER_SAK = [
  "សំរឹទ្ធិស័ក", // 0
  "ឯកស័ក",     // 1
  "ទោស័ក",     // 2
  "ត្រីស័ក",     // 3
  "ចត្វាស័ក",    // 4
  "បញ្ចស័ក",    // 5
  "ឆស័ក",      // 6
  "សប្តស័ក",    // 7
  "អដ្ឋស័ក",    // 8
  "នព្វស័ក",     // 9
];

export const KHMER_NUMBERS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];

export function toKhmerNum(num: number | string): string {
  return num
    .toString()
    .split("")
    .map((d) => KHMER_NUMBERS[parseInt(d, 10)] ?? d)
    .join("");
}

export const NUMBER_WORDS_KHMER: Record<number, string> = {
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
  21: "ម្ភៃមួយ",
  22: "ម្ភៃពីរ",
  23: "ម្ភៃបី",
  24: "ម្ភៃបួន",
  25: "ម្ភៃប្រាំ",
  26: "ម្ភៃប្រាំមួយ",
  27: "ម្ភៃប្រាំពីរ",
  28: "ម្ភៃប្រាំបី",
  29: "ម្ភៃប្រាំបួន",
  30: "សាមសិប",
  31: "សាមសិបមួយ",
};

export function spellOutKhmerYear(year: number): string {
  if (year === 2024) return "ពីរពាន់ម្ភៃបួន";
  if (year === 2025) return "ពីរពាន់ម្ភៃប្រាំ";
  if (year === 2026) return "ពីរពាន់ម្ភៃប្រាំមួយ";
  if (year === 2027) return "ពីរពាន់ម្ភៃប្រាំពីរ";
  if (year === 2028) return "ពីរពាន់ម្ភៃប្រាំបី";
  if (year === 2029) return "ពីរពាន់ម្ភៃប្រាំបួន";
  if (year === 2030) return "ពីរពាន់សាមសិប";
  return `ឆ្នាំ ${toKhmerNum(year)}`;
}

export function spellOutKhmerBuddhistYear(beYear: number): string {
  if (beYear === 2568) return "ពីរពាន់ប្រាំរយហុកសិបប្រាំបី";
  if (beYear === 2569) return "ពីរពាន់ប្រាំរយហុកសិបប្រាំបួន";
  if (beYear === 2570) return "ពីរពាន់ប្រាំរយចិតសិប";
  if (beYear === 2571) return "ពីរពាន់ប្រាំរយចិតសិបមួយ";
  if (beYear === 2572) return "ពីរពាន់ប្រាំរយចិតសិបពីរ";
  return `ពុទ្ធសករាជ ${toKhmerNum(beYear)}`;
}

export interface PublicHolidayDef {
  month: number; // 1-12
  day?: number; // Solar day (if fixed)
  lunarMonth?: number; // 1-12 (if lunar based)
  lunarDay?: number;
  lunarPhase?: "កើត" | "រោច";
  durationDays?: number;
  name: string;
  description: string;
  isSchoolHoliday?: boolean;
}

/**
 * Fixed and predictable Cambodian Public Holidays
 */
export const CAMBODIAN_HOLIDAYS_TABLE: Record<string, string> = {
  // Format: "MM-DD": "Holiday Name"
  "01-01": "ទិវាចូលឆ្នាំសកល (International New Year's Day)",
  "01-07": "ទិវាជ័យជម្នះលើរបបប្រល័យពូជសាសន៍ (Victory Day)",
  "03-08": "ទិវាអន្តរជាតិនារី (International Women's Day)",
  "04-13": "ពិធីបុណ្យចូលឆ្នាំថ្មី ប្រពៃណីជាតិខ្មែរ (Khmer New Year Day 1)",
  "04-14": "ពិធីបុណ្យចូលឆ្នាំថ្មី ប្រពៃណីជាតិខ្មែរ (Khmer New Year Day 2)",
  "04-15": "ពិធីបុណ្យចូលឆ្នាំថ្មី ប្រពៃណីជាតិខ្មែរ (Khmer New Year Day 3)",
  "04-16": "ពិធីបុណ្យចូលឆ្នាំថ្មី ប្រពៃណីជាតិខ្មែរ (Khmer New Year Day 4)",
  "05-01": "ទិវាពលកម្មអន្តរជាតិ (International Labour Day)",
  "05-14": "ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម ព្រះករុណា ព្រះបាទសម្តេច ព្រះបរមនាថ នរោត្តម សីហមុនី",
  "06-18": "ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម សម្តេចព្រះមហាក្សត្រី នរោត្តម មុនិនាថ សីហនុ",
  "09-24": "ទិវាប្រកាសរដ្ឋធម្មនុញ្ញ (National Constitution Day)",
  "10-15": "ទិវាប្រារព្ធពិធីគោរពព្រះវិញ្ញាណក្ខន្ធ ព្រះករុណា ព្រះបាទសម្តេច ព្រះនរោត្តម សីហនុ ព្រះបរមរតនកោដ្ឋ",
  "10-29": "ព្រះរាជពិធីគ្រងព្រះបរមរាជសម្បត្តិ ព្រះករុណា ព្រះបាទសម្តេច ព្រះបរមនាថ នរោត្តម សីហមុនី",
  "11-09": "ពិធីបុណ្យឯករាជ្យជាតិ (National Independence Day)",
};

/**
 * Approximate astronomical lunar calculations for Cambodian region
 * Epoch reference based on Khmer astronomical chhankitek sync
 */
export function getKhmerDateDetail(date: Date): KhmerDateDetail {
  const solarYear = date.getFullYear();
  const solarMonth = date.getMonth() + 1; // 1-12
  const solarDay = date.getDate();
  const dayOfWeek = date.getDay(); // 0-6

  // Approximate Khmer Lunar Calculation
  // Julian Day Calculation
  const a = Math.floor((14 - solarMonth) / 12);
  const y = solarYear + 4800 - a;
  const m = solarMonth + 12 * a - 3;
  const jdn =
    solarDay +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  // Synodic month calculation (29.53058867 days)
  // Base new moon reference: JD 2451549.5 (Jan 6, 2000)
  const synodicMonth = 29.53058867;
  const daysSinceEpoch = jdn - 2451549.5;
  const newMoons = daysSinceEpoch / synodicMonth;
  const currentCycleProgress = (newMoons - Math.floor(newMoons)) * synodicMonth;

  let lunarDay: number;
  let lunarPhase: "កើត" | "រោច";

  if (currentCycleProgress < 15) {
    lunarDay = Math.max(1, Math.min(15, Math.floor(currentCycleProgress) + 1));
    lunarPhase = "កើត";
  } else {
    lunarDay = Math.max(1, Math.min(15, Math.floor(currentCycleProgress - 15) + 1));
    lunarPhase = "រោច";
  }

  // Khmer Lunar Month mapping based on Solar Month & day
  // Lunar year starts roughly in Dec (Month 1 = មិគសិរ)
  let lunarMonthIndex = (solarMonth + 11) % 12; // 0=មិគសិរ, 1=បុស្ស ... 5=ពិសាខ ... 7=អាសាឍ
  const lunarMonthName = KHMER_LUNAR_MONTHS[lunarMonthIndex] || "អាសាឍ";

  // Animal year (ឆ្នាំសត្វ): 2024 = រោង, 2025 = ម្សាញ់, 2026 = មមី, 2027 = មមែ
  // Formula: (year + 8) % 12
  const animalYearIndex = (solarYear + 8) % 12;
  const animalYear = KHMER_ANIMAL_YEARS[animalYearIndex] || "ម្សាញ់";

  // Sak (ស័ក): 2024=ឆស័ក, 2025=សប្តស័ក, 2026=អដ្ឋស័ក
  // Formula: (year + 2) % 10
  const sakIndex = (solarYear + 2) % 10;
  const sak = KHMER_SAK[sakIndex] || "សប្តស័ក";

  // Buddhist Era (ពុទ្ធសករាជ): May to Dec = Year + 544, Jan to April = Year + 543
  const beYear = solarMonth >= 5 ? solarYear + 544 : solarYear + 543;

  // Sila Day Check (៨កើត, ១៥កើត, ៨រោច, ១៤រោច/១៥រោច)
  let isSila = false;
  let silaDescription: string | undefined;

  if (lunarPhase === "កើត" && lunarDay === 8) {
    isSila = true;
    silaDescription = "៨កើត (ថ្ងៃសីល)";
  } else if (lunarPhase === "កើត" && lunarDay === 15) {
    isSila = true;
    silaDescription = "១៥កើត ពេញបូណ៌មី (ថ្ងៃសីលធំ)";
  } else if (lunarPhase === "រោច" && lunarDay === 8) {
    isSila = true;
    silaDescription = "៨រោច (ថ្ងៃសីល)";
  } else if (lunarPhase === "រោច" && (lunarDay === 14 || lunarDay === 15)) {
    isSila = true;
    silaDescription = "ដាច់ខែ (ថ្ងៃសីលធំ)";
  }

  // Holiday Check
  const monthKey = `${String(solarMonth).padStart(2, "0")}-${String(solarDay).padStart(2, "0")}`;
  let isHoliday = false;
  let holidayName = CAMBODIAN_HOLIDAYS_TABLE[monthKey];

  // Also check major Lunar holidays based on approximation
  if (lunarMonthName === "ពិសាខ" && lunarPhase === "កើត" && lunarDay === 15) {
    isHoliday = true;
    holidayName = "ពិធីបុណ្យវិសាខបូជា (Visak Bochea)";
  } else if (lunarMonthName === "ពិសាខ" && lunarPhase === "រោច" && lunarDay === 4) {
    isHoliday = true;
    holidayName = "ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល (Royal Plowing Ceremony)";
  } else if (lunarMonthName === "ភទ្របទ" && lunarPhase === "រោច" && (lunarDay >= 13 && lunarDay <= 15)) {
    isHoliday = true;
    holidayName = "ពិធីបុណ្យភ្ជុំបិណ្ឌ (Pchum Ben Festival)";
  } else if (lunarMonthName === "កត្តិក" && lunarPhase === "កើត" && (lunarDay >= 14 && lunarDay <= 15)) {
    isHoliday = true;
    holidayName = "ព្រះរាជពិធីបុណ្យអុំទូក បណ្តែតប្រទីប និងសំពះព្រះខែ (Water Festival)";
  }

  if (holidayName) {
    isHoliday = true;
  }

  const dayOfWeekKhmer = KHMER_DAYS_OF_WEEK[dayOfWeek];
  const dayOfWeekKhmerShort = KHMER_DAYS_SHORT[dayOfWeek];

  // Formatted administrative texts
  const solarDaySpelled = NUMBER_WORDS_KHMER[solarDay] || toKhmerNum(solarDay);
  const lunarDaySpelled = NUMBER_WORDS_KHMER[lunarDay] || toKhmerNum(lunarDay);
  const solarMonthKhmer = KHMER_SOLAR_MONTHS[solarMonth - 1];

  const fullAdminKhmerText = `ឆ្នាំ${spellOutKhmerYear(solarYear)} ខែ${solarMonthKhmer} ថ្ងៃទី${solarDaySpelled} ត្រូវនឹង${dayOfWeekKhmer} ${lunarDaySpelled}${lunarPhase} ខែ${lunarMonthName} ឆ្នាំ${animalYear} ${sak} ពុទ្ធសករាជ ${spellOutKhmerBuddhistYear(beYear)}`;

  const standardKhmerDateText = `${dayOfWeekKhmer} ${toKhmerNum(lunarDay)}${lunarPhase} ខែ${lunarMonthName} ឆ្នាំ${animalYear} ${sak} ព.ស.${toKhmerNum(beYear)} ត្រូវនឹងថ្ងៃទី${toKhmerNum(solarDay)} ខែ${solarMonthKhmer} ឆ្នាំ${toKhmerNum(solarYear)}`;

  const solarKhmerText = `ថ្ងៃទី${toKhmerNum(solarDay)} ខែ${solarMonthKhmer} ឆ្នាំ${toKhmerNum(solarYear)}`;

  return {
    solarDate: date,
    solarDay,
    solarMonth,
    solarYear,
    dayOfWeek,
    dayOfWeekKhmer,
    dayOfWeekKhmerShort,
    lunarDay,
    lunarPhase,
    lunarMonthName,
    lunarMonthIndex,
    animalYear,
    sak,
    beYear,
    isSila,
    silaDescription,
    isHoliday,
    holidayName,
    fullAdminKhmerText,
    standardKhmerDateText,
    solarKhmerText,
  };
}

/**
 * Returns an entire month grid (42 days including lead/trail padding)
 */
export function getMonthMatrix(year: number, month: number): KhmerDateDetail[] {
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const dayOfWeek = firstDayOfMonth.getDay(); // 0-6

  const days: KhmerDateDetail[] = [];

  // Start date with leading days from previous month
  const startDate = new Date(year, month - 1, 1 - dayOfWeek);

  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    days.push(getKhmerDateDetail(d));
  }

  return days;
}
