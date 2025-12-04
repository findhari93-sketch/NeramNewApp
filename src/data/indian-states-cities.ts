// Indian States and Cities Data
// Comprehensive list for exam center location selection

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

export type IndianState = typeof INDIAN_STATES[number];

// Cities organized by state - major cities with likely exam centers
export const CITIES_BY_STATE: Record<IndianState, string[]> = {
  "Andhra Pradesh": [
    "Amaravati",
    "Anantapur",
    "Chittoor",
    "Eluru",
    "Guntur",
    "Kadapa",
    "Kakinada",
    "Kurnool",
    "Nellore",
    "Ongole",
    "Rajahmundry",
    "Srikakulam",
    "Tirupati",
    "Vijayawada",
    "Visakhapatnam",
    "Vizianagaram",
  ],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro"],
  "Assam": ["Dibrugarh", "Guwahati", "Jorhat", "Nagaon", "Silchar", "Tezpur", "Tinsukia"],
  "Bihar": [
    "Arrah",
    "Aurangabad",
    "Begusarai",
    "Bhagalpur",
    "Bihar Sharif",
    "Darbhanga",
    "Gaya",
    "Hajipur",
    "Katihar",
    "Munger",
    "Muzaffarpur",
    "Patna",
    "Purnia",
    "Saharsa",
  ],
  "Chhattisgarh": ["Bhilai", "Bilaspur", "Durg", "Jagdalpur", "Korba", "Raigarh", "Raipur", "Rajnandgaon"],
  "Goa": ["Madgaon", "Mapusa", "Panaji", "Ponda", "Vasco da Gama"],
  "Gujarat": [
    "Ahmedabad",
    "Anand",
    "Bharuch",
    "Bhavnagar",
    "Bhuj",
    "Gandhinagar",
    "Jamnagar",
    "Junagadh",
    "Mehsana",
    "Morbi",
    "Nadiad",
    "Navsari",
    "Rajkot",
    "Surat",
    "Vadodara",
    "Vapi",
  ],
  "Haryana": [
    "Ambala",
    "Bhiwani",
    "Faridabad",
    "Gurugram",
    "Hisar",
    "Karnal",
    "Kurukshetra",
    "Panipat",
    "Rewari",
    "Rohtak",
    "Sirsa",
    "Sonipat",
    "Yamunanagar",
  ],
  "Himachal Pradesh": ["Baddi", "Dharamshala", "Hamirpur", "Kangra", "Kullu", "Mandi", "Shimla", "Solan", "Una"],
  "Jharkhand": ["Bokaro", "Deoghar", "Dhanbad", "Dumka", "Giridih", "Hazaribagh", "Jamshedpur", "Ranchi"],
  "Karnataka": [
    "Bagalkot",
    "Ballari",
    "Belagavi",
    "Bengaluru",
    "Bidar",
    "Chitradurga",
    "Davanagere",
    "Dharwad",
    "Gadag",
    "Gulbarga",
    "Hassan",
    "Hubli",
    "Mangaluru",
    "Mysuru",
    "Raichur",
    "Shivamogga",
    "Tumkur",
    "Udupi",
  ],
  "Kerala": [
    "Alappuzha",
    "Ernakulam",
    "Kannur",
    "Kasaragod",
    "Kollam",
    "Kottayam",
    "Kozhikode",
    "Malappuram",
    "Palakkad",
    "Pathanamthitta",
    "Thiruvananthapuram",
    "Thrissur",
    "Wayanad",
  ],
  "Madhya Pradesh": [
    "Bhopal",
    "Dewas",
    "Gwalior",
    "Indore",
    "Jabalpur",
    "Katni",
    "Ratlam",
    "Rewa",
    "Sagar",
    "Satna",
    "Ujjain",
    "Vidisha",
  ],
  "Maharashtra": [
    "Ahmednagar",
    "Akola",
    "Amravati",
    "Aurangabad",
    "Chandrapur",
    "Dhule",
    "Jalgaon",
    "Kolhapur",
    "Latur",
    "Mumbai",
    "Nagpur",
    "Nanded",
    "Nashik",
    "Navi Mumbai",
    "Panvel",
    "Pimpri-Chinchwad",
    "Pune",
    "Ratnagiri",
    "Sangli",
    "Satara",
    "Solapur",
    "Thane",
    "Wardha",
  ],
  "Manipur": ["Imphal", "Kakching", "Thoubal"],
  "Meghalaya": ["Shillong", "Tura"],
  "Mizoram": ["Aizawl", "Lunglei"],
  "Nagaland": ["Dimapur", "Kohima", "Mokokchung"],
  "Odisha": ["Balasore", "Berhampur", "Bhubaneswar", "Cuttack", "Puri", "Rourkela", "Sambalpur"],
  "Punjab": ["Amritsar", "Bathinda", "Hoshiarpur", "Jalandhar", "Ludhiana", "Mohali", "Patiala", "Pathankot"],
  "Rajasthan": ["Ajmer", "Alwar", "Bhilwara", "Bikaner", "Jaipur", "Jodhpur", "Kota", "Sikar", "Udaipur"],
  "Sikkim": ["Gangtok", "Namchi"],
  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Cuddalore",
    "Dindigul",
    "Erode",
    "Kanchipuram",
    "Karur",
    "Madurai",
    "Nagercoil",
    "Namakkal",
    "Puducherry",
    "Pudukkottai",
    "Salem",
    "Thanjavur",
    "Tiruchirappalli",
    "Tirunelveli",
    "Tiruppur",
    "Tiruvannamalai",
    "Tuticorin",
    "Vellore",
  ],
  "Telangana": [
    "Hyderabad",
    "Karimnagar",
    "Khammam",
    "Mahbubnagar",
    "Nalgonda",
    "Nizamabad",
    "Secunderabad",
    "Warangal",
  ],
  "Tripura": ["Agartala", "Dharmanagar", "Udaipur"],
  "Uttar Pradesh": [
    "Agra",
    "Aligarh",
    "Allahabad",
    "Bareilly",
    "Firozabad",
    "Ghaziabad",
    "Gorakhpur",
    "Jhansi",
    "Kanpur",
    "Lucknow",
    "Mathura",
    "Meerut",
    "Moradabad",
    "Noida",
    "Saharanpur",
    "Varanasi",
  ],
  "Uttarakhand": [
    "Dehradun",
    "Haridwar",
    "Haldwani",
    "Kashipur",
    "Nainital",
    "Rishikesh",
    "Roorkee",
    "Rudrapur",
  ],
  "West Bengal": [
    "Asansol",
    "Bardhaman",
    "Durgapur",
    "Haldia",
    "Howrah",
    "Kalyani",
    "Kharagpur",
    "Kolkata",
    "Malda",
    "Siliguri",
  ],
  // Union Territories
  "Andaman and Nicobar Islands": ["Port Blair"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
  "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "South Delhi", "West Delhi"],
  "Jammu and Kashmir": ["Anantnag", "Jammu", "Srinagar"],
  "Ladakh": ["Kargil", "Leh"],
  "Lakshadweep": ["Kavaratti"],
  "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"],
};

// Exam types supported
export const EXAM_TYPES = [
  { value: "NATA", label: "NATA (National Aptitude Test in Architecture)" },
  { value: "JEE Paper 2", label: "JEE Paper 2 (B.Arch/B.Planning)" },
] as const;

export type ExamType = typeof EXAM_TYPES[number]["value"];

// Center status options
export const CENTER_STATUS = [
  { value: "active", label: "Active", color: "green" },
  { value: "inactive", label: "Inactive", color: "yellow" },
  { value: "discontinued", label: "Discontinued", color: "red" },
] as const;

export type CenterStatus = typeof CENTER_STATUS[number]["value"];

/**
 * Get cities for a given state
 */
export function getCitiesForState(state: IndianState): string[] {
  return CITIES_BY_STATE[state] || [];
}

/**
 * Get all states that have cities listed
 */
export function getStatesWithCities(): IndianState[] {
  return INDIAN_STATES.filter((state) => CITIES_BY_STATE[state]?.length > 0);
}

/**
 * Search cities across all states
 */
export function searchCities(query: string): { state: IndianState; city: string }[] {
  const results: { state: IndianState; city: string }[] = [];
  const lowerQuery = query.toLowerCase();

  for (const state of INDIAN_STATES) {
    const cities = CITIES_BY_STATE[state] || [];
    for (const city of cities) {
      if (city.toLowerCase().includes(lowerQuery)) {
        results.push({ state, city });
      }
    }
  }

  return results;
}

/**
 * Get total number of cities
 */
export function getTotalCitiesCount(): number {
  return Object.values(CITIES_BY_STATE).reduce((total, cities) => total + cities.length, 0);
}

/**
 * Get cities count for a specific state
 */
export function getCitiesCountForState(state: IndianState): number {
  return CITIES_BY_STATE[state]?.length || 0;
}

/**
 * Check if a state exists
 */
export function isValidState(state: string): state is IndianState {
  return INDIAN_STATES.includes(state as IndianState);
}

/**
 * Check if a city exists in a state
 */
export function isCityInState(city: string, state: IndianState): boolean {
  const cities = CITIES_BY_STATE[state] || [];
  return cities.includes(city);
}
