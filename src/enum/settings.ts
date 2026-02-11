// Type-safe constants using 'as const' (compatible with erasableSyntaxOnly)

export const RollSize = {
    SIZE_57MM: '57mm',
    SIZE_80MM: '80mm',
    SIZE_76MM: '76mm',
    SIZE_58MM: '58mm'
} as const;

export const FontSize = {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large',
    EXTRA_LARGE: 'extra-large'
} as const;

export const Language = {
    ENGLISH: 'english',
    SPANISH: 'spanish',
    FRENCH: 'french',
    GERMAN: 'german',
    CHINESE: 'chinese',
    SINHALA: 'sinhala'
} as const;

export const SettingsTab = {
    PRINT: 'print',
    POS: 'pos'
} as const;
