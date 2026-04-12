export const DEFAULT_REGION = "Worldwide";
export const DEFAULT_LANGUAGES = ["English"] as const;

export const CONTINENT_OPTIONS = [
  "Africa",
  "Antarctica",
  "Asia",
  "Europe",
  "North America",
  "Oceania",
  "South America",
] as const;

export const COUNTRY_OPTIONS = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo (Brazzaville)",
  "Congo (Kinshasa)",
  "Costa Rica",
  "Cote d'Ivoire",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
] as const;

export const LANGUAGE_OPTIONS = [
  "Arabic",
  "Bengali",
  "Chinese",
  "Czech",
  "Danish",
  "Dutch",
  "English",
  "Finnish",
  "French",
  "German",
  "Greek",
  "Hebrew",
  "Hindi",
  "Hungarian",
  "Indonesian",
  "Italian",
  "Japanese",
  "Korean",
  "Norwegian",
  "Polish",
  "Portuguese",
  "Romanian",
  "Russian",
  "Spanish",
  "Swedish",
  "Thai",
  "Turkish",
  "Ukrainian",
  "Vietnamese",
] as const;

export type RegionSelectionKind = "worldwide" | "continents" | "countries";

const continentSet = new Set<string>(CONTINENT_OPTIONS);
const countrySet = new Set<string>(COUNTRY_OPTIONS);
const languageSet = new Set<string>(LANGUAGE_OPTIONS);

function normalizeDistinctValues(values: string[]) {
  const seen = new Set<string>();
  const normalizedValues: string[] = [];

  for (const value of values) {
    const trimmedValue = value.trim();
    const normalizedKey = trimmedValue.toLowerCase();

    if (!trimmedValue || seen.has(normalizedKey)) {
      continue;
    }

    seen.add(normalizedKey);
    normalizedValues.push(trimmedValue);
  }

  return normalizedValues;
}

export function validateAndSanitizeRegions(values: string[]): {
  isValid: boolean;
  kind: RegionSelectionKind;
  regions: string[];
} {
  const normalizedValues = normalizeDistinctValues(values).filter(
    (value) =>
      value === DEFAULT_REGION || continentSet.has(value) || countrySet.has(value),
  );

  if (normalizedValues.length === 0) {
    return {
      isValid: true,
      kind: "worldwide",
      regions: [DEFAULT_REGION],
    };
  }

  if (normalizedValues.includes(DEFAULT_REGION)) {
    return {
      isValid: normalizedValues.length === 1,
      kind: "worldwide",
      regions: [DEFAULT_REGION],
    };
  }

  const selectedContinents = normalizedValues.filter((value) => continentSet.has(value));

  if (selectedContinents.length === normalizedValues.length) {
    return {
      isValid: true,
      kind: "continents",
      regions: selectedContinents,
    };
  }

  const selectedCountries = normalizedValues.filter((value) => countrySet.has(value));

  if (selectedCountries.length === normalizedValues.length) {
    return {
      isValid: true,
      kind: "countries",
      regions: selectedCountries,
    };
  }

  return {
    isValid: false,
    kind: "worldwide",
    regions: [DEFAULT_REGION],
  };
}

export function sanitizeRegions(values: string[]) {
  return validateAndSanitizeRegions(values).regions;
}

export function getRegionSelectionKind(values: string[]): RegionSelectionKind {
  return validateAndSanitizeRegions(values).kind;
}

export function formatRegionSelection(values: string[]) {
  const regions = sanitizeRegions(values);
  return regions.join(", ");
}

export function sanitizeLanguages(values: string[]) {
  const seen = new Set<string>();

  const normalized = values.filter((value) => {
    if (!languageSet.has(value) || seen.has(value)) {
      return false;
    }

    seen.add(value);
    return true;
  });

  return normalized.length > 0 ? normalized : [...DEFAULT_LANGUAGES];
}
