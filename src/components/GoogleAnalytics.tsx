import { GoogleAnalytics as NextGoogleAnalytics } from '@next/third-parties/google'

export default function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  
  if (!measurementId) {
    console.warn('Google Analytics Measurement ID not found')
    return null
  }

  return <NextGoogleAnalytics gaId={measurementId} />
}