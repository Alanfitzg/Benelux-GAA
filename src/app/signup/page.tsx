"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { signIn } from "next-auth/react";
import PasswordRequirements from "@/components/auth/PasswordRequirements";
import PasswordStrengthMeter from "@/components/auth/PasswordStrengthMeter";
import UsernameRequirements from "@/components/auth/UsernameRequirements";
import { passwordSchema, usernameSchema } from "@/lib/validation/schemas";

export default function SignUp() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showUsernameRequirements, setShowUsernameRequirements] = useState(false);
  const [usernameErrors, setUsernameErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if form is valid for submission
  const isFormValid = () => {
    return (
      formData.email &&
      formData.username &&
      formData.password &&
      formData.confirmPassword &&
      passwordErrors.length === 0 &&
      usernameErrors.length === 0 &&
      formData.password === formData.confirmPassword
    );
  };
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time password validation
    if (name === 'password') {
      validatePassword(value);
    }
    
    // Real-time username validation
    if (name === 'username') {
      validateUsername(value);
    }
  };

  const validatePassword = (password: string) => {
    try {
      passwordSchema.parse(password);
      setPasswordErrors([]);
    } catch (error) {
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as { errors: Array<{ message: string }> };
        setPasswordErrors(zodError.errors.map((err) => err.message));
      }
    }
  };

  const validateUsername = (username: string) => {
    try {
      usernameSchema.parse(username);
      setUsernameErrors([]);
    } catch (error) {
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as { errors: Array<{ message: string }> };
        setUsernameErrors(zodError.errors.map((err) => err.message));
      }
    }
  };

  const handlePasswordFocus = () => {
    setShowPasswordRequirements(true);
  };

  const handlePasswordBlur = () => {
    // Keep requirements visible if there are errors or password is not empty
    if (!formData.password || passwordErrors.length === 0) {
      setShowPasswordRequirements(false);
    }
  };

  const handleUsernameFocus = () => {
    setShowUsernameRequirements(true);
  };

  const handleUsernameBlur = () => {
    // Keep requirements visible if there are errors or username is not empty
    if (!formData.username || usernameErrors.length === 0) {
      setShowUsernameRequirements(false);
    }
  };


  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate username against schema
    try {
      usernameSchema.parse(formData.username);
    } catch (error) {
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as { errors: Array<{ message: string }> };
        if (zodError.errors && zodError.errors.length > 0) {
          setError(zodError.errors[0].message);
          setIsLoading(false);
          return;
        }
      }
    }

    // Validate password against schema
    try {
      passwordSchema.parse(formData.password);
    } catch (error) {
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as { errors: Array<{ message: string }> };
        if (zodError.errors && zodError.errors.length > 0) {
          setError(zodError.errors[0].message);
          setIsLoading(false);
          return;
        }
      }
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          name: formData.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle both simple string errors and complex error objects
        let errorMessage = "Failed to create account";
        if (typeof data.error === 'string') {
          errorMessage = data.error;
        } else if (data.error && typeof data.error === 'object' && data.error.message) {
          errorMessage = data.error.message;
        }
        setError(errorMessage);
      } else {
        // Registration successful - now automatically sign in the user
        try {
          const signInResult = await signIn("credentials", {
            username: formData.username.toLowerCase().trim(),
            password: formData.password,
            redirect: false,
          });

          if (signInResult?.error) {
            // Auto sign-in failed - redirect to signin page
            router.push('/signin?registered=true');
          } else {
            // Sign in successful - check for redirect path or go home with welcome
            const redirectPath = typeof window !== 'undefined' ? sessionStorage.getItem('redirectAfterSignIn') : null;
            
            if (redirectPath) {
              sessionStorage.removeItem('redirectAfterSignIn');
              router.push(redirectPath);
            } else {
              // Redirect to home with welcome message
              router.push('/?welcome=true');
            }
            router.refresh();
          }
        } catch (signInError) {
          console.error('Auto sign-in exception:', signInError);
          // Fallback to signin page
          router.push('/signin?registered=true');
        }
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary-light to-secondary text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4">
              Join the Global GAA Community
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Connect with Gaelic clubs worldwide, discover tournaments, and be part of the international GAA family.
            </p>
          </motion.div>
        </div>
        {/* Animated background shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-light/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float"></div>
      </div>

      {/* Form Section */}
      <div className="relative -mt-12 px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-professional-lg border border-gray-200/50 overflow-hidden">
            <div className="p-8 md:p-12">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Create Your Account
                </h2>
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/signin"
                    className="text-primary font-semibold hover:text-primary-dark transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-center space-x-3"
                >
                  <span className="text-red-500">⚠️</span>
                  <span>{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="md:col-span-2"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      required
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                    />
                  </motion.div>

                  {/* Username */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleInputChange}
                      onFocus={handleUsernameFocus}
                      onBlur={handleUsernameBlur}
                      placeholder="Choose a username"
                      required
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                    />
                    <UsernameRequirements 
                      username={formData.username} 
                      isVisible={showUsernameRequirements || (formData.username.length > 0 && usernameErrors.length > 0)}
                    />
                  </motion.div>

                  {/* Full Name */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Full Name <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                    />
                  </motion.div>

                  {/* Password */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        onFocus={handlePasswordFocus}
                        onBlur={handlePasswordBlur}
                        placeholder="Create a secure password"
                        required
                        className={`w-full border-2 rounded-xl px-4 py-4 pr-12 bg-gray-50/50 text-gray-900 focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500 ${
                          passwordErrors.length > 0 ? 'border-red-300 focus:border-red-400' : 
                          formData.password && passwordErrors.length === 0 ? 'border-green-300 focus:border-green-400' :
                          'border-gray-200 focus:border-primary'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21m-5.757-5.757a9.97 9.97 0 01-6.478 1.932" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    
                    {/* Password Strength Meter */}
                    <PasswordStrengthMeter 
                      password={formData.password} 
                      show={formData.password.length > 0}
                    />
                    
                    {/* Password Requirements */}
                    <PasswordRequirements 
                      password={formData.password}
                      show={showPasswordRequirements || passwordErrors.length > 0}
                    />
                  </motion.div>

                  {/* Confirm Password */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
                        required
                        className={`w-full border-2 rounded-xl px-4 py-4 pr-12 bg-gray-50/50 text-gray-900 focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500 ${
                          formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-300 focus:border-red-400' :
                          formData.confirmPassword && formData.password === formData.confirmPassword ? 'border-green-300 focus:border-green-400' :
                          'border-gray-200 focus:border-primary'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21m-5.757-5.757a9.97 9.97 0 01-6.478 1.932" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    
                    {/* Password Match Indicator */}
                    {formData.confirmPassword && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 flex items-center gap-2"
                      >
                        {formData.password === formData.confirmPassword ? (
                          <>
                            <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-sm text-green-600 font-medium">Passwords match</span>
                          </>
                        ) : (
                          <>
                            <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </div>
                            <span className="text-sm text-red-600">Passwords do not match</span>
                          </>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                </div>


                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="pt-6"
                >
                  <button
                    type="submit"
                    disabled={isLoading || !isFormValid()}
                    className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Account...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center space-x-2">
                        <span>Create Account</span>
                        <span>→</span>
                      </span>
                    )}
                  </button>
                </motion.div>

                {/* Divider */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85 }}
                  className="mt-6"
                >
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => signIn("google", { callbackUrl: "/" })}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span className="font-medium">Sign up with Google</span>
                    </button>
                  </div>
                </motion.div>

                {/* Terms */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-center text-sm text-gray-500"
                >
                  By creating an account, you agree to our{" "}
                  <Link href="/terms" className="text-primary hover:text-primary-dark transition-colors">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:text-primary-dark transition-colors">
                    Privacy Policy
                  </Link>
                </motion.div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}