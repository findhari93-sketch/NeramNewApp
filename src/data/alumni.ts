// Sample alumni data (2016-2025). Replace/extend with real records from DB later.
// Keep fields flat for easy table rendering and future Supabase mapping.
export interface AlumniRecord {
  id: string;
  name: string;
  year: number; // Passing / result year
  exam: string; // NATA | JEE B.Arch | Both
  nataScore?: number;
  nataRankIndia?: number;
  jeeRankIndia?: number;
  college: string;
  collegeType: string; // NIT | CEPT | Anna University | Private | Other
  city: string; // College city
  studentCity: string; // Student hometown
  achievements: string[]; // Highlight badges
  nitSelected?: boolean;
  ceptSelected?: boolean;
  annaUnivSelected?: boolean;
  linkedin?: string;
  instagram?: string;
  testimonial?: string;
}

export const alumniRecords: AlumniRecord[] = [
  {
    id: "jee-air1-2024",
    name: "Aditya Narayanan",
    year: 2024,
    exam: "JEE B.Arch",
    jeeRankIndia: 1,
    college: "NIT Trichy (Expected)",
    collegeType: "NIT",
    city: "Tiruchirappalli",
    studentCity: "Pudukkottai",
    achievements: ["All India Rank 1 JEE B.Arch 2024"],
    nitSelected: true,
    linkedin: "https://www.linkedin.com/in/aditya-narayanan",
    instagram: "https://instagram.com/aditya.arch",
    testimonial:
      "Neram's focussed studio sessions and exam strategy modules gave me absolute clarity. The mentors never let me lose momentum.",
  },
  {
    id: "nata-topper-2020",
    name: "Priya S",
    year: 2020,
    exam: "NATA",
    nataScore: 187,
    nataRankIndia: 1,
    college: "CEPT University",
    collegeType: "CEPT",
    city: "Ahmedabad",
    studentCity: "Madurai",
    achievements: ["India Rank 1 NATA 2020", "Score 187"],
    ceptSelected: true,
    linkedin: "https://www.linkedin.com/in/priya-design",
    instagram: "https://instagram.com/priya.sketch",
    testimonial:
      "The drawing drills and timed mock tests at Neram transformed my confidence. I still use the visualisation techniques daily.",
  },
  {
    id: "nit-select-2023-01",
    name: "Rahul Kumar",
    year: 2023,
    exam: "Both",
    nataScore: 168,
    jeeRankIndia: 53,
    college: "NIT Calicut",
    collegeType: "NIT",
    city: "Calicut",
    studentCity: "Coimbatore",
    achievements: ["NIT Selection", "Dual Exam Qualified"],
    nitSelected: true,
    linkedin: "https://www.linkedin.com/in/rahul-kumar-arch",
    testimonial:
      "Neram's structured weekly review of mistakes was the secret weapon. Faculty feedback was precise and actionable.",
  },
  {
    id: "anna-univ-2022-01",
    name: "Shreya V",
    year: 2022,
    exam: "NATA",
    nataScore: 154,
    college: "Anna University (School of Architecture & Planning)",
    collegeType: "Anna University",
    city: "Chennai",
    studentCity: "Salem",
    achievements: ["Anna University Selection"],
    annaUnivSelected: true,
    instagram: "https://instagram.com/shreya.draws",
    testimonial:
      "Personalised sketch critiques accelerated my improvement. The exam temperament coaching was invaluable.",
  },
  {
    id: "cept-2021-01",
    name: "Arjun R",
    year: 2021,
    exam: "NATA",
    nataScore: 165,
    college: "CEPT University",
    collegeType: "CEPT",
    city: "Ahmedabad",
    studentCity: "Chennai",
    achievements: ["CEPT Selection"],
    ceptSelected: true,
    linkedin: "https://www.linkedin.com/in/arjun-r",
    testimonial:
      "Neram guided me beyond exam pattern—into thinking like a designer. That mindset helped me crack CEPT.",
  },
  {
    id: "jee-2024-mentor-ref",
    name: "Divya R",
    year: 2024,
    exam: "JEE B.Arch",
    jeeRankIndia: 112,
    college: "NIT Jaipur (Expected)",
    collegeType: "NIT",
    city: "Jaipur",
    studentCity: "Pudukkottai",
    achievements: ["Consistent Top 200 JEE Mock Rank"],
    nitSelected: true,
    instagram: "https://instagram.com/divya.design",
    testimonial:
      "Neram's mock ecosystem felt like the real exam pressure. I learned calibration, not just syllabus.",
  },
  {
    id: "nata-2019-portfolio",
    name: "Vignesh K",
    year: 2019,
    exam: "NATA",
    nataScore: 149,
    college: "Private Architecture College",
    collegeType: "Private",
    city: "Bangalore",
    studentCity: "Tirunelveli",
    achievements: ["Portfolio Excellence"],
    instagram: "https://instagram.com/vignesh.sketch",
    testimonial:
      "Every critique session pushed me to refine strokes and perspective. Foundation discipline came from Neram.",
  },
  {
    id: "jee-2018-early",
    name: "Harish M",
    year: 2018,
    exam: "JEE B.Arch",
    jeeRankIndia: 640,
    college: "NIT Surathkal",
    collegeType: "NIT",
    city: "Mangalore",
    studentCity: "Chennai",
    achievements: ["Early JEE Architecture Adopter"],
    nitSelected: true,
    testimonial:
      "Back then resources were scarce—Neram aggregated and simplified everything into a clear weekly roadmap.",
  },
];

// Aggregated stats helpers
export function getAlumniStats(records: AlumniRecord[]) {
  const nit = records.filter((r) => r.nitSelected).length;
  const cept = records.filter((r) => r.ceptSelected).length;
  const anna = records.filter((r) => r.annaUnivSelected).length;
  const nataTopScores = records.filter((r) => (r.nataScore ?? 0) >= 180).length;
  const jeeTopRanks = records.filter(
    (r) => (r.jeeRankIndia ?? 9999) <= 200
  ).length;
  return { nit, cept, anna, nataTopScores, jeeTopRanks, total: records.length };
}
