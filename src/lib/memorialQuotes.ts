export const DEFAULT_MEMORIAL_QUOTE = 'Forever in our hearts'
export const CUSTOM_MEMORIAL_QUOTE = '__custom__'

export const MEMORIAL_QUOTE_OPTIONS = [
  DEFAULT_MEMORIAL_QUOTE,
  'Gone but never forgotten',
  'Always loved, never forgotten',
  'Until we meet again',
  'In loving memory',
  'Your light lives on in us',
]

export function getMemorialQuoteState(savedQuote?: string | null) {
  const trimmed = typeof savedQuote === 'string' ? savedQuote.trim() : ''

  if (!trimmed) {
    return {
      selectedQuoteOption: DEFAULT_MEMORIAL_QUOTE,
      customQuote: '',
    }
  }

  if (MEMORIAL_QUOTE_OPTIONS.includes(trimmed)) {
    return {
      selectedQuoteOption: trimmed,
      customQuote: '',
    }
  }

  return {
    selectedQuoteOption: CUSTOM_MEMORIAL_QUOTE,
    customQuote: trimmed,
  }
}

export function resolveMemorialQuote(selectedQuoteOption: string, customQuote: string) {
  if (selectedQuoteOption === CUSTOM_MEMORIAL_QUOTE) {
    const trimmedCustomQuote = customQuote.trim()
    return trimmedCustomQuote || DEFAULT_MEMORIAL_QUOTE
  }

  return selectedQuoteOption || DEFAULT_MEMORIAL_QUOTE
}
