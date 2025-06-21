export interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

export interface CookieConsent {
  timestamp: string
  preferences: CookiePreferences
  version: string
}

/**
 * Get current cookie preferences from localStorage
 */
export function getCookiePreferences(): CookiePreferences | null {
  if (typeof window === "undefined") return null
  
  try {
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) return null
    
    const data: CookieConsent = JSON.parse(consent)
    return data.preferences
  } catch {
    return null
  }
}

/**
 * Check if user has given consent for a specific cookie type
 */
export function hasConsent(type: keyof CookiePreferences): boolean {
  const preferences = getCookiePreferences()
  if (!preferences) return false
  
  return preferences[type]
}

/**
 * Check if user has made any cookie choice
 */
export function hasUserConsented(): boolean {
  return getCookiePreferences() !== null
}

/**
 * Clear all cookie preferences (for testing or reset)
 */
export function clearCookiePreferences(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("cookie-consent")
}

/**
 * Get consent timestamp
 */
export function getConsentTimestamp(): string | null {
  if (typeof window === "undefined") return null
  
  try {
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) return null
    
    const data: CookieConsent = JSON.parse(consent)
    return data.timestamp
  } catch {
    return null
  }
}

/**
 * Check if consent is older than specified days
 */
export function isConsentExpired(days: number = 365): boolean {
  const timestamp = getConsentTimestamp()
  if (!timestamp) return true
  
  const consentDate = new Date(timestamp)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - consentDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays > days
}

/**
 * Analytics helper - only track if user has consented
 */
export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  if (!hasConsent("analytics")) {
    console.log("Analytics tracking skipped - no consent")
    return
  }
  
  // Here you would integrate with your analytics service
  console.log("Track event:", eventName, properties)
  
  // Example for Google Analytics:
  // if (typeof gtag !== "undefined") {
  //   gtag("event", eventName, properties)
  // }
}

/**
 * Marketing helper - only set marketing cookies if user has consented
 */
export function setMarketingPixel(pixelId: string): void {
  if (!hasConsent("marketing")) {
    console.log("Marketing pixel skipped - no consent")
    return
  }
  
  // Here you would set marketing pixels
  console.log("Set marketing pixel:", pixelId)
}