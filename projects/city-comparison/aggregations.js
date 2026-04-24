/**
 * Pure JS aggregation functions for weather data.
 * Ported from scripts/aggregations.py.
 *
 * Input: array of daily records { d, tmin, tmax, tavg, prec, sun, wind }
 *        where d is "YYYY-MM-DD" string.
 *
 * Each function returns a plain array of plain objects.
 * Nulls in source data are skipped/treated as 0 where noted.
 */

/** Parse year and month (1-12) from a "YYYY-MM-DD" string. */
function ym(d) {
  const year = parseInt(d.slice(0, 4), 10);
  const month = parseInt(d.slice(5, 7), 10);
  return { year, month };
}

/** Group rows by a string key derived from each row. Returns Map<key, rows[]>. */
function groupBy(rows, keyFn) {
  const map = new Map();
  for (const row of rows) {
    const k = keyFn(row);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(row);
  }
  return map;
}

/**
 * Average monthly sun hours across all years.
 * Returns [{month, value}] for months 1-12.
 * @param {Array} rows
 * @param {number} numYears
 */
export function monthlySunHours(rows, numYears) {
  const totals = new Array(13).fill(0); // index 1-12
  for (const row of rows) {
    const { month } = ym(row.d);
    totals[month] += row.sun ?? 0;
  }
  return Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    value: totals[i + 1] / numYears,
  }));
}

/**
 * Total sun hours per year-month period (time series).
 * Returns [{year_and_month: "YYYY-MM", value}] sorted chronologically.
 * @param {Array} rows
 */
export function sunHoursByYearMonth(rows) {
  const totals = new Map();
  for (const row of rows) {
    const key = row.d.slice(0, 7); // "YYYY-MM"
    totals.set(key, (totals.get(key) ?? 0) + (row.sun ?? 0));
  }
  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => ({ year_and_month: k, value: v }));
}

/**
 * Mean daily temperature_average per calendar month.
 * Returns [{month, value}] for months 1-12.
 * @param {Array} rows
 */
export function monthlyTemperature(rows) {
  const sums = new Array(13).fill(0);
  const counts = new Array(13).fill(0);
  for (const row of rows) {
    if (row.tavg == null) continue;
    const { month } = ym(row.d);
    sums[month] += row.tavg;
    counts[month]++;
  }
  return Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    value: counts[i + 1] > 0 ? sums[i + 1] / counts[i + 1] : null,
  }));
}

/**
 * Mean of daily tmin and tmax per calendar month.
 * Returns [{month, min, max}] for months 1-12.
 * @param {Array} rows
 */
export function monthlyMinMaxTemperature(rows) {
  const minSums = new Array(13).fill(0);
  const maxSums = new Array(13).fill(0);
  const counts = new Array(13).fill(0);
  for (const row of rows) {
    if (row.tmin == null || row.tmax == null) continue;
    const { month } = ym(row.d);
    minSums[month] += row.tmin;
    maxSums[month] += row.tmax;
    counts[month]++;
  }
  return Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    min: counts[i + 1] > 0 ? minSums[i + 1] / counts[i + 1] : null,
    max: counts[i + 1] > 0 ? maxSums[i + 1] / counts[i + 1] : null,
  }));
}

/**
 * Mean wind per calendar month.
 * Returns [{month, value}] for months 1-12.
 * @param {Array} rows
 */
export function monthlyWind(rows) {
  const sums = new Array(13).fill(0);
  const counts = new Array(13).fill(0);
  for (const row of rows) {
    if (row.wind == null) continue;
    const { month } = ym(row.d);
    sums[month] += row.wind;
    counts[month]++;
  }
  return Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    value: counts[i + 1] > 0 ? sums[i + 1] / counts[i + 1] : null,
  }));
}

/**
 * Average total precipitation per calendar month across all years.
 * Returns [{month, value}] for months 1-12.
 * @param {Array} rows
 * @param {number} numYears
 */
export function monthlyPrecipitation(rows, numYears) {
  const totals = new Array(13).fill(0);
  for (const row of rows) {
    const { month } = ym(row.d);
    totals[month] += row.prec ?? 0;
  }
  return Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    value: totals[i + 1] / numYears,
  }));
}

/**
 * Mean daily temperature per year (sum/365 matching Python).
 * Returns [{year, value}].
 * @param {Array} rows
 */
export function yearlyTemperature(rows) {
  const sums = new Map();
  for (const row of rows) {
    if (row.tavg == null) continue;
    const { year } = ym(row.d);
    sums.set(year, (sums.get(year) ?? 0) + row.tavg);
  }
  return [...sums.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, sum]) => ({ year, value: sum / 365 }));
}

/**
 * Total sun hours per year, zeros for missing years.
 * Returns [{year, value}].
 * @param {Array} rows
 * @param {number} startYear
 * @param {number} endYear
 */
export function yearlySunHours(rows, startYear, endYear) {
  const totals = new Map();
  for (const row of rows) {
    const { year } = ym(row.d);
    totals.set(year, (totals.get(year) ?? 0) + (row.sun ?? 0));
  }
  const result = [];
  for (let y = startYear; y <= endYear; y++) {
    result.push({ year: y, value: totals.get(y) ?? 0 });
  }
  return result;
}

/**
 * Total precipitation per year.
 * Returns [{year, value}].
 * @param {Array} rows
 */
export function yearlyPrecipitation(rows) {
  const totals = new Map();
  for (const row of rows) {
    const { year } = ym(row.d);
    totals.set(year, (totals.get(year) ?? 0) + (row.prec ?? 0));
  }
  return [...totals.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, value]) => ({ year, value }));
}

/**
 * Count of days per year where tmax >= threshold.
 * Returns [{year, count}].
 * @param {Array} rows
 * @param {number} [threshold=20]
 * @param {number} startYear
 * @param {number} endYear
 */
export function hotDaysPerYear(rows, threshold = 20, startYear, endYear) {
  const counts = new Map();
  for (const row of rows) {
    if (row.tmax == null) continue;
    if (row.tmax >= threshold) {
      const { year } = ym(row.d);
      counts.set(year, (counts.get(year) ?? 0) + 1);
    }
  }
  const result = [];
  for (let y = startYear; y <= endYear; y++) {
    result.push({ year: y, count: counts.get(y) ?? 0 });
  }
  return result;
}

/**
 * Count of days per year where tmin < threshold.
 * Returns [{year, count}].
 * @param {Array} rows
 * @param {number} [threshold=0]
 * @param {number} startYear
 * @param {number} endYear
 */
export function belowZeroDaysPerYear(rows, threshold = 0, startYear, endYear) {
  const counts = new Map();
  for (const row of rows) {
    if (row.tmin == null) continue;
    if (row.tmin < threshold) {
      const { year } = ym(row.d);
      counts.set(year, (counts.get(year) ?? 0) + 1);
    }
  }
  const result = [];
  for (let y = startYear; y <= endYear; y++) {
    result.push({ year: y, count: counts.get(y) ?? 0 });
  }
  return result;
}

/**
 * Average count of days with sun==0 per calendar month.
 * Returns [{month, value}] for months 1-12.
 * @param {Array} rows
 */
export function daysWithoutSunPerMonth(rows) {
  // Count zero-sun days per (year, month), then average over years per month
  const perYearMonth = new Map(); // "YYYY-MM" -> count
  for (const row of rows) {
    if ((row.sun ?? 0) === 0) {
      const key = row.d.slice(0, 7);
      perYearMonth.set(key, (perYearMonth.get(key) ?? 0) + 1);
    }
  }
  // Aggregate per month
  const monthSums = new Array(13).fill(0);
  const monthCounts = new Array(13).fill(0);
  for (const [key, count] of perYearMonth.entries()) {
    const month = parseInt(key.slice(5, 7), 10);
    monthSums[month] += count;
    monthCounts[month]++;
  }
  return Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    value: monthCounts[i + 1] > 0 ? monthSums[i + 1] / monthCounts[i + 1] : 0,
  }));
}

/**
 * Total rainy days (prec >= 0.1 mm) per year, zeros for missing years.
 * Returns [{year, count}].
 * @param {Array} rows
 * @param {number} startYear
 * @param {number} endYear
 */
export function daysWithPrecipitationPerYear(rows, startYear, endYear) {
  // Count rainy days per (year, month), then sum per year
  const perYearMonth = new Map(); // "YYYY-MM" -> count
  for (const row of rows) {
    const prec = row.prec ?? 0;
    if (prec >= 0.1) {
      const key = row.d.slice(0, 7);
      perYearMonth.set(key, (perYearMonth.get(key) ?? 0) + 1);
    }
  }
  const yearTotals = new Map();
  for (const [key, count] of perYearMonth.entries()) {
    const year = parseInt(key.slice(0, 4), 10);
    yearTotals.set(year, (yearTotals.get(year) ?? 0) + count);
  }
  const result = [];
  for (let y = startYear; y <= endYear; y++) {
    result.push({ year: y, count: yearTotals.get(y) ?? 0 });
  }
  return result;
}

/**
 * Average rainy days (prec >= 0.1 mm) per calendar month across all years.
 * Returns [{month, value}] for months 1-12.
 * @param {Array} rows
 */
export function daysWithPrecipitationPerMonth(rows) {
  const perYearMonth = new Map(); // "YYYY-MM" -> count
  for (const row of rows) {
    const prec = row.prec ?? 0;
    if (prec >= 0.1) {
      const key = row.d.slice(0, 7);
      perYearMonth.set(key, (perYearMonth.get(key) ?? 0) + 1);
    }
  }
  const monthSums = new Array(13).fill(0);
  const monthCounts = new Array(13).fill(0);
  for (const [key, count] of perYearMonth.entries()) {
    const month = parseInt(key.slice(5, 7), 10);
    monthSums[month] += count;
    monthCounts[month]++;
  }
  return Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    value: monthCounts[i + 1] > 0 ? monthSums[i + 1] / monthCounts[i + 1] : 0,
  }));
}

/**
 * Percentage of days where tmax >= each threshold.
 * Returns [{threshold, percentage}].
 * @param {Array} rows
 * @param {number[]} [thresholds=[-10,-5,0,5,10,15,20,25,30]]
 */
export function temperatureThresholdPercentages(
  rows,
  thresholds = [-10, -5, 0, 5, 10, 15, 20, 25, 30]
) {
  const validRows = rows.filter((r) => r.tmax != null);
  const total = validRows.length;
  return thresholds.map((t) => ({
    threshold: t,
    percentage: total > 0 ? (validRows.filter((r) => r.tmax >= t).length / total) * 100 : 0,
  }));
}

/**
 * Filter rows to [startYear, endYear] inclusive.
 * @param {Array} rows
 * @param {number} startYear
 * @param {number} endYear
 */
export function filterYears(rows, startYear, endYear) {
  return rows.filter((row) => {
    const year = parseInt(row.d.slice(0, 4), 10);
    return year >= startYear && year <= endYear;
  });
}

/**
 * Compute all aggregations from daily rows.
 * Returns the same shape as {slug}_summary.json.
 * @param {Array} rows  - filtered daily records
 * @param {number} startYear
 * @param {number} endYear
 */
export function computeAllAggregations(rows, startYear, endYear) {
  const numYears = endYear - startYear + 1;
  return {
    monthly: {
      sun_hours: monthlySunHours(rows, numYears),
      temperature_avg: monthlyTemperature(rows),
      temperature_min_max: monthlyMinMaxTemperature(rows),
      wind: monthlyWind(rows),
      precipitation: monthlyPrecipitation(rows, numYears),
      days_without_sun: daysWithoutSunPerMonth(rows),
      days_with_precipitation: daysWithPrecipitationPerMonth(rows),
    },
    yearly: {
      temperature_avg: yearlyTemperature(rows),
      sun_hours: yearlySunHours(rows, startYear, endYear),
      precipitation: yearlyPrecipitation(rows),
      hot_days: hotDaysPerYear(rows, 20, startYear, endYear),
      below_zero_days: belowZeroDaysPerYear(rows, 0, startYear, endYear),
      rainy_days: daysWithPrecipitationPerYear(rows, startYear, endYear),
    },
    threshold_percentages: temperatureThresholdPercentages(rows),
    sun_hours_by_year_month: sunHoursByYearMonth(rows),
  };
}
