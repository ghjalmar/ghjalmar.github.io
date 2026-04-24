/**
 * app.js — main wiring for the weather comparison frontend.
 * Fetches city manifest + per-city JSON, caches results, renders Plotly charts.
 */

import { t } from "./i18n.js";
import { computeAllAggregations, filterYears } from "./aggregations.js";

// ---------------------------------------------------------------------------
// Colour palette (matches Python scripts)
// ---------------------------------------------------------------------------
const COLORS = {
  a: { bar: "#60A5FA", border: "#3B82F6", fill: "rgba(29, 78, 216, 0.18)", dash: "#3B82F6" },
  b: { bar: "#FCD34D", border: "#F59E0B", fill: "rgba(252, 211, 77, 0.18)", dash: "#F59E0B" },
};

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let lang = "is";
let startYear = 2010;
let endYear = 2025;
let cityASlug = null;
let cityBSlug = null;
let citiesMeta = []; // from cities.json
let activeTab = "compare"; // "compare" | "ranking"
let rankSort = { key: "name", dir: "asc" };

const dataCache = new Map(); // slug -> daily JSON { slug, data: [...] }
const summaryCache = new Map(); // slug -> summary JSON

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------
const $ = (id) => document.getElementById(id);

function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------
async function fetchJSON(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${url}`);
  return resp.json();
}

async function loadCities() {
  const manifest = await fetchJSON("data/cities.json");
  citiesMeta = manifest.cities;
  const buildEl = $("build-date");
  if (buildEl) {
    buildEl.textContent = `${t("ui_last_updated", lang)}: ${manifest.build.slice(0, 10)}`;
  }
  return citiesMeta;
}

/** Get summary data, using cache. Falls back to computing from daily if needed. */
async function getSummary(slug) {
  if (summaryCache.has(slug)) return summaryCache.get(slug);
  const data = await fetchJSON(`data/${slug}_summary.json`);
  summaryCache.set(slug, data);
  return data;
}

/** Get daily data, using cache. */
async function getDailyData(slug) {
  if (dataCache.has(slug)) return dataCache.get(slug);
  const data = await fetchJSON(`data/${slug}.json`);
  dataCache.set(slug, data);
  return data;
}

/**
 * Get aggregations for a city in [startYear, endYear].
 * If range matches default (2010-2025), use summary JSON.
 * Otherwise load daily data and re-aggregate.
 */
async function getAggregations(slug) {
  // Check if any summary covers exactly this range
  if (summaryCache.has(slug)) {
    const s = summaryCache.get(slug);
    if (s.start_year === startYear && s.end_year === endYear) return s;
  }
  // Try loading summary (it's for the default 2010-2025 range)
  try {
    const summary = await getSummary(slug);
    if (summary.start_year === startYear && summary.end_year === endYear) {
      return summary;
    }
  } catch {
    // summary unavailable; fall through to daily
  }
  // Need daily data + JS aggregation
  const daily = await getDailyData(slug);
  const filtered = filterYears(daily.data, startYear, endYear);
  return computeAllAggregations(filtered, startYear, endYear);
}

// ---------------------------------------------------------------------------
// Chart rendering helpers
// ---------------------------------------------------------------------------
const PLOTLY_LAYOUT_BASE = {
  plot_bgcolor: "#F8FAFC",
  paper_bgcolor: "#FFFFFF",
  font: { family: "system-ui, -apple-system, sans-serif", size: 11, color: "#1E293B" },
  title_font: { size: 15 },
  margin: { l: 56, r: 24, t: 64, b: 64 },
};

const PLOTLY_CONFIG = { responsive: true, displayModeBar: false, staticPlot: true };

function monthTickLayout() {
  return { tickmode: "array", tickvals: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] };
}

function yearTickLayout() {
  const vals = [];
  for (let y = startYear; y <= endYear; y++) vals.push(y);
  return { tickmode: "array", tickvals: vals, tickangle: -45 };
}

/** Render a dual-bar chart (side-by-side bars per x value). */
function dualBar({ divId, title, xA, yA, xB, yB, nameA, nameB, xaxis, yaxis }) {
  const traces = [
    {
      type: "bar",
      x: xA.map((v) => v - 0.2),
      y: yA,
      width: 0.4,
      name: nameA,
      marker: { color: COLORS.a.bar, line: { color: COLORS.a.border, width: 1 } },
    },
    {
      type: "bar",
      x: xB.map((v) => v + 0.2),
      y: yB,
      width: 0.4,
      name: nameB,
      marker: { color: COLORS.b.bar, line: { color: COLORS.b.border, width: 1 } },
    },
  ];
  const layout = {
    ...PLOTLY_LAYOUT_BASE,
    title,
    xaxis: { title: xaxis, ...monthTickLayout() },
    yaxis: { title: yaxis },
  };
  Plotly.react(divId, traces, layout, PLOTLY_CONFIG);
}

/** Render a dual-bar chart with numeric year x-axis + optional average lines. */
function dualBarYearly({
  divId, title, dataA, dataB, nameA, nameB,
  yaxis, avgA, avgB,
}) {
  const xA = dataA.map((d) => d.year);
  const yA = dataA.map((d) => d.value ?? d.count ?? 0);
  const xB = dataB.map((d) => d.year);
  const yB = dataB.map((d) => d.value ?? d.count ?? 0);
  const years = xA.length ? xA : xB;

  const traces = [
    {
      type: "bar",
      x: xA.map((v) => v - 0.2),
      y: yA,
      width: 0.4,
      name: nameA,
      marker: { color: COLORS.a.bar, line: { color: COLORS.a.border, width: 1 } },
    },
    {
      type: "bar",
      x: xB.map((v) => v + 0.2),
      y: yB,
      width: 0.4,
      name: nameB,
      marker: { color: COLORS.b.bar, line: { color: COLORS.b.border, width: 1 } },
    },
  ];

  if (avgA != null) {
    traces.push({
      type: "scatter", mode: "lines",
      x: years, y: years.map(() => avgA),
      name: `${nameA} ${t("ui_avg_label", lang)}`,
      line: { color: COLORS.a.dash, width: 2, dash: "dash" },
    });
  }
  if (avgB != null) {
    traces.push({
      type: "scatter", mode: "lines",
      x: years, y: years.map(() => avgB),
      name: `${nameB} ${t("ui_avg_label", lang)}`,
      line: { color: COLORS.b.dash, width: 2, dash: "dash" },
    });
  }

  const layout = {
    ...PLOTLY_LAYOUT_BASE,
    title,
    xaxis: { title: t("xlabel_year", lang), ...yearTickLayout() },
    yaxis: { title: yaxis },
  };
  Plotly.react(divId, traces, layout, PLOTLY_CONFIG);
}

// ---------------------------------------------------------------------------
// Chart definitions
// ---------------------------------------------------------------------------
function renderTemperatureCharts(aggA, aggB, nameA, nameB) {
  // 1. Hot days per year (>=20°C)
  dualBarYearly({
    divId: "chart-hot-days",
    title: t("title_20_degree_days", lang),
    dataA: aggA.yearly.hot_days,
    dataB: aggB.yearly.hot_days,
    nameA, nameB,
    yaxis: "",
    avgA: mean(aggA.yearly.hot_days.map((d) => d.count)),
    avgB: mean(aggB.yearly.hot_days.map((d) => d.count)),
  });

  // 2. Below-zero days per year
  dualBarYearly({
    divId: "chart-bz-days",
    title: t("title_below_zero_days", lang),
    dataA: aggA.yearly.below_zero_days,
    dataB: aggB.yearly.below_zero_days,
    nameA, nameB,
    yaxis: "",
    avgA: mean(aggA.yearly.below_zero_days.map((d) => d.count)),
    avgB: mean(aggB.yearly.below_zero_days.map((d) => d.count)),
  });

  // 3. Monthly avg temperature (bar)
  dualBar({
    divId: "chart-monthly-temp",
    title: t("title_monthly_temperature", lang),
    xA: aggA.monthly.temperature_avg.map((d) => d.month),
    yA: aggA.monthly.temperature_avg.map((d) => d.value),
    xB: aggB.monthly.temperature_avg.map((d) => d.month),
    yB: aggB.monthly.temperature_avg.map((d) => d.value),
    nameA, nameB,
    xaxis: t("xlabel_month", lang),
    yaxis: t("ylabel_temperature", lang),
  });

  // 4. Monthly min/max temperature (line with fill)
  const minMaxA = aggA.monthly.temperature_min_max;
  const minMaxB = aggB.monthly.temperature_min_max;
  const months12 = minMaxA.map((d) => d.month);
  const minMaxTraces = [
    {
      type: "scatter", mode: "lines+markers",
      x: months12, y: minMaxA.map((d) => d.min),
      name: `${nameA} ${t("ui_min_label", lang)}`,
      line: { color: COLORS.a.border, width: 2 },
    },
    {
      type: "scatter", mode: "lines+markers",
      x: months12, y: minMaxA.map((d) => d.max),
      name: `${nameA} ${t("ui_max_label", lang)}`,
      line: { color: COLORS.a.border, width: 2 },
      fill: "tonexty", fillcolor: COLORS.a.fill,
    },
    {
      type: "scatter", mode: "lines+markers",
      x: months12, y: minMaxB.map((d) => d.min),
      name: `${nameB} ${t("ui_min_label", lang)}`,
      line: { color: COLORS.b.border, width: 2 },
    },
    {
      type: "scatter", mode: "lines+markers",
      x: months12, y: minMaxB.map((d) => d.max),
      name: `${nameB} ${t("ui_max_label", lang)}`,
      line: { color: COLORS.b.border, width: 2 },
      fill: "tonexty", fillcolor: COLORS.b.fill,
    },
  ];
  Plotly.react("chart-monthly-minmax", minMaxTraces, {
    ...PLOTLY_LAYOUT_BASE,
    title: t("title_monthly_min_max_temperature", lang),
    xaxis: { title: t("xlabel_month", lang), ...monthTickLayout() },
    yaxis: { title: t("ylabel_temperature", lang) },
  }, PLOTLY_CONFIG);

  // 5. Yearly avg temperature (bar + avg lines)
  const yearlyTempA = aggA.yearly.temperature_avg;
  const yearlyTempB = aggB.yearly.temperature_avg;
  dualBarYearly({
    divId: "chart-yearly-temp",
    title: t("title_yearly_temperature", lang),
    dataA: yearlyTempA,
    dataB: yearlyTempB,
    nameA, nameB,
    yaxis: t("ylabel_temperature", lang),
    avgA: mean(yearlyTempA.map((d) => d.value)),
    avgB: mean(yearlyTempB.map((d) => d.value)),
  });

  // 6. Temperature threshold percentages (grouped bar)
  const threshLabels = aggA.threshold_percentages.map((d) => `>= ${d.threshold}°C`);
  Plotly.react("chart-thresholds", [
    {
      type: "bar",
      x: threshLabels,
      y: aggA.threshold_percentages.map((d) => d.percentage),
      name: nameA,
      marker: { color: COLORS.a.bar, line: { color: COLORS.a.border, width: 1 } },
    },
    {
      type: "bar",
      x: threshLabels,
      y: aggB.threshold_percentages.map((d) => d.percentage),
      name: nameB,
      marker: { color: COLORS.b.bar, line: { color: COLORS.b.border, width: 1 } },
    },
  ], {
    ...PLOTLY_LAYOUT_BASE,
    title: t("title_temperature_max_threshold_percentages", lang),
    xaxis: { title: t("xlabel_temperature_threshold", lang) },
    yaxis: { title: t("ylabel_percentage_days", lang) },
    barmode: "group",
  }, PLOTLY_CONFIG);
}

function renderSunCharts(aggA, aggB, nameA, nameB) {
  // 7. Monthly avg sun hours (bar)
  dualBar({
    divId: "chart-monthly-sun",
    title: t("title_monthly_sun_hours", lang),
    xA: aggA.monthly.sun_hours.map((d) => d.month),
    yA: aggA.monthly.sun_hours.map((d) => d.value),
    xB: aggB.monthly.sun_hours.map((d) => d.month),
    yB: aggB.monthly.sun_hours.map((d) => d.value),
    nameA, nameB,
    xaxis: t("xlabel_month", lang),
    yaxis: t("ylabel_sun_hours", lang),
  });

  // 8. Sun hours time series (line by year-month sequence)
  const symA = aggA.sun_hours_by_year_month;
  const symB = aggB.sun_hours_by_year_month;
  Plotly.react("chart-sun-timeseries", [
    {
      type: "scatter", mode: "lines",
      x: symA.map((d) => d.year_and_month),
      y: symA.map((d) => d.value),
      name: nameA,
      line: { color: COLORS.a.bar, width: 2 },
    },
    {
      type: "scatter", mode: "lines",
      x: symB.map((d) => d.year_and_month),
      y: symB.map((d) => d.value),
      name: nameB,
      line: { color: COLORS.b.bar, width: 2 },
    },
  ], {
    ...PLOTLY_LAYOUT_BASE,
    title: t("title_sun_hours_by_month", lang),
    xaxis: { title: `${t("xlabel_month_sequence", lang)} ${startYear}–${endYear}` },
    yaxis: { title: t("ylabel_sun_hours", lang) },
    margin: { ...PLOTLY_LAYOUT_BASE.margin, b: 80 },
  }, PLOTLY_CONFIG);

  // 9. Yearly sun hours (bar + avg)
  const yearlySunA = aggA.yearly.sun_hours;
  const yearlySunB = aggB.yearly.sun_hours;
  dualBarYearly({
    divId: "chart-yearly-sun",
    title: t("title_yearly_sun_hours", lang),
    dataA: yearlySunA,
    dataB: yearlySunB,
    nameA, nameB,
    yaxis: t("ylabel_sun_hours", lang),
    avgA: mean(yearlySunA.map((d) => d.value)),
    avgB: mean(yearlySunB.map((d) => d.value)),
  });

  // 10. Days without sun per month
  dualBar({
    divId: "chart-nosun-days",
    title: t("title_days_without_sun", lang),
    xA: aggA.monthly.days_without_sun.map((d) => d.month),
    yA: aggA.monthly.days_without_sun.map((d) => d.value),
    xB: aggB.monthly.days_without_sun.map((d) => d.month),
    yB: aggB.monthly.days_without_sun.map((d) => d.value),
    nameA, nameB,
    xaxis: t("xlabel_month", lang),
    yaxis: t("ylabel_days", lang),
  });
}

function renderPrecipitationCharts(aggA, aggB, nameA, nameB) {
  // 11. Monthly avg precipitation (bar)
  dualBar({
    divId: "chart-monthly-prec",
    title: t("title_monthly_precipitation", lang),
    xA: aggA.monthly.precipitation.map((d) => d.month),
    yA: aggA.monthly.precipitation.map((d) => d.value),
    xB: aggB.monthly.precipitation.map((d) => d.month),
    yB: aggB.monthly.precipitation.map((d) => d.value),
    nameA, nameB,
    xaxis: t("xlabel_month", lang),
    yaxis: t("ylabel_precipitation", lang),
  });

  // 12. Monthly rainy-day counts (bar)
  dualBar({
    divId: "chart-monthly-raindays",
    title: t("title_days_with_precipitation", lang),
    xA: aggA.monthly.days_with_precipitation.map((d) => d.month),
    yA: aggA.monthly.days_with_precipitation.map((d) => d.value),
    xB: aggB.monthly.days_with_precipitation.map((d) => d.month),
    yB: aggB.monthly.days_with_precipitation.map((d) => d.value),
    nameA, nameB,
    xaxis: t("xlabel_month", lang),
    yaxis: t("ylabel_days", lang),
  });

  // 13. Yearly rainy-day counts (bar + avg)
  const yearlyRainyA = aggA.yearly.rainy_days;
  const yearlyRainyB = aggB.yearly.rainy_days;
  dualBarYearly({
    divId: "chart-yearly-raindays",
    title: t("title_yearly_precipitation_days", lang),
    dataA: yearlyRainyA,
    dataB: yearlyRainyB,
    nameA, nameB,
    yaxis: t("ylabel_days", lang),
    avgA: mean(yearlyRainyA.map((d) => d.count)),
    avgB: mean(yearlyRainyB.map((d) => d.count)),
  });

  // 14. Yearly total precipitation (bar + avg)
  const yearlyPrecA = aggA.yearly.precipitation;
  const yearlyPrecB = aggB.yearly.precipitation;
  dualBarYearly({
    divId: "chart-yearly-prec",
    title: t("title_yearly_precipitation", lang),
    dataA: yearlyPrecA,
    dataB: yearlyPrecB,
    nameA, nameB,
    yaxis: t("ylabel_precipitation", lang),
    avgA: mean(yearlyPrecA.map((d) => d.value)),
    avgB: mean(yearlyPrecB.map((d) => d.value)),
  });
}

function renderWindCharts(aggA, aggB, nameA, nameB) {
  // 15. Monthly avg wind (bar)
  dualBar({
    divId: "chart-monthly-wind",
    title: t("title_monthly_wind", lang),
    xA: aggA.monthly.wind.map((d) => d.month),
    yA: aggA.monthly.wind.map((d) => d.value),
    xB: aggB.monthly.wind.map((d) => d.month),
    yB: aggB.monthly.wind.map((d) => d.value),
    nameA, nameB,
    xaxis: t("xlabel_month", lang),
    yaxis: t("ylabel_wind", lang),
  });
}

// ---------------------------------------------------------------------------
// Quality warnings
// ---------------------------------------------------------------------------
function showWarnings(cityA, cityB) {
  const warnEl = $("quality-warnings");
  if (!warnEl) return;
  const warnings = [];
  for (const city of [cityA, cityB]) {
    if (city && city.missing_days > 5) {
      const name = lang === "en" ? city.name_en : city.name_is;
      warnings.push(t("ui_warning_missing", lang, { city: name, days: city.missing_days }));
    }
  }
  warnEl.textContent = warnings.join(" ");
  warnEl.hidden = warnings.length === 0;
}

// ---------------------------------------------------------------------------
// Main render
// ---------------------------------------------------------------------------
async function render() {
  if (!cityASlug || !cityBSlug) {
    $("charts-area").hidden = true;
    $("placeholder").hidden = false;
    return;
  }

  const status = $("status");
  status.textContent = t("ui_loading", lang);
  status.hidden = false;
  $("charts-area").hidden = true;
  $("placeholder").hidden = true;

  try {
    const [aggA, aggB] = await Promise.all([
      getAggregations(cityASlug),
      getAggregations(cityBSlug),
    ]);

    const metaA = citiesMeta.find((c) => c.slug === cityASlug);
    const metaB = citiesMeta.find((c) => c.slug === cityBSlug);
    const nameA = lang === "en" ? metaA.name_en : metaA.name_is;
    const nameB = lang === "en" ? metaB.name_en : metaB.name_is;

    showWarnings(metaA, metaB);

    renderTemperatureCharts(aggA, aggB, nameA, nameB);
    renderSunCharts(aggA, aggB, nameA, nameB);
    renderPrecipitationCharts(aggA, aggB, nameA, nameB);
    renderWindCharts(aggA, aggB, nameA, nameB);

    status.hidden = true;
    $("charts-area").hidden = false;
  } catch (err) {
    status.textContent = `Villa: ${err.message}`;
  }
}

// ---------------------------------------------------------------------------
// Ranking view
// ---------------------------------------------------------------------------
const RANK_COLUMNS = [
  { key: "name",          i18n: "ui_col_city",          type: "string", sticky: true },
  { key: "country",       i18n: "ui_col_country",       type: "string" },
  { key: "temp_avg",      i18n: "ui_col_temp_avg",      type: "number", digits: 1 },
  { key: "hot_days",      i18n: "ui_col_hot_days",      type: "number", digits: 0 },
  { key: "bz_days",       i18n: "ui_col_bz_days",       type: "number", digits: 0 },
  { key: "sun_hours",     i18n: "ui_col_sun_hours",     type: "number", digits: 0 },
  { key: "precipitation", i18n: "ui_col_precipitation", type: "number", digits: 0 },
  { key: "rainy_days",    i18n: "ui_col_rainy_days",    type: "number", digits: 0 },
  { key: "wind",          i18n: "ui_col_wind",          type: "number", digits: 1 },
];

function meanOf(arr) {
  const nums = arr.filter((v) => v != null && Number.isFinite(v));
  if (!nums.length) return null;
  return nums.reduce((s, v) => s + v, 0) / nums.length;
}

function cityRankMetrics(agg, meta) {
  const countryName = lang === "en"
    ? (meta.country === "IS" ? "Iceland" : "Sweden")
    : (meta.country === "IS" ? "Ísland" : "Svíþjóð");
  return {
    slug: meta.slug,
    name: lang === "en" ? meta.name_en : meta.name_is,
    country: countryName,
    temp_avg:      meanOf(agg.yearly.temperature_avg.map((d) => d.value)),
    hot_days:      meanOf(agg.yearly.hot_days.map((d) => d.count)),
    bz_days:       meanOf(agg.yearly.below_zero_days.map((d) => d.count)),
    sun_hours:     meanOf(agg.yearly.sun_hours.map((d) => d.value)),
    precipitation: meanOf(agg.yearly.precipitation.map((d) => d.value)),
    rainy_days:    meanOf(agg.yearly.rainy_days.map((d) => d.count)),
    wind:          meanOf(agg.monthly.wind.map((d) => d.value)),
  };
}

async function renderRanking() {
  const status = $("ranking-status");
  const table = $("ranking-table");
  status.textContent = t("ui_loading", lang);
  status.hidden = false;
  table.hidden = true;

  try {
    const rows = await Promise.all(
      citiesMeta.map(async (meta) => {
        const agg = await getAggregations(meta.slug);
        return cityRankMetrics(agg, meta);
      })
    );

    // Sort
    const col = RANK_COLUMNS.find((c) => c.key === rankSort.key) || RANK_COLUMNS[0];
    rows.sort((a, b) => {
      const va = a[rankSort.key];
      const vb = b[rankSort.key];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      const cmp = col.type === "string"
        ? String(va).localeCompare(String(vb), lang === "en" ? "en" : "is")
        : va - vb;
      return rankSort.dir === "asc" ? cmp : -cmp;
    });

    // Render header
    const head = $("ranking-head");
    head.innerHTML = "";
    for (const c of RANK_COLUMNS) {
      const th = document.createElement("th");
      th.dataset.key = c.key;
      th.textContent = t(c.i18n, lang);
      if (c.type === "number") th.classList.add("num");
      if (c.sticky) th.classList.add("sticky-col");
      if (rankSort.key === c.key) {
        th.classList.add(rankSort.dir === "asc" ? "sort-asc" : "sort-desc");
      }
      th.addEventListener("click", () => {
        if (rankSort.key === c.key) {
          rankSort.dir = rankSort.dir === "asc" ? "desc" : "asc";
        } else {
          rankSort.key = c.key;
          // Numeric columns default to descending (highest first)
          rankSort.dir = c.type === "number" ? "desc" : "asc";
        }
        renderRanking();
      });
      head.appendChild(th);
    }

    // Render body
    const body = $("ranking-body");
    body.innerHTML = "";
    for (const row of rows) {
      const tr = document.createElement("tr");
      for (const c of RANK_COLUMNS) {
        const td = document.createElement("td");
        const val = row[c.key];
        if (c.type === "number") {
          td.classList.add("num");
          td.textContent = val == null ? "–" : val.toFixed(c.digits);
        } else {
          td.textContent = val ?? "–";
        }
        if (c.sticky) td.classList.add("sticky-col");
        tr.appendChild(td);
      }
      body.appendChild(tr);
    }

    table.hidden = false;
    status.hidden = true;
  } catch (err) {
    status.textContent = `Villa: ${err.message}`;
  }
}

function setActiveTab(name) {
  activeTab = name;
  const compareBtn = $("tab-compare");
  const rankingBtn = $("tab-ranking");
  compareBtn.classList.toggle("tab-active", name === "compare");
  rankingBtn.classList.toggle("tab-active", name === "ranking");
  compareBtn.setAttribute("aria-selected", String(name === "compare"));
  rankingBtn.setAttribute("aria-selected", String(name === "ranking"));
  $("view-compare").hidden = name !== "compare";
  $("view-ranking").hidden = name !== "ranking";
  $("controls-compare").hidden = name !== "compare";
  if (name === "ranking") renderRanking();
}

// ---------------------------------------------------------------------------
// UI — populate city selects
// ---------------------------------------------------------------------------
function populateSelects(cities) {
  const selectA = $("city-a");
  const selectB = $("city-b");

  // Sort: IS first, then SE; alphabetically within each group
  const sorted = [...cities].sort((a, b) => {
    if (a.country !== b.country) return a.country === "IS" ? -1 : 1;
    const nameA = a.name_is.toLowerCase();
    const nameB = b.name_is.toLowerCase();
    return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
  });

  for (const sel of [selectA, selectB]) {
    // Clear except the placeholder option
    while (sel.options.length > 1) sel.remove(1);

    let lastCountry = null;
    for (const city of sorted) {
      if (city.country !== lastCountry) {
        const grp = document.createElement("optgroup");
        grp.label = lang === "en"
          ? (city.country === "IS" ? "Iceland" : "Sweden")
          : (city.country === "IS" ? "Ísland" : "Svíþjóð");
        sel.appendChild(grp);
        lastCountry = city.country;
      }
      const opt = document.createElement("option");
      opt.value = city.slug;
      opt.textContent = lang === "en" ? city.name_en : city.name_is;
      sel.lastChild.appendChild(opt);
    }
  }
}

// ---------------------------------------------------------------------------
// UI — update all translatable text
// ---------------------------------------------------------------------------
function applyLang() {
  // Section headings
  for (const el of document.querySelectorAll("[data-i18n]")) {
    el.textContent = t(el.dataset.i18n, lang);
  }
  // Select placeholder options
  const selectA = $("city-a");
  const selectB = $("city-b");
  if (selectA.options[0]) selectA.options[0].textContent = t("ui_pick_city_a", lang);
  if (selectB.options[0]) selectB.options[0].textContent = t("ui_pick_city_b", lang);

  // Language toggle button label shows the OTHER language
  $("lang-toggle").textContent = lang === "is" ? "EN" : "IS";

  // Repopulate optgroups (country names change)
  if (citiesMeta.length) populateSelects(citiesMeta);

  // Re-render the active view
  if (activeTab === "ranking") {
    if (citiesMeta.length) renderRanking();
  } else if (cityASlug && cityBSlug) {
    render();
  }
}

/** Re-render whichever view is currently active (used by year-range changes). */
function renderActive() {
  if (activeTab === "ranking") renderRanking();
  else render();
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
async function init() {
  // Bind controls
  $("city-a").addEventListener("change", (e) => {
    cityASlug = e.target.value || null;
    render();
  });
  $("city-b").addEventListener("change", (e) => {
    cityBSlug = e.target.value || null;
    render();
  });
  $("start-year").addEventListener("change", (e) => {
    startYear = parseInt(e.target.value, 10);
    // Invalidate summary cache if range changed from default
    summaryCache.clear();
    renderActive();
  });
  $("end-year").addEventListener("change", (e) => {
    endYear = parseInt(e.target.value, 10);
    summaryCache.clear();
    renderActive();
  });
  $("lang-toggle").addEventListener("click", () => {
    lang = lang === "is" ? "en" : "is";
    applyLang();
  });
  $("tab-compare").addEventListener("click", () => setActiveTab("compare"));
  $("tab-ranking").addEventListener("click", () => setActiveTab("ranking"));

  // Load cities manifest
  try {
    const cities = await loadCities();
    populateSelects(cities);
    applyLang();
    $("placeholder").hidden = false;
  } catch (err) {
    $("status").textContent = `Villa við að hlaða borgarlista: ${err.message}`;
    $("status").hidden = false;
  }
}

document.addEventListener("DOMContentLoaded", init);
