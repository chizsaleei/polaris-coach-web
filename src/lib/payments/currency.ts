import { log } from "../logger";

const SUPPORTED_CURRENCIES = [
  "USD",
  "PHP",
  "CNY",
  "INR",
  "KRW",
  "VND",
  "THB",
  "IDR",
  "JPY",
  "BRL",
  "MXN",
  "TRY",
  "COP",
  "ARS",
  "PEN",
  "CLP",
  "SAR",
  "AED",
  "QAR",
  "KWD",
  "EGP",
  "PKR",
  "BDT",
  "NPR",
  "LKR",
  "MMK",
  "KZT",
  "UAH",
  "MAD",
  "DZD",
  "ETB",
] as const;

const SUPPORTED_SET = new Set<string>(SUPPORTED_CURRENCIES);

export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

const COUNTRY_TO_CURRENCY: Record<string, Currency> = {
  US: "USD",
  CA: "USD",
  CN: "CNY",
  IN: "INR",
  KR: "KRW",
  VN: "VND",
  TH: "THB",
  PH: "PHP",
  ID: "IDR",
  JP: "JPY",
  BR: "BRL",
  MX: "MXN",
  TR: "TRY",
  CO: "COP",
  AR: "ARS",
  PE: "PEN",
  CL: "CLP",
  SA: "SAR",
  AE: "AED",
  QA: "QAR",
  KW: "KWD",
  EG: "EGP",
  PK: "PKR",
  BD: "BDT",
  NP: "NPR",
  LK: "LKR",
  MM: "MMK",
  KZ: "KZT",
  UA: "UAH",
  MA: "MAD",
  DZ: "DZD",
  ET: "ETB",
};

const DEFAULT_CURRENCY: Currency = normalizeCurrency(
  process.env.PAYMONGO_DEFAULT_CURRENCY ||
    process.env.DEFAULT_CURRENCY ||
    "USD",
);

function normalizeCurrency(value: string): Currency {
  const upper = value.toUpperCase();
  if (SUPPORTED_SET.has(upper)) {
    return upper as Currency;
  }
  log.warn("Unsupported currency requested. Falling back to USD.", { currency: value });
  return "USD";
}

export function currencyForCountry(country?: string): Currency {
  if (!country) return DEFAULT_CURRENCY;
  const code = country.trim().toUpperCase();
  const mapped = COUNTRY_TO_CURRENCY[code];
  if (!mapped) {
    log.warn("Unsupported country for currency mapping", { country: code });
    return DEFAULT_CURRENCY;
  }
  return mapped;
}
