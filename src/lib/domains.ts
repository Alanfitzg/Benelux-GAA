// Domain configuration for PlayAway
export const DOMAINS = {
  primary: 'playawaygaa.com',
  secondary: 'playgaaaway.com',
  all: [
    'playawaygaa.com',
    'www.playawaygaa.com',
    'playgaaaway.com',
    'www.playgaaaway.com',
  ],
  development: 'localhost:3000',
}

// Get the current domain from the request or window
export function getCurrentDomain(): string {
  if (typeof window !== 'undefined') {
    return window.location.hostname
  }
  
  // For server-side, you might need to get this from headers
  // This will be set by the middleware
  return process.env.NEXTAUTH_URL?.replace(/https?:\/\//, '') || DOMAINS.development
}

// Check if we're on a production domain
export function isProductionDomain(domain?: string): boolean {
  const currentDomain = domain || getCurrentDomain()
  return DOMAINS.all.some(d => currentDomain.includes(d))
}

// Get the full URL for the current domain
export function getBaseUrl(request?: Request): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  if (request) {
    const host = request.headers.get('host') || DOMAINS.primary
    const protocol = request.url.startsWith('https') ? 'https' : 'http'
    return `${protocol}://${host}`
  }
  
  // Fallback to environment variable or primary domain
  return process.env.NEXTAUTH_URL || `https://${DOMAINS.primary}`
}