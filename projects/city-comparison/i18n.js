/**
 * Translation table for UI labels and chart titles.
 * Ported from scripts/compare_with_pandas.py TRANSLATIONS dict.
 */
export const TRANSLATIONS = {
  // Chart titles
  title_20_degree_days: {
    is: "Fjöldi daga á ári þar sem hitinn fór í 20°C eða meira",
    en: "Number of days per year with temperatures of 20°C or higher",
  },
  title_below_zero_days: {
    is: "Fjöldi daga á ári þar sem hitinn fór undir 0°C",
    en: "Number of days per year with temperatures below 0°C",
  },
  title_monthly_sun_hours: {
    is: "Meðaltals sólskinsstundir fyrir hvern mánuð ársins",
    en: "Average sun hours for each month of the year",
  },
  title_sun_hours_by_month: {
    is: "Sólskinsstundir fyrir hvern mánuð",
    en: "Sun hours for each month",
  },
  title_monthly_temperature: {
    is: "Meðaltals hiti fyrir hvern mánuð ársins",
    en: "Average temperature for each month of the year",
  },
  title_monthly_min_max_temperature: {
    is: "Meðaltals lágmarks- og hámarkshiti fyrir hvern mánuð ársins",
    en: "Average min and max temperature for each month of the year",
  },
  title_yearly_temperature: {
    is: "Meðaltals hiti fyrir hvert ár",
    en: "Average temperature for each year",
  },
  title_monthly_wind: {
    is: "Meðalvindur fyrir hvern mánuð ársins",
    en: "Average wind speed for each month of the year",
  },
  title_monthly_precipitation: {
    is: "Meðaltals úrkoma fyrir hvern mánuð ársins",
    en: "Average precipitation for each month of the year",
  },
  title_days_without_sun: {
    is: "Meðaltals fjöldi daga án mældrar sólar fyrir hvern mánuð ársins",
    en: "Average number of days without measured sunshine for each month of the year",
  },
  title_yearly_sun_hours: {
    is: "Sólskinsstundir fyrir hvert ár",
    en: "Sun hours for each year",
  },
  title_days_with_precipitation: {
    is: "Meðaltals fjöldi daga með mældri úrkomu fyrir hvern mánuð ársins",
    en: "Average number of days with measured precipitation for each month of the year",
  },
  title_yearly_precipitation: {
    is: "Úrkoma fyrir hvert ár",
    en: "Precipitation for each year",
  },
  title_yearly_precipitation_days: {
    is: "Dagar með mældri úrkomu fyrir hvert ár",
    en: "Days with measured precipitation for each year",
  },
  title_temperature_max_threshold_percentages: {
    is: "Hlutfall daga þar sem hámarkshiti var jafnmikill eða hærri en viðmið",
    en: "Percentage of days where max temperature was at or above threshold",
  },

  // Axis labels
  xlabel_year: { is: "Ár", en: "Year" },
  xlabel_month: { is: "Mánuður árs", en: "Month of year" },
  xlabel_temperature_threshold: {
    is: "Hitastigsviðmið [°C]",
    en: "Temperature threshold [°C]",
  },
  xlabel_month_sequence: {
    is: "Summa sólskinsstunda í hverjum mánuði",
    en: "Sum of sun hours in each month",
  },
  ylabel_sun_hours: { is: "Sólskinsstundir [klst]", en: "Sun hours [hours]" },
  ylabel_temperature: { is: "Meðalhiti [°C]", en: "Average temperature [°C]" },
  ylabel_wind: { is: "Meðalvindur [m/s]", en: "Average wind speed [m/s]" },
  ylabel_days: { is: "Dagar", en: "Days" },
  ylabel_precipitation: { is: "Úrkoma [mm]", en: "Precipitation [mm]" },
  ylabel_percentage_days: {
    is: "Hlutfall daga [%]",
    en: "Percentage of days [%]",
  },

  // UI strings (not in Python script)
  ui_pick_city_a: { is: "Veldu borg A", en: "Select city A" },
  ui_pick_city_b: { is: "Veldu borg B", en: "Select city B" },
  ui_start_year: { is: "Frá ári", en: "Start year" },
  ui_end_year: { is: "Til árs", en: "End year" },
  ui_loading: { is: "Hleður gögn…", en: "Loading data…" },
  ui_pick_both: {
    is: "Veldu tvær borgir til að sjá samanburð.",
    en: "Select two cities to view comparison.",
  },
  ui_last_updated: { is: "Síðast uppfært", en: "Last updated" },
  ui_section_temperature: { is: "Hitastig", en: "Temperature" },
  ui_section_sun: { is: "Sólskin", en: "Sunshine" },
  ui_section_precipitation: { is: "Úrkoma", en: "Precipitation" },
  ui_section_wind: { is: "Vindur", en: "Wind" },
  ui_section_thresholds: { is: "Hitaviðmið", en: "Temperature thresholds" },
  ui_warning_missing: {
    is: "Athugið: {city} vantar {days} daga í gögnum.",
    en: "Note: {city} is missing {days} days of data.",
  },
  ui_lang_toggle: { is: "EN", en: "IS" },
  ui_avg_label: { is: "meðaltal", en: "average" },
  ui_min_label: { is: "lágm.", en: "min" },
  ui_max_label: { is: "hám.", en: "max" },
  ui_country_is: { is: "Ísland", en: "Iceland" },
  ui_country_se: { is: "Svíþjóð", en: "Sweden" },

  // Tabs
  ui_tab_compare: { is: "Samanburður", en: "Compare" },
  ui_tab_ranking: { is: "Listi", en: "Ranking" },

  // Ranking table column headers
  ui_col_city: { is: "Borg", en: "City" },
  ui_col_country: { is: "Land", en: "Country" },
  ui_col_temp_avg: { is: "Meðalhiti [°C]", en: "Avg temp [°C]" },
  ui_col_hot_days: { is: "Dagar ≥20°C", en: "Days ≥20°C" },
  ui_col_bz_days: { is: "Dagar <0°C", en: "Days <0°C" },
  ui_col_sun_hours: { is: "Sólskin [klst]", en: "Sun hours" },
  ui_col_precipitation: { is: "Úrkoma [mm]", en: "Precip [mm]" },
  ui_col_rainy_days: { is: "Úrkomudagar", en: "Rainy days" },
  ui_col_wind: { is: "Vindur [m/s]", en: "Wind [m/s]" },

  ui_col_hint: {
    is: "Öll gildi eru meðaltal á ári fyrir valið tímabil.",
    en: "All values are annual averages for the selected period.",
  },
};

/**
 * Get translated text. Falls back to Icelandic, then the key itself.
 * @param {string} key
 * @param {string} lang - "is" or "en"
 * @param {Object} [vars] - template variables for {placeholder} substitution
 */
export function t(key, lang = "is", vars = {}) {
  const entry = TRANSLATIONS[key];
  if (!entry) return key;
  let text = entry[lang] ?? entry["is"] ?? key;
  for (const [k, v] of Object.entries(vars)) {
    text = text.replace(`{${k}}`, v);
  }
  return text;
}
