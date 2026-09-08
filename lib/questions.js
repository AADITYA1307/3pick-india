export const CITIES = {
  mumbai: { label: "Mumbai", cng: true },
  delhi: { label: "Delhi-NCR", cng: true },
  pune: { label: "Pune", cng: true },
  bengaluru: { label: "Bengaluru", cng: false },
  hyderabad: { label: "Hyderabad", cng: false },
  chennai: { label: "Chennai", cng: false },
  other: { label: "Another city", cng: false },
};

export const CITY_OPTIONS = Object.entries(CITIES).map(([id, c]) => ({
  id,
  label: c.label,
  cng: c.cng,
}));

export const HARD_NOS = [
  { id: "no_ev", label: "No EV" },
  { id: "must_auto", label: "Must be automatic" },
  { id: "must_new", label: "Must be new" },
  { id: "no_diesel", label: "No diesel" },
];

/** 7 life questions. No name, mobile, CIBIL, buy-when, or exchange. */
export const QUESTIONS = [
  {
    id: "city",
    type: "city",
    title: "Which city will this car live in?",
    blurb: "CNG only counts in Delhi-NCR, Mumbai, and Pune. Tap another city if you are shopping elsewhere.",
  },
  {
    id: "household",
    type: "choice",
    title: "Who is it for?",
    blurb: "Kids or a third row triggers a 4-star safety floor. Not a vibe check.",
    options: [
      { id: "solo", label: "Just me", hint: "Office, errands, the occasional drop" },
      { id: "couple", label: "Two adults", hint: "No child seats" },
      { id: "kids", label: "Kids", hint: "4-star minimum" },
      { id: "third_row", label: "Need a third row", hint: "7 seats and 4-star minimum" },
    ],
  },
  {
    id: "commute",
    type: "commute",
    title: "Daily commute, in kilometres?",
    blurb: "This drives the fuel line in all-in monthly cost. Also tell us if the roads are bad.",
  },
  {
    id: "sleep",
    type: "sleep",
    title: "Where does it sleep?",
    blurb: "Apartment, house, or street. A home charger is the only unlock for EV.",
    options: [
      { id: "apartment", label: "Apartment", hint: "Society / basement stack" },
      { id: "house", label: "House", hint: "Independent house / compound" },
      { id: "street", label: "Street", hint: "Open street parking" },
    ],
  },
  {
    id: "monthlyCap",
    type: "slider",
    title: "All-in monthly cap",
    blurb: "EMI + insurance + fuel + service. Not brochure EMI. Used/CPO only if this is tight (₹20,000 or under).",
    min: 8000,
    max: 80000,
    step: 1000,
    defaultValue: 28000,
  },
  {
    id: "keepYears",
    type: "choice",
    title: "How long will you keep it?",
    blurb: "Eight years is a poor fit for a used car. Three years can make CPO rational on a tight cap.",
    options: [
      { id: 3, label: "3 years", hint: "CPO can make sense if the cap is tight" },
      { id: 5, label: "5 years", hint: "The default hold" },
      { id: 8, label: "8 years", hint: "Prefer new; punish used" },
    ],
  },
  {
    id: "hardNos",
    type: "hardnos",
    title: "Any hard no?",
    blurb: "Optional. Skip if none. We still will not ask CIBIL, exchange, or when you will buy.",
    options: HARD_NOS,
  },
];

export const REQUIRED_FIELDS = ["city", "household", "commuteKm", "parking", "monthlyCap", "keepYears"];

export function validateAnswers(answers) {
  if (!answers || typeof answers !== "object") return "Answer all 7 questions.";
  for (const id of REQUIRED_FIELDS) {
    if (answers[id] === undefined || answers[id] === null || answers[id] === "") {
      return "Answer all 7 questions.";
    }
  }
  if (typeof answers.badRoads !== "boolean") return "Say whether the roads are bad.";
  if (typeof answers.charger !== "boolean") return "Say whether you have a home charger.";
  if (!Array.isArray(answers.hardNos)) return "Hard nos must be a list.";
  return null;
}
