"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAccountStatus } from "@/hooks/useAccountStatus"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [registrationInfo, setRegistrationInfo] = useState<{show: boolean, status?: string, message?: string}>({show: false})
  const { accountStatus, setAccountStatus, checkAccountStatus } = useAccountStatus()

  useEffect(() => {
    const registered = searchParams.get('registered')
    if (registered === 'true') {
      const status = searchParams.get('status')
      const message = searchParams.get('message')
      setRegistrationInfo({
        show: true,
        status: status || undefined,
        message: message || undefined
      })
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn("credentials", {
        username: username.toLowerCase().trim(),
        password,
        redirect: false,
      })

      if (result?.error) {
        // Check if the error might be due to account status
        const statusInfo = await checkAccountStatus(username);
        if (statusInfo) {
          setAccountStatus(statusInfo);
          setError("");
        } else {
          setError("Invalid username or password");
        }
      } else {
        // Check if there's a redirect path stored
        const redirectPath = sessionStorage.getItem('redirectAfterSignIn')
        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterSignIn')
          router.push(redirectPath)
        } else {
          router.push("/")
        }
        router.refresh()
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-white to-secondary/10">
      <div className="max-w-md w-full space-y-8 p-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {registrationInfo.show && (
            <div className={`rounded-lg p-4 border shadow-sm ${
              registrationInfo.status === 'APPROVED' 
                ? 'bg-green-50 border-green-200/50' 
                : 'bg-yellow-50 border-yellow-200/50'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className={`h-5 w-5 ${
                    registrationInfo.status === 'APPROVED' ? 'text-green-500' : 'text-yellow-500'
                  }`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-semibold ${
                    registrationInfo.status === 'APPROVED' ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    Account Created Successfully!
                  </h3>
                  <div className={`mt-1 text-sm ${
                    registrationInfo.status === 'APPROVED' ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    <p>{registrationInfo.message}</p>
                    {registrationInfo.status === 'PENDING' && (
                      <p className="mt-2">
                        <Link href="/account/status" className="font-semibold underline hover:text-yellow-600 transition-colors">
                          Check your account status anytime
                        </Link>
                      </p>
                    )}
                    {registrationInfo.status === 'APPROVED' && (
                      <p className="mt-2 font-medium">
                        You can now sign in below!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-200/50 shadow-sm">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}
          {accountStatus && (
            <div className={`rounded-lg p-4 shadow-sm ${
              accountStatus.status === 'PENDING' 
                ? 'bg-yellow-50 border border-yellow-200/50' 
                : 'bg-red-50 border border-red-200/50'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {accountStatus.status === 'PENDING' ? (
                    <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-semibold ${
                    accountStatus.status === 'PENDING' ? 'text-yellow-800' : 'text-red-800'
                  }`}>
                    {accountStatus.status === 'PENDING' ? 'Account Pending Approval' : 
                     accountStatus.status === 'REJECTED' ? 'Account Rejected' : 
                     'Account Suspended'}
                  </h3>
                  <div className={`mt-1 text-sm ${
                    accountStatus.status === 'PENDING' ? 'text-yellow-700' : 'text-red-700'
                  }`}>
                    <p>{accountStatus.message}</p>
                    {accountStatus.rejectionReason && (
                      <p className="mt-2"><strong>Reason:</strong> {accountStatus.rejectionReason}</p>
                    )}
                    {accountStatus.status === 'PENDING' && (
                      <p className="mt-2">
                        <Link href="/account/status" className="font-semibold underline hover:text-yellow-600 transition-colors">
                          Check your account status here
                        </Link>
                      </p>
                    )}
                    {accountStatus.status === 'REJECTED' && (
                      <p className="mt-2">
                        You can{" "}
                        <Link href="/signup" className="font-semibold underline hover:text-red-600 transition-colors">
                          create a new account
                        </Link>{" "}
                        or contact support for assistance.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                )}
              </span>
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignInForm />
    </Suspense>
  )
}