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

  // Travel History & Intent
  hasTraveledAbroad: string;
  travelFrequency: string;
  destinationsVisited: string[];
  preferredTravelTime: string;

  // Budgets & Pain Points
  teamSize: string;
  budgetPerPerson: string;
  biggestChallenge: string;

  // Product Fit & Interest
  interestedServices: string[];
  wouldHost: string;
  wouldPayForPlatform: string;

  // Open-Ended Insight
  improvementSuggestion: string;
  additionalFeedback: string;

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
  hasTraveledAbroad: "",
  travelFrequency: "",
  destinationsVisited: [],
  preferredTravelTime: "",
  teamSize: "",
  budgetPerPerson: "",
  biggestChallenge: "",
  interestedServices: [],
  wouldHost: "",
  wouldPayForPlatform: "",
  improvementSuggestion: "",
  additionalFeedback: "",
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

const DESTINATIONS = [
  "Spain",
  "Netherlands",
  "Portugal",
  "Ireland",
  "France",
  "United Kingdom",
  "United States",
  "Australia",
  "Other",
];

const SERVICES = [
  "Tournaments",
  "Training camps",
  "Cultural experiences (e.g. Irish heritage tours)",
  "Pre-packaged travel (flights + stay + events)",
  "Affiliate income (promoting trips)",
];

export default function SurveyForm({ eventId }: SurveyFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<SurveyData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 6;

  const updateData = (field: keyof SurveyData, value: string | string[]) => {
    setData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const toggleArrayValue = (
    field: "destinationsVisited" | "interestedServices",
    value: string
  ) => {
    const currentArray = data[field];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];
    updateData(field, newArray);
  };

  const validateStep = (step: number): boolean => {
    const stepErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!data.role) stepErrors.role = "Please select your role";
        if (!data.country) stepErrors.country = "Please select your country";
        break;
      case 2:
        if (!data.hasTraveledAbroad)
          stepErrors.hasTraveledAbroad = "Please answer this question";
        if (!data.preferredTravelTime)
          stepErrors.preferredTravelTime =
            "Please select preferred travel time";
        break;
      case 3:
        if (!data.teamSize) stepErrors.teamSize = "Please select team size";
        if (!data.budgetPerPerson)
          stepErrors.budgetPerPerson = "Please select budget range";
        if (!data.biggestChallenge)
          stepErrors.biggestChallenge = "Please select biggest challenge";
        break;
      case 4:
        if (data.interestedServices.length === 0)
          stepErrors.interestedServices = "Please select at least one service";
        if (!data.wouldHost)
          stepErrors.wouldHost = "Please answer this question";
        if (!data.wouldPayForPlatform)
          stepErrors.wouldPayForPlatform = "Please answer this question";
        break;
      case 6:
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
              Tell us about yourself
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
                Where is your club located? *
              </label>
              <select
                value={data.country}
                onChange={(e) => updateData("country", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary mb-3"
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

              <input
                type="text"
                value={data.city}
                onChange={(e) => updateData("city", e.target.value)}
                placeholder="City (optional)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Travel History & Intent
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Has your club ever traveled abroad for a GAA event? *
              </label>
              <div className="space-y-2">
                {["Yes", "No", "Planning to"].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="hasTraveledAbroad"
                      value={option}
                      checked={data.hasTraveledAbroad === option}
                      onChange={(e) =>
                        updateData("hasTraveledAbroad", e.target.value)
                      }
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
              {errors.hasTraveledAbroad && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.hasTraveledAbroad}
                </p>
              )}
            </div>

            {data.hasTraveledAbroad === "Yes" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How often does your team travel abroad for games or gaa
                  events?
                </label>
                <select
                  value={data.travelFrequency}
                  onChange={(e) =>
                    updateData("travelFrequency", e.target.value)
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select frequency...</option>
                  <option value="Once per year">Once per year</option>
                  <option value="Twice">Twice</option>
                  <option value="More than twice">More than twice</option>
                  <option value="Never">Never</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What destinations have you visited or are considering for future
                trips?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DESTINATIONS.map((destination) => (
                  <label key={destination} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={data.destinationsVisited.includes(destination)}
                      onChange={() =>
                        toggleArrayValue("destinationsVisited", destination)
                      }
                      className="mr-2"
                    />
                    {destination}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What time of year do you prefer to travel with your club? *
              </label>
              <select
                value={data.preferredTravelTime}
                onChange={(e) =>
                  updateData("preferredTravelTime", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Select preferred time...</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
                <option value="Autumn">Autumn</option>
                <option value="Winter">Winter</option>
                <option value="School holidays only">
                  School holidays only
                </option>
              </select>
              {errors.preferredTravelTime && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.preferredTravelTime}
                </p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Budgets & Pain Points
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What is your average team size when travelling? *
              </label>
              <select
                value={data.teamSize}
                onChange={(e) => updateData("teamSize", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Select team size...</option>
                <option value="Under 10">Under 10</option>
                <option value="10–15">10–15</option>
                <option value="16–20">16–20</option>
                <option value="20+">20+</option>
              </select>
              {errors.teamSize && (
                <p className="mt-1 text-sm text-red-600">{errors.teamSize}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What&apos;s your estimated average budget per person for a full trip
                (flight, stay, participation)? *
              </label>
              <select
                value={data.budgetPerPerson}
                onChange={(e) => updateData("budgetPerPerson", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Select budget range...</option>
                <option value="Under €250">Under €250</option>
                <option value="€250–€500">€250–€500</option>
                <option value="€500–€750">€500–€750</option>
                <option value="€750+">€750+</option>
              </select>
              {errors.budgetPerPerson && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.budgetPerPerson}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What&apos;s the biggest challenge your club faces in organizing
                travel? *
              </label>
              <select
                value={data.biggestChallenge}
                onChange={(e) => updateData("biggestChallenge", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Select biggest challenge...</option>
                <option value="Costs">Costs</option>
                <option value="Logistics">Logistics</option>
                <option value="Time">Time</option>
                <option value="Unreliable hosts">Unreliable hosts</option>
                <option value="Cancellation risks">Cancellation risks</option>
                <option value="Other">Other</option>
              </select>
              {errors.biggestChallenge && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.biggestChallenge}
                </p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Product Fit & Interest
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Which of these services would your club be interested in? *
                (Select all that apply)
              </label>
              <div className="space-y-2">
                {SERVICES.map((service) => (
                  <label key={service} className="flex items-start">
                    <input
                      type="checkbox"
                      checked={data.interestedServices.includes(service)}
                      onChange={() =>
                        toggleArrayValue("interestedServices", service)
                      }
                      className="mr-2 mt-1"
                    />
                    <span className="text-sm">{service}</span>
                  </label>
                ))}
              </div>
              {errors.interestedServices && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.interestedServices}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Would you consider hosting a team/event at your home club? *
              </label>
              <div className="space-y-2">
                {["Yes", "No", "Maybe"].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="wouldHost"
                      value={option}
                      checked={data.wouldHost === option}
                      onChange={(e) => updateData("wouldHost", e.target.value)}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
              {errors.wouldHost && (
                <p className="mt-1 text-sm text-red-600">{errors.wouldHost}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Would you pay for access to a platform that organizes everything
                for you? *
              </label>
              <div className="space-y-2">
                {[
                  "Yes – if it saves time and money",
                  "Maybe – depends on cost",
                  "No – we prefer handling it ourselves",
                ].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="wouldPayForPlatform"
                      value={option}
                      checked={data.wouldPayForPlatform === option}
                      onChange={(e) =>
                        updateData("wouldPayForPlatform", e.target.value)
                      }
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
              {errors.wouldPayForPlatform && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.wouldPayForPlatform}
                </p>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Insights</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What would make you more likely to organize a trip with your
                team?
              </label>
              <textarea
                value={data.improvementSuggestion}
                onChange={(e) =>
                  updateData("improvementSuggestion", e.target.value)
                }
                rows={4}
                placeholder="Share your thoughts..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anything else you&apos;d like us to consider in improving GAA travel?
              </label>
              <textarea
                value={data.additionalFeedback}
                onChange={(e) =>
                  updateData("additionalFeedback", e.target.value)
                }
                rows={4}
                placeholder="Additional feedback..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Contact Information
            </h2>
            <p className="text-gray-600">
              We&apos;ll use this information to follow up with relevant
              opportunities and updates.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={data.contactName}
                onChange={(e) => updateData("contactName", e.target.value)}
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
              {errors.contactEmail && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.contactEmail}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone (optional)
              </label>
              <input
                type="tel"
                value={data.contactPhone}
                onChange={(e) => updateData("contactPhone", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
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
