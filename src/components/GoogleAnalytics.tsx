import { GoogleAnalytics as NextGoogleAnalytics } from '@next/third-parties/google'

export default function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  
  if (!measurementId) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Google Analytics Measurement ID not found - analytics will not work')
    }
    return null
  }

  // Only render in production or when explicitly enabled in development
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_ENABLE_ANALYTICS) {
    return null
  }

  return <NextGoogleAnalytics gaId={measurementId} />
}