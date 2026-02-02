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

export const Timezone = {
    UTC: 'UTC',
    EST: 'EST',
    CST: 'CST',
    PST: 'PST',
    GMT: 'GMT'
} as const;

export const DateFormat = {
    DD_MM_YYYY: 'DD/MM/YYYY',
    MM_DD_YYYY: 'MM/DD/YYYY',
    YYYY_MM_DD: 'YYYY-MM-DD'
} as const;

export const TimeFormat = {
    TWELVE_HOUR: '12-hour',
    TWENTY_FOUR_HOUR: '24-hour'
} as const;

export const Theme = {
    LIGHT: 'light',
    DARK: 'dark',
    AUTO: 'auto'
} as const;

export const BackupFrequency = {
    HOURLY: 'hourly',
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly'
} as const;

export const SettingsTab = {
    PRINT: 'print',
    POS: 'pos',
    SYSTEM: 'system',
    PAYMENT: 'payment'
} as const;
