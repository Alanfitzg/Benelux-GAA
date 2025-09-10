"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SurveyFormProps {
  eventId?: string;
}

interface SurveyData {
  // Respondent Info
  role: string;
  clubName: string;
  country: string;
  city: string;

  // Travel History & Intent (simplified)
  travelFrequency: string;

  // Open-Ended Insight (combined)
  groupAndPreferences: string;

  // Contact Information
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

const INITIAL_DATA: SurveyData = {
  role: "",
  clubName: "",
  country: "",
  city: "",
  travelFrequency: "",
  groupAndPreferences: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
};

const COUNTRIES = [
  "Ireland",
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "Spain",
  "France",
  "Germany",
  "Netherlands",
  "Portugal",
  "Italy",
  "Argentina",
  "Other",
];


export default function SurveyForm({ eventId }: SurveyFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<SurveyData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 2;

  const updateData = (field: keyof SurveyData, value: string | string[]) => {
    setData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };


  const validateStep = (step: number): boolean => {
    const stepErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!data.role) stepErrors.role = "Please select your role";
        if (!data.country) stepErrors.country = "Please select your country";
        break;
      case 2:
        if (!data.contactName) stepErrors.contactName = "Name is required";
        if (!data.contactEmail) stepErrors.contactEmail = "Email is required";
        if (data.contactEmail && !/\S+@\S+\.\S+/.test(data.contactEmail)) {
          stepErrors.contactEmail = "Please enter a valid email";
        }
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, eventId }),
      });

      if (response.ok) {
        // Redirect to completion page
        window.location.href = "/survey?completed=true";
      } else {
        throw new Error("Failed to submit survey");
      }
    } catch (error) {
      console.error("Survey submission error:", error);
      alert("Failed to submit survey. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Tell us about your club
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What is your role? *
              </label>
              <select
                value={data.role}
                onChange={(e) => updateData("role", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Select your role...</option>
                <option value="Club Chairperson">Club Chairperson</option>
                <option value="Team Coach">Team Coach</option>
                <option value="Player">Player</option>
                <option value="Parent">Parent</option>
                <option value="GAA Official">GAA Official</option>
                <option value="Other">Other</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Where is your club located? *
                </label>
                <select
                  value={data.country}
                  onChange={(e) => updateData("country", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select country...</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City (optional)
                </label>
                <input
                  type="text"
                  value={data.city}
                  onChange={(e) => updateData("city", e.target.value)}
                  placeholder="Enter city..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Which club are you affiliated with?
              </label>
              <input
                type="text"
                value={data.clubName}
                onChange={(e) => updateData("clubName", e.target.value)}
                placeholder="Enter club name..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Has your team ever travelled abroad before? (optional)
              </label>
              <select
                value={data.travelFrequency}
                onChange={(e) =>
                  updateData("travelFrequency", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Select...</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Planning first trip">Planning our first trip</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Preferences & Contact
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please tell us about your group, and your preferences. Also, please type any questions.
              </label>
              <textarea
                value={data.groupAndPreferences}
                onChange={(e) =>
                  updateData("groupAndPreferences", e.target.value)
                }
                rows={6}
                placeholder="Tell us about your team size, travel preferences, budget considerations, destinations you&apos;re interested in, and any questions you have about organizing GAA trips..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <p className="text-sm text-gray-600 mb-4">
                We&apos;ll use this information to follow up with relevant opportunities and updates.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={data.contactName}
                    onChange={(e) => updateData("contactName", e.target.value)}
                    placeholder="Your full name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  {errors.contactName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.contactName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={data.contactEmail}
                    onChange={(e) => updateData("contactEmail", e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  {errors.contactEmail && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.contactEmail}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={data.contactPhone}
                  onChange={(e) => updateData("contactPhone", e.target.value)}
                  placeholder="Your phone number"
                  className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>
            Step {currentStep} of {totalSteps}
          </span>
          <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Previous
        </button>

        {currentStep < totalSteps ? (
          <button
            onClick={nextStep}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Survey"}
          </button>
        )}
      </div>
    </div>
  );
}
