/**
 * Get the current year dynamically
 * @returns Current year as number
 */
export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

/**
 * Get next year
 * @returns Next year as number
 */
export const getNextYear = (): number => {
  return new Date().getFullYear() + 1;
};

/**
 * Get year range (e.g., "2015-2024")
 * @param startYear - Starting year
 * @param endYear - Optional end year (defaults to current year)
 * @returns Formatted year range string
 */
export const getYearRange = (startYear: number, endYear?: number): string => {
  const end = endYear || getCurrentYear();
  return `${startYear}-${end}`;
};

/**
 * Get academic year (e.g., "2024-25")
 * @returns Formatted academic year string
 */
export const getAcademicYear = (): string => {
  const currentYear = new Date().getFullYear();
  const nextYear = (currentYear + 1).toString().slice(-2);
  return `${currentYear}-${nextYear}`;
};
