import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MeetingDoc, MeetingTable } from "@/types/meeting";
import { optimizePhotosPayload } from "@/lib/imageUtils";
import { toKhmerDigits, formatKhmerTimeString } from "@/lib/khmerDateUtils";

const COLLECTION_NAME = "meetings";

export const DEFAULT_SCHOOL_INFO = {
  schoolName: "សាលាបឋមសិក្សា រោគ",
  district: "រដ្ឋបាលស្រុកភ្នំស្រុក",
  academicYear: "២០២៥-២០២៦",
  meetingPlace: "សាលប្រជុំសាលាបឋមសិក្សា រោគ",
  meetingChair: "លោកស្រី សុខ សារើន (នាយិកាសាលា)",
  minuteTaker: "លោក អ៊ុន ប៊ុនទុង (គ្រូបង្រៀន/លេខាកត់ត្រា)",
};

export const INITIAL_DEFAULT_MEETINGS: Omit<MeetingDoc, "id" | "userId" | "createdAt" | "updatedAt">[] = [
  {
    schoolName: DEFAULT_SCHOOL_INFO.schoolName,
    district: DEFAULT_SCHOOL_INFO.district,
    academicYear: DEFAULT_SCHOOL_INFO.academicYear,
    meetingPlace: DEFAULT_SCHOOL_INFO.meetingPlace,
    meetingChair: DEFAULT_SCHOOL_INFO.meetingChair,
    minuteTaker: DEFAULT_SCHOOL_INFO.minuteTaker,
    meetingNumber: 1,
    title: "ការពិនិត្យ វាយតម្លៃគម្រោងចាក់ផ្លូវបេតុងចូលអគារទីចាត់ការ និងបណ្ណាល័យ",
    date: "ឆ្នាំពីរពាន់ម្ភៃប្រាំ ខែកក្កដា ថ្ងៃទីបី ត្រូវនឹងថ្ងៃព្រហស្បតិ៍ ៨កើត ខែអាសាឍ ឆ្នាំម្សាញ់ សប្តស័ក ពុទ្ធសករាជ ពីរពាន់ប្រាំរយហុកសិបប្រាំបួន",
    time: "វេលាម៉ោងប្រាំបី និងសូន្យនាទី(៨:០០) ព្រឹក",
    participants: "-(បញ្ជីវត្តមានជូនភ្ជាប់)",
    introParagraph: "ឆ្នាំពីរពាន់ម្ភៃប្រាំ ខែកក្កដា ថ្ងៃទីបី ត្រូវនឹងថ្ងៃព្រហស្បតិ៍ ៨កើត ខែអាសាឍ ឆ្នាំម្សាញ់ សប្តស័ក ពុទ្ធសករាជ ពីរពាន់ប្រាំរយហុកសិបប្រាំបួន វេលាម៉ោងប្រាំបី និងសូន្យនាទី(៨:០០) ព្រឹក នៅសាលាបឋមសិក្សា រោគ បានបើកកិច្ចប្រជុំមួយដើម្បី វាយតម្លៃការចាក់ផ្លូវបេតុងចូលអគារទីចាត់ការ និងបណ្ណាល័យ ដែលដឹកនាំដោយលោកស្រី សុខ សារើន (នាយិកាសាលា) ជាប្រធានអង្គប្រជុំ។",
    agenda: [
      "សំណេះសំណាល",
      "ចុះពិនិត្យការចាក់ផ្លូវបេតុងចូលអគារទីចាត់ការ និងបណ្ណាល័យ",
      "ពិភាក្សា វាយតម្លៃគុណភាព និងលក្ខណៈបច្ចេកទេស",
      "សេចក្តីសម្រេច និងទិសដៅបន្ត",
    ],
    decisions: [
      "ឯកភាពលើគុណភាពនៃការចាក់ផ្លូវបេតុងចូលអគារទីចាត់ការ និងបណ្ណាល័យតាមស្តង់ដារកំណត់",
      "បន្តការថែទាំ ស្រោចទឹក និងការពាររហូតដល់បេតុងរឹងមាំពេញលេញ",
      "រៀបចំផែនការសម្ពោធ និងដាក់ឱ្យប្រើប្រាស់ជាផ្លូវការជូនលោកគ្រូ អ្នកគ្រូ និងសិស្សានុសិស្ស",
    ],
    tables: [
      {
        id: "tbl_1",
        title: "តារាងវាយតម្លៃការដ្ឋាន និងការទទួលខុសត្រូវ",
        headers: ["ល.រ", "គោត្តនាម-នាម", "តួនាទី", "ភារកិច្ចទទួលខុសត្រូវ", "លទ្ធផល"],
        rows: [
          { cells: ["១", "លោកស្រី សុខ សារើន", "នាយិកាសាលា", "ដឹកនាំត្រួតពិនិត្យរួម និងសម្របសម្រួលគម្រោង", "សម្រេច ១០០%"] },
          { cells: ["២", "លោក អ៊ុន ប៊ុនទុង", "គ្រូបង្រៀន / លេខា", "កត់ត្រាកំណត់ហេតុ និងរៀបចំឯកសារបញ្ជី", "ពេញលេញ"] },
          { cells: ["៣", "លោក កែវ សម្បត្តិ", "ទទួលបន្ទុកបច្ចេកទេស", "តាមដានគុណភាពបេតុង និងបរិស្ថានជុំវិញ", "តាមស្តង់ដារ"] },
        ],
      },
    ],
    photoLayout: "grid-2",
    photos: [],
    styleConfig: {
      fontSize: 15,
      textAlign: "justify",
      color: "#0f172a",
    },
  },
  {
    schoolName: DEFAULT_SCHOOL_INFO.schoolName,
    district: DEFAULT_SCHOOL_INFO.district,
    academicYear: DEFAULT_SCHOOL_INFO.academicYear,
    meetingPlace: DEFAULT_SCHOOL_INFO.meetingPlace,
    meetingChair: DEFAULT_SCHOOL_INFO.meetingChair,
    minuteTaker: DEFAULT_SCHOOL_INFO.minuteTaker,
    meetingNumber: 2,
    title: "តាមដានវឌ្ឍនភាពការបង្រៀន និងវត្តមានសិស្ស",
    date: "ថ្ងៃទី១០ ខែវិច្ឆិកា ឆ្នាំ២០២៥",
    time: "ចាប់ពីម៉ោងពីរ និងសូន្យនាទី(២:០០) ដល់ម៉ោងប្រាំ និងសូន្យនាទី(៥:០០) រសៀល",
    participants: "-(បញ្ជីវត្តមានជូនភ្ជាប់)",
    introParagraph: "ថ្ងៃទី១០ ខែវិច្ឆិកា ឆ្នាំ២០២៥ វេលាម៉ោងពីរ និងសូន្យនាទី(២:០០) រសៀល នៅសាលាបឋមសិក្សា រោគ បានបើកកិច្ចប្រជុំមួយដើម្បីតាមដានវឌ្ឍនភាពការបង្រៀន និងវត្តមានសិស្ស ដែលដឹកនាំដោយលោកស្រី សុខ សារើន (នាយិកាសាលា) ជាប្រធានអង្គប្រជុំ។",
    agenda: [
      "ពិនិត្យវឌ្ឍនភាពការអនុវត្តផែនការសិក្សា",
      "ពិនិត្យវត្តមាន និងវិន័យរបស់សិស្ស",
      "ពិភាក្សាអំពីការបង្រៀន និងការរៀនរបស់សិស្ស",
      "ដោះស្រាយបញ្ហាសិស្សដែលមានការលំបាកក្នុងការសិក្សា",
    ],
    decisions: [
      "លោកគ្រូ អ្នកគ្រូត្រូវតាមដានវត្តមានសិស្សជាប្រចាំរៀងរាល់ព្រឹក-ល្ងាច",
      "រៀបចំការជួយបន្ថែមបំប៉នសម្រាប់សិស្សដែលរៀនយឺត",
      "ទាក់ទងមាតាបិតា ឬអាណាព្យាបាលរបស់សិស្សដែលអវត្តមានញឹកញាប់",
      "ពិនិត្យលទ្ធផលសិក្សារបស់សិស្សជារៀងរាល់ចុងខែ",
    ],
    tables: [
      {
        id: "tbl_2",
        title: "តារាងតាមដានស្ថានភាពវត្តមានសិស្សតាមកម្រិតថ្នាក់",
        headers: ["ល.រ", "កម្រិតថ្នាក់", "ចំនួនសិស្សសរុប", "សិស្សស្រី", "អវត្តមានមធ្យម", "ចំណាត់ការ"],
        rows: [
          { cells: ["១", "ថ្នាក់ទី១ ដល់ទី៣", "១២៥ នាក់", "៦២ នាក់", "២%", "អប់រំ និងជំរុញទៀងទាត់"] },
          { cells: ["២", "ថ្នាក់ទី៤ ដល់ទី៦", "១៤០ នាក់", "៦៨ នាក់", "៣%", "ទាក់ទងអាណាព្យាបាល"] },
        ],
      },
    ],
    photoLayout: "grid-2",
    photos: [],
    styleConfig: {
      fontSize: 15,
      textAlign: "justify",
      color: "#0f172a",
    },
  },
  {
    schoolName: DEFAULT_SCHOOL_INFO.schoolName,
    district: DEFAULT_SCHOOL_INFO.district,
    academicYear: DEFAULT_SCHOOL_INFO.academicYear,
    meetingPlace: DEFAULT_SCHOOL_INFO.meetingPlace,
    meetingChair: DEFAULT_SCHOOL_INFO.meetingChair,
    minuteTaker: DEFAULT_SCHOOL_INFO.minuteTaker,
    meetingNumber: 3,
    title: "ការអនុវត្តកម្មវិធី និងសម្ភារៈឧបទេសសិក្សា",
    date: "ថ្ងៃទី១៥ ខែធ្នូ ឆ្នាំ២០២៥",
    time: "ចាប់ពីម៉ោងប្រាំបី និងសូន្យនាទី(៨:០០) ដល់ម៉ោងដប់មួយ និងសូន្យនាទី(១១:០០) ព្រឹក",
    participants: "-(បញ្ជីវត្តមានជូនភ្ជាប់)",
    introParagraph: "ថ្ងៃទី១៥ ខែធ្នូ ឆ្នាំ២០២៥ វេលាម៉ោងប្រាំបី និងសូន្យនាទី(៨:០០) ព្រឹក នៅសាលាបឋមសិក្សា រោគ បានបើកកិច្ចប្រជុំមួយដើម្បីពិនិត្យការអនុវត្តកម្មវិធី និងសម្ភារៈឧបទេសសិក្សា ដែលដឹកនាំដោយលោកស្រី សុខ សារើន (នាយិកាសាលា) ជាប្រធានអង្គប្រជុំ។",
    agenda: [
      "ពិនិត្យការអនុវត្តកម្មវិធីសិក្សា",
      "ពិភាក្សាអំពីការប្រើប្រាស់សៀវភៅ និងសម្ភារៈសិក្សា",
      "រៀបចំការប្រឡង ឬការវាយតម្លៃសិស្ស",
      "ពិនិត្យគុណភាពនៃការបង្រៀន",
    ],
    decisions: [
      "លោកគ្រូ អ្នកគ្រូត្រូវបង្រៀនតាមកម្មវិធីសិក្សាដែលបានកំណត់ដោយក្រសួង",
      "ប្រើប្រាស់សម្ភារៈឧបទេស និងបណ្ណាល័យឱ្យមានប្រសិទ្ធភាពខ្ពស់",
      "រៀបចំការវាយតម្លៃឱ្យស្របតាមសមត្ថភាព និងស្តង់ដារសិស្ស",
      "ផ្លាស់ប្តូរបទពិសោធន៍បង្រៀនក្នុងក្រុមវិជ្ជាជីវៈ (PLC) ជារៀងរាល់សប្តាហ៍",
    ],
    tables: [],
    photoLayout: "grid-2",
    photos: [],
    styleConfig: {
      fontSize: 15,
      textAlign: "justify",
      color: "#0f172a",
    },
  },
  {
    schoolName: DEFAULT_SCHOOL_INFO.schoolName,
    district: DEFAULT_SCHOOL_INFO.district,
    academicYear: DEFAULT_SCHOOL_INFO.academicYear,
    meetingPlace: DEFAULT_SCHOOL_INFO.meetingPlace,
    meetingChair: DEFAULT_SCHOOL_INFO.meetingChair,
    minuteTaker: DEFAULT_SCHOOL_INFO.minuteTaker,
    meetingNumber: 4,
    title: "អនាម័យ បរិស្ថាន និងសុវត្ថិភាពសាលារៀន",
    date: "ថ្ងៃទី២០ ខែមករា ឆ្នាំ២០២៦",
    time: "ចាប់ពីម៉ោងពីរ និងសូន្យនាទី(២:០០) ដល់ម៉ោងបួន និងសាមសិបនាទី(៤:៣០) រសៀល",
    participants: "-(បញ្ជីវត្តមានជូនភ្ជាប់)",
    introParagraph: "ថ្ងៃទី២០ ខែមករា ឆ្នាំ២០២៦ វេលាម៉ោងពីរ និងសូន្យនាទី(២:០០) រសៀល នៅសាលាបឋមសិក្សា រោគ បានបើកកិច្ចប្រជុំមួយដើម្បីពិនិត្យស្ថានភាពអនាម័យ បរិស្ថាន និងសុវត្ថិភាពសាលារៀន ដែលដឹកនាំដោយលោកស្រី សុខ សារើន (នាយិកាសាលា) ជាប្រធានអង្គប្រជុំ។",
    agenda: [
      "ពិនិត្យស្ថានភាពអនាម័យ និងបរិស្ថានសាលា",
      "ពិភាក្សាអំពីសុវត្ថិភាពសិស្ស",
      "រៀបចំសកម្មភាពអប់រំសុខភាព និងអនាម័យ",
      "ពិនិត្យការថែទាំបរិក្ខារសាលា",
    ],
    decisions: [
      "រៀបចំវេនសម្អាតថ្នាក់រៀន បង្គន់អនាម័យ និងបរិវេណសាលាជាប្រចាំ",
      "ដាក់ធុងសំរាមបែងចែកប្រភេទតាមទីតាំងសមស្រប",
      "អប់រំសិស្សអំពីការលាងដៃជាមួយសាប៊ូ និងការរក្សាអនាម័យខ្លួនប្រាណ",
      "ជួសជុលតុ ទ្វារ បង្អួច និងសម្ភារៈសាលាដែលខូចខាតភ្លាមៗ",
    ],
    tables: [
      {
        id: "tbl_4",
        title: "តារាងកាលវិភាគអនាម័យ និងការងារថែទាំបរិស្ថាន",
        headers: ["ថ្ងៃ", "ថ្នាក់ទទួលបន្ទុក", "ទីតាំងសម្អាត", "គ្រូត្រួតពិនិត្យ"],
        rows: [
          { cells: ["ច័ន្ទ - អង្គារ", "ថ្នាក់ទី ៤-៥", "បរិវេណសួនផ្កា & ទីធ្លាមុខសាលា", "លោក កែវ សម្បត្តិ"] },
          { cells: ["ពុធ - ព្រហស្បតិ៍", "ថ្នាក់ទី ៦", "បរិវេណខាងក្រោយ & បង្គន់អនាម័យ", "អ្នកគ្រូ ចាន់ ណារី"] },
          { cells: ["សុក្រ - សៅរ៍", "ថ្នាក់ទី ១-២-៣", "ក្នុងថ្នាក់រៀន & របៀងមុខថ្នាក់", "លោក អ៊ុន ប៊ុនទុង"] },
        ],
      },
    ],
    photoLayout: "grid-2",
    photos: [],
    styleConfig: {
      fontSize: 15,
      textAlign: "justify",
      color: "#0f172a",
    },
  },
  {
    schoolName: DEFAULT_SCHOOL_INFO.schoolName,
    district: DEFAULT_SCHOOL_INFO.district,
    academicYear: DEFAULT_SCHOOL_INFO.academicYear,
    meetingPlace: DEFAULT_SCHOOL_INFO.meetingPlace,
    meetingChair: DEFAULT_SCHOOL_INFO.meetingChair,
    minuteTaker: DEFAULT_SCHOOL_INFO.minuteTaker,
    meetingNumber: 5,
    title: "កិច្ចសហការជាមួយមាតាបិតា និងសហគមន៍",
    date: "ថ្ងៃទី១៨ ខែកុម្ភៈ ឆ្នាំ២០២៦",
    time: "ចាប់ពីម៉ោងប្រាំបី និងសាមសិបនាទី(៨:៣០) ដល់ម៉ោងដប់មួយ និងសាមសិបនាទី(១១:៣០) ព្រឹក",
    participants: "-(បញ្ជីវត្តមានជូនភ្ជាប់)",
    introParagraph: "ថ្ងៃទី១៨ ខែកុម្ភៈ ឆ្នាំ២០២៦ វេលាម៉ោងប្រាំបី និងសាមសិបនាទី(៨:៣០) ព្រឹក នៅសាលាបឋមសិក្សា រោគ បានបើកកិច្ចប្រជុំមួយដើម្បីពង្រឹងកិច្ចសហការជាមួយមាតាបិតា និងសហគមន៍ ដែលដឹកនាំដោយលោកស្រី សុខ សារើន (នាយិកាសាលា) ជាប្រធានអង្គប្រជុំ។",
    agenda: [
      "ពង្រឹងកិច្ចសហការរវាងសាលា និងមាតាបិតា",
      "រៀបចំកិច្ចប្រជុំជាមួយមាតាបិតា និងអាណាព្យាបាល",
      "ពិភាក្សាអំពីការចូលរួមរបស់សហគមន៍",
      "រៀបចំសកម្មភាពសង្គម និងសប្បុរសធម៌",
    ],
    decisions: [
      "រៀបចំកិច្ចប្រជុំមាតាបិតាយ៉ាងហោចណាស់មួយដងក្នុងមួយឆមាស",
      "ផ្តល់ព័ត៌មានអំពីវឌ្ឍនភាព អាកប្បកិរិយា និងលទ្ធផលសិក្សារបស់សិស្ស",
      "លើកទឹកចិត្តមាតាបិតាឱ្យចូលរួមគាំទ្រការសិក្សារបស់កូននៅផ្ទះ",
      "ពង្រឹងទំនាក់ទំនងរវាងសាលា សហគមន៍ និងអាជ្ញាធរឃុំ/ភូមិ",
    ],
    tables: [],
    photoLayout: "grid-2",
    photos: [],
    styleConfig: {
      fontSize: 15,
      textAlign: "justify",
      color: "#0f172a",
    },
  },
  {
    schoolName: DEFAULT_SCHOOL_INFO.schoolName,
    district: DEFAULT_SCHOOL_INFO.district,
    academicYear: DEFAULT_SCHOOL_INFO.academicYear,
    meetingPlace: DEFAULT_SCHOOL_INFO.meetingPlace,
    meetingChair: DEFAULT_SCHOOL_INFO.meetingChair,
    minuteTaker: DEFAULT_SCHOOL_INFO.minuteTaker,
    meetingNumber: 6,
    title: "វាយតម្លៃការបង្រៀន និងលទ្ធផលសិក្សា",
    date: "ថ្ងៃទី២៥ ខែមីនា ឆ្នាំ២០២៦",
    time: "ចាប់ពីម៉ោងពីរ និងសូន្យនាទី(២:០០) ដល់ម៉ោងប្រាំ និងសូន្យនាទី(៥:០០) រសៀល",
    participants: "-(បញ្ជីវត្តមានជូនភ្ជាប់)",
    introParagraph: "ថ្ងៃទី២៥ ខែមីនា ឆ្នាំ២០២៦ វេលាម៉ោងពីរ និងសូន្យនាទី(២:០០) រសៀល នៅសាលាបឋមសិក្សា រោគ បានបើកកិច្ចប្រជុំមួយដើម្បីវាយតម្លៃការបង្រៀន និងលទ្ធផលសិក្សា ដែលដឹកនាំដោយលោកស្រី សុខ សារើន (នាយិកាសាលា) ជាប្រធានអង្គប្រជុំ។",
    agenda: [
      "ពិនិត្យលទ្ធផលសិក្សារបស់សិស្សឆមាសទី១",
      "វាយតម្លៃការអនុវត្តការងាររបស់លោកគ្រូ អ្នកគ្រូ",
      "កំណត់វិធានការកែលម្អលទ្ធផលសិក្សា",
      "រៀបចំការប្រឡង និងការបូកសរុបលទ្ធផល",
    ],
    decisions: [
      "ប្រមូល និងវិភាគលទ្ធផលសិក្សារបស់សិស្សតាមកម្រិតថ្នាក់",
      "កំណត់មូលហេតុនៃការធ្លាក់ចុះលទ្ធផលសិក្សារបស់សិស្សមួយចំនួន",
      "រៀបចំផែនការបង្រៀនបន្ថែម និងសកម្មភាពជួយសិស្សរៀនខ្សោយ",
      "លោកគ្រូ អ្នកគ្រូត្រូវរៀបចំរបាយការណ៍ការងារ និងបញ្ជីពិន្ទុឱ្យបានត្រឹមត្រូវ",
    ],
    tables: [
      {
        id: "tbl_6",
        title: "តារាងលទ្ធផលសិក្សាឆមាសទី១ សង្ខេប",
        headers: ["កម្រិតថ្នាក់", "ចំនួនសិស្ស", "និទ្ទេសល្អ (A-B)", "មធ្យម (C-D)", "ត្រូវជួយបំប៉ន (E-F)"],
        rows: [
          { cells: ["ថ្នាក់ទី១ - ទី៣", "១២៥ នាក់", "៤៨ នាក់ (៣៨%)", "៦២ នាក់ (៥០%)", "១៥ នាក់ (១២%)"] },
          { cells: ["ថ្នាក់ទី៤ - ទី៦", "១៤០ នាក់", "៥២ នាក់ (៣៧%)", "៧៣ នាក់ (៥២%)", "១៥ នាក់ (១១%)"] },
        ],
      },
    ],
    photoLayout: "grid-2",
    photos: [],
    styleConfig: {
      fontSize: 15,
      textAlign: "justify",
      color: "#0f172a",
    },
  },
  {
    schoolName: DEFAULT_SCHOOL_INFO.schoolName,
    district: DEFAULT_SCHOOL_INFO.district,
    academicYear: DEFAULT_SCHOOL_INFO.academicYear,
    meetingPlace: DEFAULT_SCHOOL_INFO.meetingPlace,
    meetingChair: DEFAULT_SCHOOL_INFO.meetingChair,
    minuteTaker: DEFAULT_SCHOOL_INFO.minuteTaker,
    meetingNumber: 7,
    title: "បូកសរុបការងារប្រចាំឆ្នាំសិក្សា",
    date: "ថ្ងៃទី១៥ ខែកក្កដា ឆ្នាំ២០២៦",
    time: "ចាប់ពីម៉ោងប្រាំបី និងសូន្យនាទី(៨:០០) ដល់ម៉ោងដប់មួយ និងសាមសិបនាទី(១១:៣០) ព្រឹក",
    participants: "-(បញ្ជីវត្តមានជូនភ្ជាប់)",
    introParagraph: "ថ្ងៃទី១៥ ខែកក្កដា ឆ្នាំ២០២៦ វេលាម៉ោងប្រាំបី និងសូន្យនាទី(៨:០០) ព្រឹក នៅសាលាបឋមសិក្សា រោគ បានបើកកិច្ចប្រជុំមួយដើម្បីបូកសរុបការងារប្រចាំឆ្នាំសិក្សា ដែលដឹកនាំដោយលោកស្រី សុខ សារើន (នាយិកាសាលា) ជាប្រធានអង្គប្រជុំ។",
    agenda: [
      "បូកសរុបលទ្ធផលការងារប្រចាំឆ្នាំសិក្សា២០២៥-២០២៦",
      "ពិនិត្យសមិទ្ធផល បញ្ហាប្រឈម និងចំណុចខ្វះខាត",
      "រៀបចំផែនការកែលម្អសម្រាប់ឆ្នាំសិក្សាបន្ទាប់",
      "ផ្តល់អនុសាសន៍ និងទិសដៅការងារបន្ត",
    ],
    decisions: [
      "អនុម័តរបាយការណ៍បូកសរុបការងារប្រចាំឆ្នាំសិក្សា២០២៥-២០២៦",
      "កត់ត្រាសមិទ្ធផល និងបញ្ហាប្រឈមសម្រាប់ធ្វើជាមូលដ្ឋានកែលម្អ",
      "រៀបចំផែនការសកម្មភាពសម្រាប់ឆ្នាំសិក្សាបន្ទាប់",
      "បន្តពង្រឹងគុណភាពបង្រៀន វិន័យសិស្ស អនាម័យ និងកិច្ចសហការជាមួយមាតាបិតា",
    ],
    tables: [
      {
        id: "tbl_7",
        title: "តារាងលទ្ធផលរួមបញ្ចប់ឆ្នាំសិក្សា ២០២៥-២០២៦",
        headers: ["ល.រ", "ពិពណ៌នាសូចនាករ", "ផែនការគ្រោង", "លទ្ធផលសម្រេច", "អត្រាជោគជ័យ"],
        rows: [
          { cells: ["១", "អត្រាសិស្សជាប់ឡើងថ្នាក់", "៩២%", "៩៥.៥%", "លើសផែនការ"] },
          { cells: ["២", "អត្រាសិស្សបោះបង់ការសិក្សា", "< ៣%", "១.២%", "ទាបជាងកម្រិតកំណត់"] },
          { cells: ["៣", "ការបង្រៀនគរុកោសល្យថ្មី (PLC)", "២៤ ដង/ឆ្នាំ", "២៨ ដង/ឆ្នាំ", "សម្រេចបានល្អ"] },
        ],
      },
    ],
    photoLayout: "grid-2",
    photos: [],
    styleConfig: {
      fontSize: 15,
      textAlign: "justify",
      color: "#0f172a",
    },
  },
];

// Helper to ensure tables are properly structured for Firestore without nested arrays
export const sanitizeTablesForFirestore = (tables?: any[]): MeetingTable[] => {
  if (!tables || !Array.isArray(tables)) return [];
  return tables.map((tbl, tIdx) => {
    const rawRows = tbl.rows || [];
    const formattedRows: { id?: string; cells: string[] }[] = rawRows.map((row: any, rIdx: number) => {
      if (Array.isArray(row)) {
        return {
          id: `row_${rIdx + 1}`,
          cells: row.map((cell) => (cell !== undefined && cell !== null ? toKhmerDigits(String(cell)) : "")),
        };
      }
      if (row && typeof row === "object" && Array.isArray(row.cells)) {
        return {
          id: row.id || `row_${rIdx + 1}`,
          cells: row.cells.map((cell: any) => (cell !== undefined && cell !== null ? toKhmerDigits(String(cell)) : "")),
        };
      }
      return { id: `row_${rIdx + 1}`, cells: [] };
    });

    return {
      id: tbl.id || `tbl_${tIdx + 1}`,
      title: toKhmerDigits(String(tbl.title || "")),
      headers: Array.isArray(tbl.headers) ? tbl.headers.map((h: any) => toKhmerDigits(String(h || ""))) : [],
      rows: formattedRows,
    };
  });
};

// Helper to normalize MeetingDoc when read from Firestore
export const normalizeMeetingDoc = (docId: string, data: any): MeetingDoc => {
  const tables = sanitizeTablesForFirestore(data.tables);
  return {
    ...data,
    id: docId,
    meetingNumber: typeof data.meetingNumber === "number" ? data.meetingNumber : 1,
    title: toKhmerDigits(data.title || ""),
    date: toKhmerDigits(data.date || ""),
    time: formatKhmerTimeString(data.time || ""),
    schoolName: toKhmerDigits(data.schoolName || ""),
    district: toKhmerDigits(data.district || ""),
    academicYear: toKhmerDigits(data.academicYear || ""),
    meetingPlace: toKhmerDigits(data.meetingPlace || ""),
    meetingChair: toKhmerDigits(data.meetingChair || ""),
    minuteTaker: toKhmerDigits(data.minuteTaker || ""),
    introParagraph: data.introParagraph ? toKhmerDigits(data.introParagraph) : "",
    tables,
    agenda: Array.isArray(data.agenda) ? data.agenda.map((item: any) => toKhmerDigits(String(item || ""))) : [],
    decisions: Array.isArray(data.decisions) ? data.decisions.map((item: any) => toKhmerDigits(String(item || ""))) : [],
    photos: Array.isArray(data.photos) ? data.photos : [],
    attendees: Array.isArray(data.attendees) ? data.attendees : [],
  };
};

// Subscribe to real-time changes from Firestore
export const subscribeMeetings = (
  onData: (meetings: MeetingDoc[]) => void,
  onError?: (err: any) => void
) => {
  const colRef = collection(db, COLLECTION_NAME);
  const q = query(colRef, orderBy("meetingNumber", "asc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: MeetingDoc[] = snapshot.docs.map((d) =>
        normalizeMeetingDoc(d.id, d.data())
      );
      onData(items);
    },
    (err) => {
      console.error("Firestore subscribe error:", err);
      if (onError) onError(err);
    }
  );
};

// Seed default meetings if Firestore collection is empty
export const seedDefaultMeetingsIfEmpty = async (userId: string, userEmail?: string) => {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snap = await getDocs(colRef);

    if (snap.empty) {
      console.log("Seeding default 7 meeting records into Firestore...");
      for (const item of INITIAL_DEFAULT_MEETINGS) {
        const docRef = doc(colRef, `meeting_${item.meetingNumber}`);
        await setDoc(docRef, {
          ...item,
          tables: sanitizeTablesForFirestore(item.tables),
          userId: userId || "system_default",
          userEmail: userEmail || "admin@rorkschool.edu.kh",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }
  } catch (err) {
    console.error("Failed to seed default meetings:", err);
  }
};

// Force reset / restore 7 initial default meetings
export const restoreDefaultMeetings = async (userId: string, userEmail?: string) => {
  const colRef = collection(db, COLLECTION_NAME);
  for (const item of INITIAL_DEFAULT_MEETINGS) {
    const docRef = doc(colRef, `meeting_${item.meetingNumber}`);
    await setDoc(docRef, {
      ...item,
      tables: sanitizeTablesForFirestore(item.tables),
      userId: userId || "system_default",
      userEmail: userEmail || "admin@rorkschool.edu.kh",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
};

// Add a new custom meeting
export const addMeeting = async (
  meetingData: Omit<MeetingDoc, "id" | "createdAt" | "updatedAt">
) => {
  const colRef = collection(db, COLLECTION_NAME);
  const now = Date.now();
  let photos = meetingData.photos || [];
  if (photos.length > 0) {
    photos = await optimizePhotosPayload(photos, 450000);
  }
  const payload = {
    ...meetingData,
    time: formatKhmerTimeString(meetingData.time),
    date: toKhmerDigits(meetingData.date),
    tables: sanitizeTablesForFirestore(meetingData.tables),
    photos,
    createdAt: now,
    updatedAt: now,
  };
  const docRef = await addDoc(colRef, payload);
  return docRef.id;
};

// Update an existing meeting
export const updateMeeting = async (
  id: string,
  data: Partial<Omit<MeetingDoc, "id" | "createdAt">>
) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const updatePayload: any = {
    ...data,
    updatedAt: Date.now(),
  };

  if (data.time !== undefined) {
    updatePayload.time = formatKhmerTimeString(data.time);
  }

  if (data.date !== undefined) {
    updatePayload.date = toKhmerDigits(data.date);
  }

  if (data.tables !== undefined) {
    updatePayload.tables = sanitizeTablesForFirestore(data.tables);
  }

  if (data.photos && data.photos.length > 0) {
    updatePayload.photos = await optimizePhotosPayload(data.photos, 450000);
  }

  await updateDoc(docRef, updatePayload);
};

// Delete a meeting
export const deleteMeeting = async (id: string) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};
