"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Euro,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Shield,
  FileText,
  ExternalLink,
  Loader2,
  HelpCircle,
} from "lucide-react";

interface DayPassConfigClientProps {
  clubId: string;
  clubName: string;
  initialPrice: number | null;
  initialCurrency: string;
}

const SUGGESTED_INCLUSIONS = [
  {
    id: "pitch",
    label: "Pitch access",
    description: "Use of training facilities",
  },
  {
    id: "changing",
    label: "Changing rooms",
    description: "Access to locker rooms and showers",
  },
  {
    id: "water",
    label: "Pitchside water",
    description: "Hydration during sessions",
  },
  {
    id: "snacks",
    label: "Pitchside snacks",
    description: "Light refreshments during play",
  },
  {
    id: "insurance",
    label: "Player insurance",
    description: "Liability coverage for visitors",
  },
  {
    id: "dinner",
    label: "Post-match meal",
    description: "Full dinner after activities",
  },
  {
    id: "drinks",
    label: "Drinks voucher",
    description: "Complimentary drinks at clubhouse",
  },
  {
    id: "equipment",
    label: "Equipment use",
    description: "Balls, cones, bibs etc.",
  },
  {
    id: "merchandise",
    label: "Merchandise",
    description: "Club gear, souvenirs, or gifts",
  },
];

const PROHIBITED_ITEMS = [
  {
    title: "Accommodation",
    description: "Hotels, B&Bs, hostels, or any overnight stays",
    icon: "bed",
  },
  {
    title: "Transport",
    description: "Flights, coach transfers, car hire, or airport pickups",
    icon: "plane",
  },
  {
    title: "Multi-day tours",
    description: "Excursions or activities spanning more than 24 hours",
    icon: "calendar",
  },
];

export default function DayPassConfigClient({
  clubId,
  clubName,
  initialPrice,
  initialCurrency,
}: DayPassConfigClientProps) {
  const router = useRouter();
  const [price, setPrice] = useState<string>(initialPrice?.toString() || "");
  const [currency] = useState(initialCurrency);
  const [selectedInclusions, setSelectedInclusions] = useState<string[]>([]);
  const [otherInclusion, setOtherInclusion] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showProhibitedDetails, setShowProhibitedDetails] = useState(false);
  const [showPlayAwayEarnings, setShowPlayAwayEarnings] = useState(false);

  const handleToggleInclusion = (id: string) => {
    setSelectedInclusions((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!price || parseFloat(price) <= 0) {
      setError("Please enter a valid price greater than €0");
      return;
    }

    if (parseFloat(price) > 200) {
      setError(
        "Day-Pass price cannot exceed €200. Contact support for special arrangements."
      );
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/clubs/${clubId}/day-pass`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayPassPrice: parseFloat(price),
          dayPassCurrency: currency,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save Day-Pass configuration");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/club-admin/${clubId}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const platformFee = 5;
  const travelerPays = price ? parseFloat(price) + platformFee : 0;
  const yourProfit = 2.5;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
        <div className="container mx-auto px-4 py-6">
          <Link
            href={`/club-admin/${clubId}`}
            className="inline-flex items-center gap-2 text-emerald-100 hover:text-white mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">
            Day-Pass Configuration
          </h1>
          <p className="text-emerald-100 mt-1">{clubName}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* What is Day-Pass */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="bg-emerald-100 rounded-full p-3 flex-shrink-0">
                <Info className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  What is the Day-Pass?
                </h2>
                <p className="text-gray-600 mb-3">
                  The Day-Pass is your per-player hospitality fee. Each visiting
                  player purchases one to access your facilities, food, and
                  hospitality. <strong>You set the price</strong> based on what
                  you provide.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/products#day-pass"
                    className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 group"
                  >
                    <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                      <FileText className="w-4 h-4" />
                    </span>
                    Full Day-Pass Guide
                  </Link>
                  <Link
                    href="/host-terms"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 group"
                  >
                    <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                      <Shield className="w-4 h-4" />
                    </span>
                    Host Terms
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* What You CAN Include */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-emerald-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              What You CAN Include
            </h2>
            <p className="text-emerald-800 text-sm mb-4">
              Your Day-Pass covers same-day hospitality and facilities. Select
              what your club provides:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {SUGGESTED_INCLUSIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleToggleInclusion(item.id)}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                    selectedInclusions.includes(item.id)
                      ? "border-emerald-500 bg-emerald-100"
                      : "border-emerald-200 bg-white hover:border-emerald-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                      selectedInclusions.includes(item.id)
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedInclusions.includes(item.id) && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 text-sm">
                      {item.label}
                    </span>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Other - Custom Input */}
            <div className="mt-4 pt-4 border-t border-emerald-200">
              <label className="block text-sm font-medium text-emerald-900 mb-2">
                Other inclusions
              </label>
              <input
                type="text"
                value={otherInclusion}
                onChange={(e) => setOtherInclusion(e.target.value)}
                placeholder="e.g., Club tour, video analysis session, local guide..."
                className="w-full px-4 py-2.5 border-2 border-emerald-200 rounded-lg bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-sm placeholder:text-gray-400"
              />
              <p className="text-xs text-emerald-700 mt-2">
                Add any additional items you&apos;ll provide that aren&apos;t
                listed above.
              </p>
            </div>

            <p className="text-xs text-emerald-700 mt-4">
              These selections help visitors understand what&apos;s included but
              are for reference only. The actual price is what matters.
            </p>
          </div>

          {/* Price Configuration */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Set Your Price
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Price Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Day-Pass Price (per player)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Euro className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    step="5"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-xl font-semibold"
                    placeholder="40"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Recommended range: €25 - €60 depending on what you include
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  What Visitors Pay
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Your Day-Pass price:</span>
                    <span className="font-medium">€{price || "0"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">+ Platform fee:</span>
                    <span className="font-medium">€{platformFee}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Visitor pays:</span>
                      <span className="text-gray-900">
                        €{travelerPays || platformFee}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Your Earnings
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cost recovery:</span>
                      <span className="font-medium">€{price || "0"}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600">
                      <span>+ Your profit (50% of fee):</span>
                      <span className="font-medium">€{yourProfit}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-emerald-700 pt-2 border-t border-gray-200">
                      <span>Per player total:</span>
                      <span>
                        €
                        {price
                          ? (parseFloat(price) + yourProfit).toFixed(2)
                          : yourProfit}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Example Calculation */}
          {price && parseFloat(price) > 0 && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-emerald-900 mb-3">
                Example: 25-Player Team Visit
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <div className="text-sm text-gray-600 mb-1">
                    Cost Recovery
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    €{(parseFloat(price) * 25).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">25 × €{price}</div>
                </div>
                <div className="bg-emerald-600 rounded-lg p-4 text-white">
                  <div className="text-sm text-emerald-100 mb-1">
                    Your Profit
                  </div>
                  <div className="text-2xl font-bold">
                    €{(yourProfit * 25).toFixed(2)}
                  </div>
                  <div className="text-xs text-emerald-200">
                    25 × €{yourProfit}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPlayAwayEarnings(!showPlayAwayEarnings)}
                className="mt-4 w-full text-sm text-emerald-700 hover:text-emerald-800 font-medium bg-white border border-emerald-200 hover:border-emerald-300 rounded-lg px-4 py-3 text-left transition-all hover:shadow-sm"
              >
                {showPlayAwayEarnings
                  ? "↑ Hide PlayAway earnings"
                  : "Would you like to see how much PlayAway makes from your Day-Pass? →"}
              </button>

              {showPlayAwayEarnings && (
                <div className="mt-3 bg-white border border-emerald-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Earnings Comparison (25 players)
                  </h4>

                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    {/* Your Club */}
                    <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                      <div className="text-xs text-emerald-700 font-medium mb-1">
                        Your Club Earns
                      </div>
                      <div className="text-xl font-bold text-emerald-700">
                        €
                        {(
                          parseFloat(price) * 25 +
                          yourProfit * 25
                        ).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div className="text-xs text-emerald-600 mt-1">
                        €{(parseFloat(price) * 25).toLocaleString()} + €
                        {(yourProfit * 25).toFixed(2)} profit share
                      </div>
                    </div>

                    {/* PlayAway */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-600 font-medium mb-1">
                        PlayAway Earns
                      </div>
                      <div className="text-xl font-bold text-gray-700">
                        €{(yourProfit * 25).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        €{(platformFee * 25).toFixed(2)} fee − €
                        {(yourProfit * 25).toFixed(2)} to you
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    PlayAway&apos;s share covers payment processing, platform
                    maintenance, customer support, and marketing to bring teams
                    to your club.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Important Note - Items not included */}
          <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <div className="bg-amber-100/80 rounded-full p-2 flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-900 mb-1.5">
                  Important: Day-Pass Scope
                </h3>
                <p className="text-amber-800 text-sm mb-3">
                  Per EU Package Travel Directive, Day-Passes cover same-day
                  hospitality only. Do not include accommodation, transport, or
                  multi-day services.
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {PROHIBITED_ITEMS.map((item) => (
                    <span
                      key={item.title}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-amber-200 rounded-full text-xs text-amber-800"
                    >
                      <XCircle className="w-3 h-3 text-amber-500" />
                      {item.title}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowProhibitedDetails(!showProhibitedDetails)
                  }
                  className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  {showProhibitedDetails ? "Hide details" : "Learn more"}
                </button>

                {showProhibitedDetails && (
                  <div className="mt-3 bg-white border border-amber-200 rounded-lg p-3 text-xs">
                    <p className="text-gray-700 mb-2">
                      Bundling accommodation, transport, or multi-day services
                      creates a &quot;package&quot; with legal obligations only
                      licensed tour operators can fulfil. This protects both
                      your club and visiting teams.
                    </p>
                    <a
                      href="https://europa.eu/youreurope/citizens/travel/holidays/package-travel/index_en.htm"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800"
                    >
                      <ExternalLink className="w-3 h-3" />
                      EU Package Travel Directive
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <p className="text-emerald-800 text-sm">
                Day-Pass configuration saved successfully! Redirecting...
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <Link
              href={`/club-admin/${clubId}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !price || parseFloat(price) <= 0}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Save Day-Pass Configuration
                </>
              )}
            </button>
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              All Day-Pass configurations are reviewed by PlayAway staff before
              going live. Changes may take up to 24 hours to reflect on your
              public profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
