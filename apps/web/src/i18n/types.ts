export type Locale = 'th' | 'en'

/** A namespace bundle: Thai (source of truth) + English translation, flat dotted keys. */
export interface Bundle {
  th: Record<string, string>
  en: Record<string, string>
}
