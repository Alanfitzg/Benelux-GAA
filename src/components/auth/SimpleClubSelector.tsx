"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Users,
  Plus,
  CheckCircle,
  Building,
  Search,
  MapPin,
  ChevronRight,
  Star,
  Info,
  Loader,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface InternationalUnit {
  id: string;
  code: string;
  name: string;
}

interface Country {
  id: string;
  code: string;
  name: string;
  hasRegions: boolean;
}

interface Region {
  id: string;
  code: string;
  name: string;
  countryId: string;
}

interface County {
  id: string;
  code: string;
  name: string;
  displayOrder: number;
}

interface Club {
  id: string;
  name: string;
  location?: string;
  sportsSupported?: string[];
  verificationStatus?: string;
  imageUrl?: string;
}

interface SimpleClubSelectorProps {
  value: string | null;
  onChange: (clubId: string | null, isClubMember: boolean) => void;
}

export default function SimpleClubSelector({
  value,
  onChange,
}: SimpleClubSelectorProps) {
  // Core states
  const [isClubMember, setIsClubMember] = useState<boolean | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [selectedClub, setSelectedClub] = useState<string | null>(value);

  // Data states
  const [units, setUnits] = useState<InternationalUnit[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [counties, setCounties] = useState<County[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);

  // UI states
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCounties, setLoadingCounties] = useState(false);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const [clubSearchTerm, setClubSearchTerm] = useState("");
  // const [showManualForm, setShowManualForm] = useState(false);

  // Helper function to check if Ireland is selected
  const isIreland = useCallback(() => {
    if (!selectedUnit || units.length === 0) return false;
    const unit = units.find((u) => u.id === selectedUnit);
    return unit?.code === "IRE";
  }, [selectedUnit, units]);

  // Load international units on mount
  useEffect(() => {
    loadInternationalUnits();
  }, []);

  // Load countries or provinces when unit is selected
  useEffect(() => {
    if (selectedUnit && units.length > 0) {
      const selectedUnitData = units.find((u) => u.id === selectedUnit);
      if (selectedUnitData?.code === "IRE") {
        // For Ireland, load provinces directly and skip countries
        loadIrelandProvinces();
        setSelectedCountry(null);
        setCountries([]);
      } else {
        // For other units, load countries
        loadCountries(selectedUnit);
        setSelectedCountry(null);
        setProvinces([]);
      }
      setSelectedProvince(null);
      setSelectedCounty(null);
      setSelectedClub(null);
      // Only clear clubs for Ireland flow, not for country-based flows
      const unitData = units.find((u) => u.id === selectedUnit);
      if (unitData?.code === "IRE") {
        setClubs([]);
      }
      setCounties([]);
    }
  }, [selectedUnit, units]);

  // Load clubs when country is selected (non-Ireland)
  useEffect(() => {
    if (selectedCountry && !isIreland()) {
      loadClubs(selectedCountry);
      setSelectedClub(null);
    }
  }, [selectedCountry, isIreland]);

  // Load counties when province is selected (Ireland only)
  useEffect(() => {
    if (selectedProvince && isIreland()) {
      loadIrelandCounties(selectedProvince);
      setSelectedCounty(null);
      setSelectedClub(null);
      setClubs([]);
    }
  }, [selectedProvince, isIreland]);

  // Load clubs when county is selected (Ireland only)
  useEffect(() => {
    if (selectedCounty && isIreland()) {
      loadIrelandClubs(selectedCounty);
      setSelectedClub(null);
    }
  }, [selectedCounty, isIreland]);

  // Filter clubs based on search and sport
  useEffect(() => {
    let filtered = clubs;

    // Apply search filter
    if (clubSearchTerm) {
      filtered = filtered.filter(
        (club) =>
          club.name.toLowerCase().includes(clubSearchTerm.toLowerCase()) ||
          club.location?.toLowerCase().includes(clubSearchTerm.toLowerCase())
      );
    }

    setFilteredClubs(filtered);
  }, [clubs, clubSearchTerm]);

  // Data loading functions
  const loadInternationalUnits = async () => {
    setLoadingUnits(true);
    try {
      const response = await fetch("/api/clubs/international-units-sql");
      if (response.ok) {
        const data = await response.json();
        setUnits(data);
      } else {
        throw new Error("Failed to load international units");
      }
    } catch (error) {
      console.error("Error loading international units:", error);
      toast.error("Failed to load international units");
    } finally {
      setLoadingUnits(false);
    }
  };

  const loadCountries = async (unitId: string) => {
    setLoadingCountries(true);
    try {
      const response = await fetch(`/api/clubs/countries-sql?unitId=${unitId}`);
      if (response.ok) {
        const data = await response.json();
        setCountries(data);
      } else {
        throw new Error("Failed to load countries");
      }
    } catch (error) {
      console.error("Error loading countries:", error);
      toast.error("Failed to load countries");
    } finally {
      setLoadingCountries(false);
    }
  };

  const loadClubs = async (countryId: string) => {
    setLoadingClubs(true);
    try {
      const response = await fetch(
        `/api/clubs/filtered-sql?countryId=${countryId}`
      );
      if (response.ok) {
        const data = await response.json();
        setClubs(data);
      } else {
        throw new Error("Failed to load clubs");
      }
    } catch (error) {
      console.error("Error loading clubs:", error);
      toast.error("Failed to load clubs");
    } finally {
      setLoadingClubs(false);
    }
  };

  // Ireland-specific loading functions
  const loadIrelandProvinces = async () => {
    setLoadingProvinces(true);
    try {
      // Use static list of Irish provinces
      const irishProvinces = [
        {
          id: "LEINSTER",
          code: "LEINSTER",
          name: "Leinster",
          countryId: "IE",
          displayOrder: 1,
        },
        {
          id: "MUNSTER",
          code: "MUNSTER",
          name: "Munster",
          countryId: "IE",
          displayOrder: 2,
        },
        {
          id: "CONNACHT",
          code: "CONNACHT",
          name: "Connacht",
          countryId: "IE",
          displayOrder: 3,
        },
        {
          id: "ULSTER",
          code: "ULSTER",
          name: "Ulster",
          countryId: "IE",
          displayOrder: 4,
        },
      ];
      setProvinces(irishProvinces);
    } catch (error) {
      console.error("Error loading Ireland provinces:", error);
      toast.error("Failed to load provinces");
    } finally {
      setLoadingProvinces(false);
    }
  };

  const loadIrelandCounties = async (provinceCode: string) => {
    setLoadingCounties(true);
    try {
      const response = await fetch(
        `/api/clubs/ireland-counties?provinceCode=${provinceCode}`
      );
      if (response.ok) {
        const data = await response.json();
        setCounties(data);
      } else {
        throw new Error("Failed to load counties");
      }
    } catch (error) {
      console.error("Error loading Ireland counties:", error);
      toast.error("Failed to load counties");
    } finally {
      setLoadingCounties(false);
    }
  };

  const loadIrelandClubs = async (countyCode: string) => {
    setLoadingClubs(true);
    try {
      const response = await fetch(
        `/api/clubs/ireland-clubs?countyCode=${countyCode}`
      );
      if (response.ok) {
        const data = await response.json();
        setClubs(data);
      } else {
        throw new Error("Failed to load clubs");
      }
    } catch (error) {
      console.error("Error loading Ireland clubs:", error);
      toast.error("Failed to load clubs");
    } finally {
      setLoadingClubs(false);
    }
  };

  // Handlers
  const handleClubMemberToggle = (isMember: boolean) => {
    setIsClubMember(isMember);
    if (!isMember) {
      // Reset all selections if not a club member
      setSelectedUnit(null);
      setSelectedCountry(null);
      setSelectedClub(null);
      setClubs([]);
      setCountries([]);
      onChange(null, false);
    }
  };

  const handleClubSelection = (clubId: string) => {
    setSelectedClub(clubId);
    onChange(clubId, true);
  };

  // Get selected data
  const selectedUnitData = units.find((u) => u.id === selectedUnit);
  const selectedCountryData = countries.find((c) => c.id === selectedCountry);
  const selectedClubData = clubs.find((c) => c.id === selectedClub);

  // Progress calculation
  const getProgress = () => {
    if (isClubMember !== true) return 0;
    let progress = 0;

    if (selectedUnit) {
      if (isIreland()) {
        // Ireland flow: Unit → Province → County → Club
        progress += 25; // Unit selected
        if (selectedProvince) progress += 25; // Province selected
        if (selectedCounty) progress += 25; // County selected
        if (selectedClub) progress += 25; // Club selected
      } else {
        // Other units: Unit → Country → Club
        progress += 33; // Unit selected
        if (selectedCountry) progress += 33; // Country selected
        if (selectedClub) progress += 34; // Club selected
      }
    }

    return progress;
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Header */}
      <div
        className="bg-emerald-50/80 rounded-xl p-3 md:p-4 border border-emerald-200 shadow-sm"
        style={{ borderLeft: "4px solid #1e40af" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm md:text-base font-bold text-gray-900 mb-0.5 flex items-center gap-2">
              <Building className="w-4 h-4 text-primary" />
              Club Membership
            </h3>
            <p className="text-xs md:text-sm text-gray-700">
              Connect with your GAA community worldwide
            </p>
          </div>
          {isClubMember === true && (
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-0.5">Progress</div>
              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgress()}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {getProgress()}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 1: Club Membership Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border-2 border-gray-100 p-3 md:p-4 shadow-sm"
      >
        <label className="block text-sm md:text-base font-semibold text-gray-800 mb-3 md:mb-4">
          Are you currently a member of a GAA club?
        </label>

        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <motion.button
            type="button"
            onClick={() => handleClubMemberToggle(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative overflow-hidden p-3 md:p-4 rounded-lg font-medium transition-all duration-300 ${
              isClubMember === true
                ? "bg-green-600 text-white shadow-lg shadow-green-200"
                : "bg-gray-50 border-2 border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm">Yes, I&apos;m a member</span>
            </div>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => handleClubMemberToggle(false)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative overflow-hidden p-3 md:p-4 rounded-lg font-medium transition-all duration-300 ${
              isClubMember === false
                ? "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-200"
                : "bg-gray-50 border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm">No, not currently</span>
            </div>
          </motion.button>
        </div>

        <AnimatePresence>
          {isClubMember === false && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-blue-900">Perfect!</p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    You can still join PlayAway as an individual and connect
                    with GAA communities worldwide.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Club Selection Flow - Inverted Colors */}
      <AnimatePresence>
        {isClubMember === true && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="bg-blue-900 rounded-xl p-3 md:p-5 shadow-2xl border border-blue-700"
          >
            <div className="space-y-3 md:space-y-4">
              {/* Progress Steps */}
              <div className="mb-3">
                <div className="flex items-center space-x-2 overflow-x-auto py-2">
                  {/* Step 1: International Unit */}
                  <div
                    className={`flex items-center space-x-1.5 ${selectedUnit ? "text-green-400 drop-shadow-sm" : "text-blue-400 drop-shadow-sm"}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shadow-lg ${
                        selectedUnit
                          ? "bg-green-600 text-white"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {selectedUnit ? <CheckCircle className="w-3 h-3" /> : "1"}
                    </div>
                    <span className="font-medium text-sm whitespace-nowrap text-white drop-shadow-sm">
                      International Unit
                    </span>
                  </div>

                  {/* Conditional Steps based on Ireland vs Others */}
                  {selectedUnit && (
                    <>
                      <ChevronRight className="w-3 h-3 text-white opacity-60" />
                      {isIreland() ? (
                        <>
                          {/* Ireland Flow: Province → County → Club */}
                          <div
                            className={`flex items-center space-x-1.5 ${selectedProvince ? "text-green-400 drop-shadow-sm" : "text-blue-400 drop-shadow-sm"}`}
                          >
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shadow-lg ${
                                selectedProvince
                                  ? "bg-green-600 text-white"
                                  : "bg-blue-600 text-white"
                              }`}
                            >
                              {selectedProvince ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                "2"
                              )}
                            </div>
                            <span className="font-medium text-sm whitespace-nowrap text-white drop-shadow-sm">
                              Province
                            </span>
                          </div>

                          {selectedProvince && (
                            <>
                              <ChevronRight className="w-3 h-3 text-white opacity-60" />
                              <div
                                className={`flex items-center space-x-1.5 ${selectedCounty ? "text-green-400 drop-shadow-sm" : "text-blue-400 drop-shadow-sm"}`}
                              >
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shadow-lg ${
                                    selectedCounty
                                      ? "bg-green-600 text-white"
                                      : "bg-blue-600 text-white"
                                  }`}
                                >
                                  {selectedCounty ? (
                                    <CheckCircle className="w-3 h-3" />
                                  ) : (
                                    "3"
                                  )}
                                </div>
                                <span className="font-medium text-sm whitespace-nowrap text-white drop-shadow-sm">
                                  County
                                </span>
                              </div>
                            </>
                          )}

                          {selectedCounty && (
                            <>
                              <ChevronRight className="w-3 h-3 text-white opacity-60" />
                              <div
                                className={`flex items-center space-x-1.5 ${selectedClub ? "text-green-400 drop-shadow-sm" : "text-blue-400 drop-shadow-sm"}`}
                              >
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                    selectedClub
                                      ? "bg-green-600 text-white"
                                      : "bg-blue-600 text-white"
                                  }`}
                                >
                                  {selectedClub ? (
                                    <CheckCircle className="w-3 h-3" />
                                  ) : (
                                    "4"
                                  )}
                                </div>
                                <span className="font-medium text-sm whitespace-nowrap text-white drop-shadow-sm">
                                  Club
                                </span>
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          {/* Other Units Flow: Country → Club */}
                          <div
                            className={`flex items-center space-x-1.5 ${selectedCountry ? "text-green-400 drop-shadow-sm" : selectedUnit ? "text-blue-400 drop-shadow-sm" : "text-slate-400"}`}
                          >
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shadow-lg ${
                                selectedCountry
                                  ? "bg-green-600 text-white"
                                  : selectedUnit
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-700 text-blue-200"
                              }`}
                            >
                              {selectedCountry ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                "2"
                              )}
                            </div>
                            <span className="font-medium text-sm whitespace-nowrap text-white drop-shadow-sm">
                              Country
                            </span>
                          </div>

                          {selectedCountry && (
                            <>
                              <ChevronRight className="w-3 h-3 text-white opacity-60" />
                              <div
                                className={`flex items-center space-x-1.5 ${selectedClub ? "text-green-400 drop-shadow-sm" : "text-blue-400 drop-shadow-sm"}`}
                              >
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                    selectedClub
                                      ? "bg-green-600 text-white"
                                      : "bg-blue-600 text-white"
                                  }`}
                                >
                                  {selectedClub ? (
                                    <CheckCircle className="w-3 h-3" />
                                  ) : (
                                    "3"
                                  )}
                                </div>
                                <span className="font-medium text-sm whitespace-nowrap text-white drop-shadow-sm">
                                  Club
                                </span>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Step 1: International Unit */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-lg border border-gray-200 p-2.5 md:p-3"
              >
                <label className="block text-xs md:text-sm font-semibold text-gray-800 mb-1.5 md:mb-2">
                  Step 1: Select International Unit
                </label>
                {loadingUnits ? (
                  <div className="flex items-center justify-center py-3">
                    <Loader className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="ml-2 text-xs text-gray-600">
                      Loading...
                    </span>
                  </div>
                ) : (
                  <select
                    value={selectedUnit || ""}
                    onChange={(e) => setSelectedUnit(e.target.value || null)}
                    className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all appearance-none touch-manipulation"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: "right 0.5rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.25em 1.25em",
                      paddingRight: "2.5rem",
                      minHeight: "44px",
                    }}
                  >
                    <option value="">Select International Unit...</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                )}
              </motion.div>

              {/* Step 2: Country (for non-Ireland units) */}
              <AnimatePresence>
                {selectedUnit && !isIreland() && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg border border-gray-200 p-2.5 md:p-3"
                  >
                    <label className="block text-xs md:text-sm font-semibold text-gray-800 mb-1.5 md:mb-2">
                      Step 2: Select Country
                    </label>
                    {loadingCountries ? (
                      <div className="flex items-center justify-center py-3">
                        <Loader className="w-4 h-4 animate-spin text-green-500" />
                        <span className="ml-2 text-xs text-gray-600">
                          Loading countries...
                        </span>
                      </div>
                    ) : countries.length === 0 ? (
                      <div className="text-center py-4 text-xs text-gray-400">
                        No countries available for this region
                      </div>
                    ) : (
                      <select
                        value={selectedCountry || ""}
                        onChange={(e) =>
                          setSelectedCountry(e.target.value || null)
                        }
                        className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg bg-white text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all appearance-none touch-manipulation"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: "right 0.5rem center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "1.25em 1.25em",
                          paddingRight: "2.5rem",
                          minHeight: "44px",
                        }}
                      >
                        <option value="">Select Country...</option>
                        {countries.map((country) => (
                          <option key={country.id} value={country.id}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 2: Province (for Ireland only) */}
              <AnimatePresence>
                {selectedUnit && isIreland() && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg border border-gray-200 p-2.5 md:p-3"
                  >
                    <label className="block text-xs md:text-sm font-semibold text-gray-800 mb-1.5 md:mb-2">
                      Step 2: Select Province
                    </label>
                    {loadingProvinces ? (
                      <div className="flex items-center justify-center py-3">
                        <Loader className="w-4 h-4 animate-spin text-green-500" />
                        <span className="ml-2 text-xs text-gray-600">
                          Loading provinces...
                        </span>
                      </div>
                    ) : provinces.length === 0 ? (
                      <div className="text-center py-4 text-xs text-gray-400">
                        No provinces available
                      </div>
                    ) : (
                      <select
                        value={selectedProvince || ""}
                        onChange={(e) =>
                          setSelectedProvince(e.target.value || null)
                        }
                        className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg bg-white text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all appearance-none touch-manipulation"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: "right 0.5rem center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "1.25em 1.25em",
                          paddingRight: "2.5rem",
                          minHeight: "44px",
                        }}
                      >
                        <option value="">Select Province...</option>
                        {provinces.map((province) => (
                          <option key={province.id} value={province.code}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 3: County (for Ireland only) */}
              <AnimatePresence>
                {selectedProvince && isIreland() && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg border border-gray-200 p-2.5 md:p-3"
                  >
                    <label className="block text-xs md:text-sm font-semibold text-gray-800 mb-1.5 md:mb-2">
                      Step 3: Select County
                    </label>
                    {loadingCounties ? (
                      <div className="flex items-center justify-center py-3">
                        <Loader className="w-4 h-4 animate-spin text-orange-500" />
                        <span className="ml-2 text-xs text-gray-600">
                          Loading counties...
                        </span>
                      </div>
                    ) : counties.length === 0 ? (
                      <div className="text-center py-4 text-xs text-gray-400">
                        No counties available for this province
                      </div>
                    ) : (
                      <select
                        value={selectedCounty || ""}
                        onChange={(e) =>
                          setSelectedCounty(e.target.value || null)
                        }
                        className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg bg-white text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all appearance-none touch-manipulation"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: "right 0.5rem center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "1.25em 1.25em",
                          paddingRight: "2.5rem",
                          minHeight: "44px",
                        }}
                      >
                        <option value="">Select County...</option>
                        {counties.map((county) => (
                          <option key={county.id} value={county.code}>
                            {county.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 3/4: Club Selection */}
              <AnimatePresence>
                {(selectedCountry || selectedCounty) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg border border-gray-200 p-2.5 md:p-3"
                  >
                    <label className="block text-xs md:text-sm font-semibold text-gray-800 mb-1.5 md:mb-2">
                      Step {isIreland() ? "4" : "3"}: Find Your Club
                    </label>

                    {loadingClubs ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader className="w-4 h-4 animate-spin text-purple-500 mr-2" />
                        <span className="text-xs text-gray-600">
                          Loading clubs...
                        </span>
                      </div>
                    ) : clubs.length > 0 ? (
                      <>
                        {/* Search Input */}
                        <div className="relative mb-3">
                          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={clubSearchTerm}
                            onChange={(e) => setClubSearchTerm(e.target.value)}
                            placeholder="Search clubs..."
                            className="w-full pl-8 pr-3 py-2 text-sm border-2 border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                          />
                        </div>

                        {/* Club Count (when more than 5) */}
                        {filteredClubs.length > 5 && (
                          <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="flex items-center gap-1.5">
                              <Building className="w-3.5 h-3.5 text-blue-700" />
                              <span className="text-xs font-medium text-blue-700">
                                {filteredClubs.length} clubs found
                              </span>
                              <span className="text-xs text-blue-600">
                                • Scroll to see all
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Club Results */}
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {filteredClubs.map((club) => (
                            <motion.button
                              key={club.id}
                              type="button"
                              onClick={() => handleClubSelection(club.id)}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              className={`w-full p-2 rounded-md border-2 text-left transition-all ${
                                selectedClub === club.id
                                  ? "border-purple-500 bg-purple-50 shadow-sm"
                                  : "border-gray-200 hover:border-purple-500 hover:bg-purple-50"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-xs md:text-sm text-gray-900 truncate">
                                    {club.name}
                                  </h4>
                                  {club.location && (
                                    <p className="text-xs text-gray-500 truncate">
                                      {club.location.split(",")[0].trim()}
                                    </p>
                                  )}
                                </div>
                                {selectedClub === club.id && (
                                  <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                )}
                              </div>
                            </motion.button>
                          ))}
                        </div>

                        {filteredClubs.length === 0 && clubSearchTerm && (
                          <div className="text-center py-4">
                            <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-xs text-gray-600">
                              No clubs found matching &quot;{clubSearchTerm}
                              &quot;
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-6">
                        <Building className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-600">
                          No clubs found in this area
                        </p>
                      </div>
                    )}

                    {/* Add Club Button */}
                    {(selectedCountry || selectedCounty) && (
                      <motion.button
                        type="button"
                        onClick={() => {
                          /* TODO: Implement manual club addition */
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full mt-2 p-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-all"
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <Plus className="w-4 h-4" />
                          <span className="text-xs font-medium">
                            Can&apos;t find your club? Add it here
                          </span>
                        </div>
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selected Club Summary - Compact */}
              <AnimatePresence>
                {selectedClubData && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white border-2 border-green-400 rounded-lg p-2 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      {/* Crest with checkmark overlay */}
                      <div className="relative flex-shrink-0">
                        {selectedClubData.imageUrl ? (
                          <Image
                            src={selectedClubData.imageUrl}
                            alt={`${selectedClubData.name} crest`}
                            width={36}
                            height={36}
                            className="w-9 h-9 rounded-md object-cover border border-gray-200"
                            unoptimized
                          />
                        ) : (
                          <div className="w-9 h-9 bg-gray-100 rounded-md flex items-center justify-center">
                            <Building className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      </div>

                      {/* Club info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate text-xs">
                          {selectedClubData.name}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          {isIreland() ? (
                            <>
                              {counties.find((c) => c.code === selectedCounty)
                                ?.name || ""}
                              , Ireland
                            </>
                          ) : (
                            selectedCountryData?.name || ""
                          )}
                        </p>
                      </div>

                      {/* Verified badge */}
                      {selectedClubData.verificationStatus === "VERIFIED" && (
                        <div className="flex-shrink-0">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
