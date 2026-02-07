export type SearchSettings = {
  oldTestament: boolean;
  newTestament: boolean;
  commentary: boolean;
  insights: boolean;
  media: boolean;
};

export const DEFAULT_SEARCH_SETTINGS: SearchSettings = {
  oldTestament: true,
  newTestament: true,
  commentary: false,
  insights: true,
  media: false
};

export const SEARCH_SETTINGS_KEYS = [
  'oldTestament',
  'newTestament',
  'commentary',
  'insights',
  'media'
] as const;

export function normalizeSearchSettings(
  settings?: Partial<SearchSettings> | null
): SearchSettings {
  return {
    ...DEFAULT_SEARCH_SETTINGS,
    ...(settings ?? {})
  };
}

export function areSearchSettingsEqual(a: SearchSettings, b: SearchSettings): boolean {
  return SEARCH_SETTINGS_KEYS.every(key => a[key] === b[key]);
}
