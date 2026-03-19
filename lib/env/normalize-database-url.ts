const PSQL_PREFIX_REGEX = /^psql\s+/i;

export function normalizeDatabaseUrl(rawValue: string): string {
  let value = rawValue.trim();

  if (PSQL_PREFIX_REGEX.test(value)) {
    value = value.replace(PSQL_PREFIX_REGEX, "").trim();
  }

  if (
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    value = value.slice(1, -1).trim();
  }

  return value;
}
