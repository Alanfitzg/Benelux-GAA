"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { getCookiePreferences, clearCookiePreferences } from "@/lib/cookies"

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

export default function CookiesPage() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  })
  const [hasConsent, setHasConsent] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const currentPrefs = getCookiePreferences()
    if (currentPrefs) {
      setPreferences(currentPrefs)
      setHasConsent(true)
    }
  }, [])

  const handlePreferenceChange = (type: keyof CookiePreferences, value: boolean) => {
    if (type === "necessary") return // Can't disable necessary cookies
    setPreferences(prev => ({ ...prev, [type]: value }))
  }

  const savePreferences = () => {
    const consentData = {
      timestamp: new Date().toISOString(),
      preferences,
      version: "1.0",
    }
    localStorage.setItem("cookie-consent", JSON.stringify(consentData))
    setHasConsent(true)
    setSaved(true)
    
    // Apply preferences immediately
    if (typeof window !== "undefined") {
      window.cookieConsent = preferences
    }

    setTimeout(() => setSaved(false), 3000)
  }

  const clearPreferences = () => {
    clearCookiePreferences()
    setPreferences({
      necessary: true,
      analytics: false,
      marketing: false,
    })
    setHasConsent(false)
    setSaved(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🍪 Cookie Settings
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Manage your cookie preferences and understand how we use cookies to improve your experience.
            </p>
          </div>

          {/* Status */}
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <p className="text-green-800 font-medium">✅ Your cookie preferences have been saved!</p>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cookie Settings */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Cookie Preferences</h2>
                
                {hasConsent ? (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800">
                      <strong>Current Status:</strong> You have set your cookie preferences.
                    </p>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">
                      <strong>No Preferences Set:</strong> Please configure your cookie settings below.
                    </p>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Necessary Cookies */}
                  <div className="p-6 bg-gray-50 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Necessary Cookies
                        </h3>
                        <p className="text-gray-600 mb-3">
                          These cookies are essential for the website to function properly. They enable core functionality 
                          such as security, network management, and accessibility.
                        </p>
                        <div className="text-sm text-gray-500">
                          <strong>Examples:</strong> Authentication tokens, session management, security settings
                        </div>
                      </div>
                      <div className="ml-6">
                        <div className="w-12 h-6 bg-primary rounded-full relative">
                          <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 text-center">Always On</div>
                      </div>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-primary/20 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Analytics Cookies
                        </h3>
                        <p className="text-gray-600 mb-3">
                          Help us understand how visitors interact with our website by collecting and reporting 
                          information anonymously. This helps us improve our website.
                        </p>
                        <div className="text-sm text-gray-500">
                          <strong>Examples:</strong> Page views, time spent, user interactions, error tracking
                        </div>
                      </div>
                      <div className="ml-6">
                        <button
                          onClick={() => handlePreferenceChange("analytics", !preferences.analytics)}
                          className={`w-12 h-6 rounded-full relative transition-colors ${
                            preferences.analytics ? "bg-primary" : "bg-gray-300"
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                            preferences.analytics ? "translate-x-6" : "translate-x-0.5"
                          }`}></div>
                        </button>
                        <div className="text-xs text-gray-500 mt-1 text-center">
                          {preferences.analytics ? "Enabled" : "Disabled"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-primary/20 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Marketing Cookies
                        </h3>
                        <p className="text-gray-600 mb-3">
                          Used to track visitors across websites. The intention is to display ads that are relevant 
                          and engaging for the individual user.
                        </p>
                        <div className="text-sm text-gray-500">
                          <strong>Examples:</strong> Advertising pixels, social media integrations, remarketing tags
                        </div>
                      </div>
                      <div className="ml-6">
                        <button
                          onClick={() => handlePreferenceChange("marketing", !preferences.marketing)}
                          className={`w-12 h-6 rounded-full relative transition-colors ${
                            preferences.marketing ? "bg-primary" : "bg-gray-300"
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                            preferences.marketing ? "translate-x-6" : "translate-x-0.5"
                          }`}></div>
                        </button>
                        <div className="text-xs text-gray-500 mt-1 text-center">
                          {preferences.marketing ? "Enabled" : "Disabled"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <button
                    onClick={savePreferences}
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-semibold"
                  >
                    Save Preferences
                  </button>
                  <button
                    onClick={clearPreferences}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Reset to Defaults
                  </button>
                </div>
              </div>
            </div>

            {/* Information Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About Cookies</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Cookies are small text files that are placed on your computer by websites that you visit. 
                  They are widely used to make websites work more efficiently.
                </p>
                <Link 
                  href="/privacy"
                  className="text-primary hover:underline text-sm font-medium"
                >
                  Read our full Privacy Policy →
                </Link>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Rights</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li>• Change your preferences at any time</li>
                  <li>• Withdraw consent for non-essential cookies</li>
                  <li>• Request deletion of your data</li>
                  <li>• Access your personal information</li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h3>
                <p className="text-gray-600 text-sm">
                  If you have any questions about our use of cookies, please contact us 
                  through our privacy policy page.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}