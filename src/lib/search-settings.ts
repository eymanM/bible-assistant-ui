export type SearchSettings = {
  oldTestament: boolean;
  newTestament: boolean;
  commentary: boolean;
  insights: boolean;
  media: boolean;
  sourceOrder?: string[];
};

export const DEFAULT_SEARCH_SETTINGS: SearchSettings = {
  oldTestament: true,
  newTestament: true,
  commentary: false,
  insights: true,
  media: false,
  sourceOrder: ['insights', 'oldTestament', 'newTestament', 'commentary', 'media']
};

export const SEARCH_SETTINGS_KEYS = [
  'oldTestament',
  'newTestament',
  'commentary',
  'insights',
  'media',
  'sourceOrder'
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
  return SEARCH_SETTINGS_KEYS.every(key => {
    if (key === 'sourceOrder') {
       return JSON.stringify(a[key]) === JSON.stringify(b[key]);
    }
    return a[key] === b[key];
  });
}
