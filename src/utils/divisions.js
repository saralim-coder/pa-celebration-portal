// PA division short forms — only the short form is stored.
// Full names are shown in the dropdown for clarity.
// Sorted alphabetically by short form.
export const PA_DIVISIONS = [
  { short: "2LD", full: "Lifeskills & Lifestyle" },
  { short: "A&P", full: "Administration & Procurement" },
  { short: "AAFL", full: "Active Ageing & Family Life" },
  { short: "ACD", full: "Arts & Culture" },
  { short: "BD", full: "Building" },
  { short: "CAD", full: "Community Analytics" },
  { short: "CF", full: "Corporate Finance" },
  { short: "COD", full: "Communications Development" },
  { short: "CPD", full: "CDC Planning & Development" },
  { short: "CS", full: "Central Singapore CDD" },
  { short: "DM", full: "Data Management" },
  { short: "EM", full: "Estates Management" },
  { short: "EP", full: "Emergency Preparedness" },
  { short: "GPP", full: "Grassroots Policy & Programmes" },
  { short: "GS", full: "Grassroots Services" },
  { short: "HR", full: "Human Resources" },
  { short: "IA", full: "Internal Audit" },
  { short: "ICH", full: "Integrated Community Hub" },
  { short: "ICT", full: "Infocomm Technology" },
  { short: "IDD", full: "Integrated Development" },
  { short: "INT", full: "Integration" },
  { short: "Legal", full: "Legal Service Office" },
  { short: "M&P", full: "Membership" },
  { short: "MDC", full: "Marketing & Digital Communications" },
  { short: "MO", full: "Messaging & Outreach" },
  { short: "NACLI", full: "National Community Leadership Institute" },
  { short: "NE", full: "North East CDD" },
  { short: "NW", full: "North West CDD" },
  { short: "ODP", full: "Operations Development & Planning" },
  { short: "OSED", full: "Organisational & Service Excellence" },
  { short: "RND", full: "Residents' Network Division" },
  { short: "SCD", full: "Strategic Communications" },
  { short: "SE", full: "South East CDD" },
  { short: "SO", full: "Safety Office" },
  { short: "SPD", full: "Strategic Planning Division" },
  { short: "SW", full: "South West CDD" },
  { short: "TO", full: "Transformation Office" },
  { short: "VM", full: "Volunteer Management" },
  { short: "Y&S", full: "Youth & Sports" },
  { short: "Leadership", full: "Leadership" },
];

// Events that require the division selector.
export const DIVISION_EVENT_TITLES = ["PA Workplan Seminar"];

export const isDivisionEvent = (eventTitle) =>
  DIVISION_EVENT_TITLES.some((t) => eventTitle?.toLowerCase().includes(t.toLowerCase()));