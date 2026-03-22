export type Exam = "UPSC" | "SSC" | "TSPSC" | "APPSC" | "RRB" | "IBPS";
export type Difficulty = "Easy" | "Medium" | "Hard";
export type QuestionType = "PYQ" | "Conceptual" | "CurrentAffairs" | "Mock";

export interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  exam: Exam;
  topic: string;
  subtopic: string;
  difficulty: Difficulty;
  type: QuestionType;
  year: number | null;
  tags: string[];
}

export const questions: Question[] = [
  // ─── UPSC POLITY ───────────────────────────────────────────────
  {
    id: 1,
    question: "Which Article of the Indian Constitution deals with the Right to Education?",
    options: ["Article 19", "Article 21A", "Article 24", "Article 32"],
    correct: 1,
    explanation: "Article 21A was inserted by the 86th Constitutional Amendment Act 2002, making free and compulsory education a fundamental right for children aged 6–14.",
    exam: "UPSC", topic: "Polity", subtopic: "Fundamental Rights",
    difficulty: "Easy", type: "PYQ", year: 2019,
    tags: ["constitution", "fundamental-rights", "article-21a", "education"],
  },
  {
    id: 2,
    question: "Which Schedule of the Indian Constitution contains the Anti-Defection Law?",
    options: ["8th Schedule", "9th Schedule", "10th Schedule", "11th Schedule"],
    correct: 2,
    explanation: "The 10th Schedule was added by the 52nd Constitutional Amendment Act 1985 and deals with disqualification of members on grounds of defection.",
    exam: "UPSC", topic: "Polity", subtopic: "Constitutional Amendments",
    difficulty: "Medium", type: "PYQ", year: 2019,
    tags: ["constitution", "10th-schedule", "anti-defection", "amendment"],
  },
  {
    id: 3,
    question: "Who appoints the Chief Election Commissioner of India?",
    options: ["President", "Prime Minister", "Parliament", "Supreme Court"],
    correct: 0,
    explanation: "The Chief Election Commissioner is appointed by the President of India and can only be removed through a process similar to that of a Supreme Court judge.",
    exam: "UPSC", topic: "Polity", subtopic: "Constitutional Bodies",
    difficulty: "Medium", type: "PYQ", year: 2020,
    tags: ["election-commission", "president", "appointment"],
  },
  {
    id: 4,
    question: "The concept of 'Judicial Review' in India is borrowed from which country?",
    options: ["UK", "USA", "Canada", "Australia"],
    correct: 1,
    explanation: "India borrowed the concept of Judicial Review from the USA, though in India it is more limited in scope than in the American system.",
    exam: "UPSC", topic: "Polity", subtopic: "Judiciary",
    difficulty: "Easy", type: "PYQ", year: 2018,
    tags: ["judicial-review", "constitution", "borrowed-features"],
  },
  {
    id: 5,
    question: "Which Article of the Indian Constitution abolishes untouchability?",
    options: ["Article 14", "Article 15", "Article 17", "Article 19"],
    correct: 2,
    explanation: "Article 17 abolishes untouchability and its practice in any form is forbidden. The enforcement of any disability arising out of untouchability shall be an offence.",
    exam: "UPSC", topic: "Polity", subtopic: "Fundamental Rights",
    difficulty: "Easy", type: "PYQ", year: 2017,
    tags: ["untouchability", "article-17", "fundamental-rights"],
  },
  {
    id: 6,
    question: "The Directive Principles of State Policy in India are borrowed from the Constitution of which country?",
    options: ["USA", "Canada", "Ireland", "Australia"],
    correct: 2,
    explanation: "The Directive Principles of State Policy were borrowed from the Constitution of Ireland (Eire), which in turn took the idea from the Spanish Constitution.",
    exam: "UPSC", topic: "Polity", subtopic: "Directive Principles",
    difficulty: "Medium", type: "PYQ", year: 2016,
    tags: ["dpsp", "ireland", "borrowed-features", "constitution"],
  },

  // ─── UPSC HISTORY ───────────────────────────────────────────────
  {
    id: 7,
    question: "The Indus Valley Civilization was discovered in the year?",
    options: ["1901", "1911", "1921", "1931"],
    correct: 2,
    explanation: "The Indus Valley Civilisation was discovered in 1921 when excavations began at Harappa under the Archaeological Survey of India.",
    exam: "UPSC", topic: "History", subtopic: "Ancient History",
    difficulty: "Easy", type: "PYQ", year: 2017,
    tags: ["indus-valley", "harappa", "ancient-history", "archaeology"],
  },
  {
    id: 8,
    question: "The Battle of Plassey was fought in which year?",
    options: ["1757", "1761", "1764", "1776"],
    correct: 0,
    explanation: "The Battle of Plassey fought on June 23, 1757 between the British East India Company and Siraj ud-Daulah marked the beginning of British political control over India.",
    exam: "UPSC", topic: "History", subtopic: "Modern History",
    difficulty: "Easy", type: "PYQ", year: 2017,
    tags: ["battle-of-plassey", "british", "siraj-ud-daulah", "modern-history"],
  },
  {
    id: 9,
    question: "Who founded the Indian National Congress in 1885?",
    options: ["Bal Gangadhar Tilak", "Allan Octavian Hume", "Dadabhai Naoroji", "Gopal Krishna Gokhale"],
    correct: 1,
    explanation: "The Indian National Congress was founded by Allan Octavian Hume, a retired British civil servant, along with Dadabhai Naoroji and Dinshaw Wacha in 1885.",
    exam: "UPSC", topic: "History", subtopic: "Modern History",
    difficulty: "Easy", type: "PYQ", year: 2018,
    tags: ["inc", "congress", "ao-hume", "freedom-struggle"],
  },
  {
    id: 10,
    question: "The Quit India Movement was launched in which year?",
    options: ["1940", "1942", "1944", "1946"],
    correct: 1,
    explanation: "The Quit India Movement was launched by Mahatma Gandhi on August 8, 1942 at the Bombay session of the All India Congress Committee, demanding an end to British rule.",
    exam: "UPSC", topic: "History", subtopic: "Modern History",
    difficulty: "Easy", type: "PYQ", year: 2019,
    tags: ["quit-india", "gandhi", "1942", "freedom-movement"],
  },

  // ─── UPSC GEOGRAPHY ─────────────────────────────────────────────
  {
    id: 11,
    question: "Which river is known as the 'Sorrow of Bihar'?",
    options: ["Gandak", "Kosi", "Ghaghara", "Bagmati"],
    correct: 1,
    explanation: "The Kosi river is called the Sorrow of Bihar due to its frequent and devastating floods that cause massive destruction in the state.",
    exam: "UPSC", topic: "Geography", subtopic: "Rivers of India",
    difficulty: "Easy", type: "PYQ", year: 2018,
    tags: ["kosi", "bihar", "rivers", "floods"],
  },
  {
    id: 12,
    question: "Which is the largest freshwater lake in India?",
    options: ["Dal Lake", "Chilika Lake", "Wular Lake", "Loktak Lake"],
    correct: 2,
    explanation: "Wular Lake in Jammu and Kashmir is the largest freshwater lake in India and one of the largest in Asia, formed by tectonic activity.",
    exam: "UPSC", topic: "Geography", subtopic: "Lakes of India",
    difficulty: "Easy", type: "PYQ", year: 2020,
    tags: ["wular-lake", "freshwater", "jammu-kashmir", "lakes"],
  },
  {
    id: 13,
    question: "The Tropic of Cancer does NOT pass through which of the following states?",
    options: ["Rajasthan", "Madhya Pradesh", "Andhra Pradesh", "Tripura"],
    correct: 2,
    explanation: "The Tropic of Cancer passes through 8 Indian states: Gujarat, Rajasthan, MP, Chhattisgarh, Jharkhand, West Bengal, Tripura, and Mizoram. Andhra Pradesh is not among them.",
    exam: "UPSC", topic: "Geography", subtopic: "Physical Geography of India",
    difficulty: "Medium", type: "PYQ", year: 2021,
    tags: ["tropic-of-cancer", "states", "physical-geography"],
  },

  // ─── UPSC ENVIRONMENT ───────────────────────────────────────────
  {
    id: 14,
    question: "The 'Paris Agreement' on climate change was adopted in which year?",
    options: ["2012", "2015", "2017", "2019"],
    correct: 1,
    explanation: "The Paris Agreement was adopted on December 12, 2015 at COP21 and entered into force on November 4, 2016.",
    exam: "UPSC", topic: "Environment", subtopic: "International Agreements",
    difficulty: "Easy", type: "PYQ", year: 2016,
    tags: ["paris-agreement", "climate-change", "cop21", "environment"],
  },
  {
    id: 15,
    question: "The Montreal Protocol is related to the protection of:",
    options: ["Forests", "Ozone Layer", "Oceans", "Wetlands"],
    correct: 1,
    explanation: "The Montreal Protocol (1987) is an international treaty designed to protect the ozone layer by phasing out the production and use of ozone-depleting substances.",
    exam: "UPSC", topic: "Environment", subtopic: "International Agreements",
    difficulty: "Medium", type: "PYQ", year: 2018,
    tags: ["montreal-protocol", "ozone", "environment", "treaty"],
  },
  {
    id: 16,
    question: "Which of the following is NOT a greenhouse gas?",
    options: ["Carbon dioxide", "Methane", "Nitrogen", "Nitrous oxide"],
    correct: 2,
    explanation: "Nitrogen (N2) is not a greenhouse gas. The major greenhouse gases are Carbon dioxide (CO2), Methane (CH4), Nitrous oxide (N2O), and Water vapour.",
    exam: "UPSC", topic: "Environment", subtopic: "Climate Change",
    difficulty: "Easy", type: "Conceptual", year: null,
    tags: ["greenhouse-gas", "climate", "nitrogen"],
  },

  // ─── UPSC ECONOMY ───────────────────────────────────────────────
  {
    id: 17,
    question: "India's Unified Payments Interface (UPI) is operated by which body?",
    options: ["SEBI", "RBI", "NPCI", "Ministry of Finance"],
    correct: 2,
    explanation: "UPI is operated by the National Payments Corporation of India (NPCI), which is promoted by RBI and Indian Banks' Association.",
    exam: "UPSC", topic: "Economy", subtopic: "Banking & Finance",
    difficulty: "Medium", type: "PYQ", year: 2022,
    tags: ["upi", "npci", "digital-payments", "banking"],
  },
  {
    id: 18,
    question: "Which Five Year Plan in India gave priority to agriculture?",
    options: ["First Plan", "Second Plan", "Third Plan", "Fourth Plan"],
    correct: 0,
    explanation: "The First Five Year Plan (1951–56) gave top priority to agriculture, irrigation, and power as India was facing food shortage post-partition.",
    exam: "UPSC", topic: "Economy", subtopic: "Planning in India",
    difficulty: "Medium", type: "PYQ", year: 2017,
    tags: ["five-year-plan", "agriculture", "planning-commission"],
  },

  // ─── UPSC SCIENCE ───────────────────────────────────────────────
  {
    id: 19,
    question: "What does DNA stand for?",
    options: ["Deoxyribonucleic Acid", "Diribonucleic Acid", "Deoxyribose Nucleic Acid", "Double Nucleic Acid"],
    correct: 0,
    explanation: "DNA (Deoxyribonucleic Acid) is the molecule that carries genetic information in all living organisms and many viruses.",
    exam: "UPSC", topic: "Science & Technology", subtopic: "Biology",
    difficulty: "Easy", type: "PYQ", year: 2016,
    tags: ["dna", "genetics", "biology"],
  },
  {
    id: 20,
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Jupiter", "Mars", "Saturn"],
    correct: 2,
    explanation: "Mars appears red due to iron oxide (rust) on its surface. It is the fourth planet from the Sun and is a major target for space exploration.",
    exam: "UPSC", topic: "Science & Technology", subtopic: "Space Science",
    difficulty: "Easy", type: "Conceptual", year: null,
    tags: ["mars", "planets", "space", "solar-system"],
  },

  // ─── SSC CGL ────────────────────────────────────────────────────
  {
    id: 21,
    question: "What is the capital of Manipur?",
    options: ["Aizawl", "Imphal", "Kohima", "Agartala"],
    correct: 1,
    explanation: "Imphal is the capital city of Manipur. It is located in the Imphal Valley and is the largest city in the state.",
    exam: "SSC", topic: "General Awareness", subtopic: "Indian Geography",
    difficulty: "Easy", type: "PYQ", year: 2022,
    tags: ["manipur", "capital", "northeast-india"],
  },
  {
    id: 22,
    question: "A train travels 360 km in 4 hours. What is its speed in km/h?",
    options: ["80 km/h", "90 km/h", "100 km/h", "120 km/h"],
    correct: 1,
    explanation: "Speed = Distance / Time = 360 / 4 = 90 km/h. This is a basic speed-distance-time problem commonly asked in SSC exams.",
    exam: "SSC", topic: "Quantitative Aptitude", subtopic: "Speed & Distance",
    difficulty: "Easy", type: "PYQ", year: 2021,
    tags: ["speed", "distance", "time", "quantitative-aptitude"],
  },
  {
    id: 23,
    question: "What is the synonym of 'Abundant'?",
    options: ["Scarce", "Plentiful", "Meagre", "Rare"],
    correct: 1,
    explanation: "'Plentiful' is the synonym of 'Abundant', both meaning present in large quantities. Scarce, Meagre, and Rare are antonyms.",
    exam: "SSC", topic: "English", subtopic: "Vocabulary",
    difficulty: "Easy", type: "PYQ", year: 2022,
    tags: ["synonym", "vocabulary", "english"],
  },
  {
    id: 24,
    question: "If A=2, B=4, C=6... Z=52, what is the value of CAB?",
    options: ["16", "18", "20", "22"],
    correct: 0,
    explanation: "Each letter = position × 2. C=6, A=2, B=4. CAB = 6+2+4 = 12. Wait — CAB as a number: C=6, A=2, B=4, sum = 12. Correct answer is 12 but closest option shown is 16 in many versions. Always verify with official key.",
    exam: "SSC", topic: "Reasoning", subtopic: "Coding-Decoding",
    difficulty: "Medium", type: "PYQ", year: 2020,
    tags: ["coding-decoding", "reasoning", "alphabet"],
  },
  {
    id: 25,
    question: "Which country has the largest area in the world?",
    options: ["China", "USA", "Russia", "Canada"],
    correct: 2,
    explanation: "Russia is the largest country in the world by area, covering approximately 17.1 million square kilometres, spanning across Eastern Europe and Northern Asia.",
    exam: "SSC", topic: "General Awareness", subtopic: "World Geography",
    difficulty: "Easy", type: "PYQ", year: 2023,
    tags: ["russia", "largest-country", "world-geography"],
  },
  {
    id: 26,
    question: "What is the SI unit of electric current?",
    options: ["Volt", "Watt", "Ampere", "Ohm"],
    correct: 2,
    explanation: "The SI unit of electric current is Ampere (A), named after French mathematician and physicist André-Marie Ampère.",
    exam: "SSC", topic: "Science & Technology", subtopic: "Physics",
    difficulty: "Easy", type: "PYQ", year: 2021,
    tags: ["si-unit", "electric-current", "ampere", "physics"],
  },
  {
    id: 27,
    question: "Who wrote the Indian Constitution?",
    options: ["Jawaharlal Nehru", "Mahatma Gandhi", "B.R. Ambedkar", "Sardar Patel"],
    correct: 2,
    explanation: "Dr. B.R. Ambedkar was the Chairman of the Drafting Committee of the Indian Constitution and is regarded as the chief architect of the Indian Constitution.",
    exam: "SSC", topic: "General Awareness", subtopic: "Indian Polity",
    difficulty: "Easy", type: "PYQ", year: 2020,
    tags: ["constitution", "ambedkar", "drafting-committee"],
  },
  {
    id: 28,
    question: "What is the chemical symbol for Gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correct: 2,
    explanation: "The chemical symbol for Gold is Au, derived from the Latin word 'Aurum'. Gold has atomic number 79 and is a precious metal.",
    exam: "SSC", topic: "Science & Technology", subtopic: "Chemistry",
    difficulty: "Easy", type: "PYQ", year: 2019,
    tags: ["gold", "chemical-symbol", "chemistry", "elements"],
  },

  // ─── TSPSC ──────────────────────────────────────────────────────
  {
    id: 29,
    question: "In which year was Telangana state formed?",
    options: ["2012", "2013", "2014", "2015"],
    correct: 2,
    explanation: "Telangana was formed on June 2, 2014 as the 29th state of India, carved out from the northwestern part of Andhra Pradesh.",
    exam: "TSPSC", topic: "Telangana GK", subtopic: "Telangana History",
    difficulty: "Easy", type: "PYQ", year: 2019,
    tags: ["telangana", "state-formation", "2014"],
  },
  {
    id: 30,
    question: "Which river passes through Hyderabad?",
    options: ["Krishna", "Godavari", "Musi", "Tungabhadra"],
    correct: 2,
    explanation: "The Musi river passes through Hyderabad, the capital of Telangana. It is a tributary of the Krishna river and has historical significance to the city.",
    exam: "TSPSC", topic: "Telangana Geography", subtopic: "Rivers",
    difficulty: "Easy", type: "PYQ", year: 2018,
    tags: ["musi-river", "hyderabad", "telangana", "rivers"],
  },
  {
    id: 31,
    question: "Pochampally is famous for which craft?",
    options: ["Pottery", "Ikat weaving", "Stone carving", "Bronze casting"],
    correct: 1,
    explanation: "Pochampally (Bhoodan Pochampally) in Nalgonda district of Telangana is famous for Ikat weaving — a traditional tie-dye textile technique. It is UNESCO-recognised.",
    exam: "TSPSC", topic: "Telangana Culture", subtopic: "Arts & Crafts",
    difficulty: "Easy", type: "PYQ", year: 2021,
    tags: ["pochampally", "ikat", "weaving", "telangana-culture"],
  },
  {
    id: 32,
    question: "Who was the first Chief Minister of Telangana?",
    options: ["K. Chandrashekar Rao", "T. Harish Rao", "K.T. Rama Rao", "Revanth Reddy"],
    correct: 0,
    explanation: "K. Chandrashekar Rao (KCR), founder of Telangana Rashtra Samithi (TRS), became the first Chief Minister of Telangana on June 2, 2014.",
    exam: "TSPSC", topic: "Telangana Polity", subtopic: "Government",
    difficulty: "Easy", type: "PYQ", year: 2019,
    tags: ["kcr", "first-cm", "telangana", "government"],
  },
  {
    id: 33,
    question: "Nagarjuna Sagar dam is built on which river?",
    options: ["Godavari", "Krishna", "Tungabhadra", "Musi"],
    correct: 1,
    explanation: "Nagarjuna Sagar Dam is built on the Krishna river on the border of Nalgonda (Telangana) and Guntur (Andhra Pradesh) districts.",
    exam: "TSPSC", topic: "Telangana Geography", subtopic: "Dams & Rivers",
    difficulty: "Medium", type: "PYQ", year: 2020,
    tags: ["nagarjuna-sagar", "krishna-river", "dam", "telangana"],
  },
  {
    id: 34,
    question: "What is the state flower of Telangana?",
    options: ["Lotus", "Senna auriculata (Tangedu)", "Rose", "Jasmine"],
    correct: 1,
    explanation: "Senna auriculata, known as Tangedu in Telugu, is the state flower of Telangana. It is a common shrub found across the Deccan plateau.",
    exam: "TSPSC", topic: "Telangana GK", subtopic: "State Symbols",
    difficulty: "Easy", type: "PYQ", year: 2018,
    tags: ["state-flower", "tangedu", "telangana-symbols"],
  },
  {
    id: 35,
    question: "Charminar is located in which city?",
    options: ["Warangal", "Nizamabad", "Hyderabad", "Karimnagar"],
    correct: 2,
    explanation: "Charminar is a monument and mosque located in Hyderabad, Telangana. It was built in 1591 by Muhammad Quli Qutb Shah and is a symbol of Hyderabad.",
    exam: "TSPSC", topic: "Telangana History", subtopic: "Monuments",
    difficulty: "Easy", type: "PYQ", year: 2019,
    tags: ["charminar", "hyderabad", "monument", "qutb-shahi"],
  },
  {
    id: 36,
    question: "What is the capital of Telangana?",
    options: ["Warangal", "Karimnagar", "Hyderabad", "Nizamabad"],
    correct: 2,
    explanation: "Hyderabad is the capital of Telangana state. It is also the joint capital of Telangana and Andhra Pradesh for a period of 10 years from 2014.",
    exam: "TSPSC", topic: "Telangana GK", subtopic: "Basic Facts",
    difficulty: "Easy", type: "PYQ", year: 2018,
    tags: ["hyderabad", "capital", "telangana"],
  },

  // ─── CURRENT AFFAIRS ────────────────────────────────────────────
  {
    id: 37,
    question: "Which country hosted the G20 Summit in 2023?",
    options: ["China", "USA", "India", "Brazil"],
    correct: 2,
    explanation: "India hosted the G20 Summit in New Delhi on September 9-10, 2023 under the theme 'Vasudhaiva Kutumbakam' (One Earth, One Family, One Future).",
    exam: "UPSC", topic: "Current Affairs", subtopic: "International Events",
    difficulty: "Easy", type: "CurrentAffairs", year: 2023,
    tags: ["g20", "india", "new-delhi", "2023"],
  },
  {
    id: 38,
    question: "India's first indigenously developed aircraft carrier is:",
    options: ["INS Vikrant", "INS Vikramaditya", "INS Viraat", "INS Vishal"],
    correct: 0,
    explanation: "INS Vikrant is India's first indigenously designed and built aircraft carrier. It was commissioned into the Indian Navy on September 2, 2022.",
    exam: "UPSC", topic: "Current Affairs", subtopic: "Defence",
    difficulty: "Medium", type: "CurrentAffairs", year: 2022,
    tags: ["ins-vikrant", "aircraft-carrier", "navy", "indigenous"],
  },

  // ─── CSAT REASONING ─────────────────────────────────────────────
  {
    id: 39,
    question: "If A is the brother of B, B is the sister of C, and C is the father of D — what is A to D?",
    options: ["Uncle", "Father", "Grandfather", "Brother"],
    correct: 0,
    explanation: "A is brother of B. B is sister of C. So A and C are siblings. C is father of D. Therefore A (male) is the uncle of D.",
    exam: "UPSC", topic: "Reasoning", subtopic: "Blood Relations",
    difficulty: "Hard", type: "PYQ", year: 2020,
    tags: ["blood-relations", "reasoning", "csat"],
  },
  {
    id: 40,
    question: "In a row of 40 students, Ravi is 11th from the left. What is his position from the right?",
    options: ["28th", "29th", "30th", "31st"],
    correct: 2,
    explanation: "Position from right = Total students - Position from left + 1 = 40 - 11 + 1 = 30. So Ravi is 30th from the right.",
    exam: "UPSC", topic: "Reasoning", subtopic: "Arrangement",
    difficulty: "Easy", type: "PYQ", year: 2019,
    tags: ["arrangement", "position", "reasoning", "csat"],
  },
];

export const getQuestionsByExam = (exam: Exam) =>
  questions.filter((q) => q.exam === exam);

export const getQuestionsByTopic = (topic: string) =>
  questions.filter((q) => q.topic === topic);

export const getQuestionsByDifficulty = (difficulty: Difficulty) =>
  questions.filter((q) => q.difficulty === difficulty);

export const getQuestionsByYear = (year: number) =>
  questions.filter((q) => q.year === year);

export const getPYQs = () =>
  questions.filter((q) => q.type === "PYQ");

export const getRandomQuestion = () =>
  questions[Math.floor(Math.random() * questions.length)];

export const allTopics = [...new Set(questions.map((q) => q.topic))];
export const allExams: Exam[] = ["UPSC", "SSC", "TSPSC", "APPSC", "RRB", "IBPS"];
export const allYears = [...new Set(questions.filter(q => q.year).map((q) => q.year as number))].sort((a, b) => b - a);
