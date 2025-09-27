"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
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
  Loader
} from 'lucide-react';
import { toast } from 'react-hot-toast';

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

export default function SimpleClubSelector({ value, onChange }: SimpleClubSelectorProps) {
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
  const [clubSearchTerm, setClubSearchTerm] = useState('');
  // const [showManualForm, setShowManualForm] = useState(false);

  // Helper function to check if Ireland is selected
  const isIreland = useCallback(() => {
    if (!selectedUnit || units.length === 0) return false;
    const unit = units.find(u => u.id === selectedUnit);
    return unit?.code === 'IRE';
  }, [selectedUnit, units]);

  // Load international units on mount
  useEffect(() => {
    loadInternationalUnits();
  }, []);

  // Load countries or provinces when unit is selected
  useEffect(() => {
    if (selectedUnit && units.length > 0) {
      const selectedUnitData = units.find(u => u.id === selectedUnit);
      if (selectedUnitData?.code === 'IRE') {
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
      const unitData = units.find(u => u.id === selectedUnit);
      if (unitData?.code === 'IRE') {
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
      filtered = filtered.filter(club =>
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
      const response = await fetch('/api/clubs/international-units-sql');
      if (response.ok) {
        const data = await response.json();
        setUnits(data);
      } else {
        throw new Error('Failed to load international units');
      }
    } catch (error) {
      console.error('Error loading international units:', error);
      toast.error('Failed to load international units');
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
        throw new Error('Failed to load countries');
      }
    } catch (error) {
      console.error('Error loading countries:', error);
      toast.error('Failed to load countries');
    } finally {
      setLoadingCountries(false);
    }
  };

  const loadClubs = async (countryId: string) => {
    setLoadingClubs(true);
    try {
      const response = await fetch(`/api/clubs/filtered-sql?countryId=${countryId}`);
      if (response.ok) {
        const data = await response.json();
        setClubs(data);
      } else {
        throw new Error('Failed to load clubs');
      }
    } catch (error) {
      console.error('Error loading clubs:', error);
      toast.error('Failed to load clubs');
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
        { id: 'LEINSTER', code: 'LEINSTER', name: 'Leinster', countryId: 'IE', displayOrder: 1 },
        { id: 'MUNSTER', code: 'MUNSTER', name: 'Munster', countryId: 'IE', displayOrder: 2 },
        { id: 'CONNACHT', code: 'CONNACHT', name: 'Connacht', countryId: 'IE', displayOrder: 3 },
        { id: 'ULSTER', code: 'ULSTER', name: 'Ulster', countryId: 'IE', displayOrder: 4 },
      ];
      setProvinces(irishProvinces);
    } catch (error) {
      console.error('Error loading Ireland provinces:', error);
      toast.error('Failed to load provinces');
    } finally {
      setLoadingProvinces(false);
    }
  };

  const loadIrelandCounties = async (provinceCode: string) => {
    setLoadingCounties(true);
    try {
      const response = await fetch(`/api/clubs/ireland-counties?provinceCode=${provinceCode}`);
      if (response.ok) {
        const data = await response.json();
        setCounties(data);
      } else {
        throw new Error('Failed to load counties');
      }
    } catch (error) {
      console.error('Error loading Ireland counties:', error);
      toast.error('Failed to load counties');
    } finally {
      setLoadingCounties(false);
    }
  };

  const loadIrelandClubs = async (countyCode: string) => {
    setLoadingClubs(true);
    try {
      const response = await fetch(`/api/clubs/ireland-clubs?countyCode=${countyCode}`);
      if (response.ok) {
        const data = await response.json();
        setClubs(data);
      } else {
        throw new Error('Failed to load clubs');
      }
    } catch (error) {
      console.error('Error loading Ireland clubs:', error);
      toast.error('Failed to load clubs');
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
  const selectedUnitData = units.find(u => u.id === selectedUnit);
  const selectedCountryData = countries.find(c => c.id === selectedCountry);
  const selectedClubData = clubs.find(c => c.id === selectedClub);

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
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-emerald-50/80 rounded-2xl p-6 border border-emerald-200 shadow-sm" style={{ borderLeft: '4px solid #1e40af' }}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Building className="w-6 h-6 text-primary" />
              Club Membership
            </h3>
            <p className="text-gray-700">Connect with your GAA community worldwide</p>
          </div>
          {isClubMember === true && (
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">Progress</div>
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgress()}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-1">{getProgress()}%</div>
            </div>
          )}
        </div>
      </div>

      {/* Step 1: Club Membership Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-sm"
      >
        <label className="block text-lg font-semibold text-gray-800 mb-6">
          Are you currently a member of a GAA club?
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <motion.button
            type="button"
            onClick={() => handleClubMemberToggle(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative overflow-hidden p-4 md:p-5 rounded-xl font-medium transition-all duration-300 ${
              isClubMember === true
                ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2 md:gap-3">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-sm md:text-base">Yes, I&apos;m a member</span>
            </div>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => handleClubMemberToggle(false)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative overflow-hidden p-4 md:p-5 rounded-xl font-medium transition-all duration-300 ${
              isClubMember === false
                ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-200'
                : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2 md:gap-3">
              <Users className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-sm md:text-base">No, not currently</span>
            </div>
          </motion.button>
        </div>
        
        <AnimatePresence>
          {isClubMember === false && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Perfect!</p>
                  <p className="text-sm text-blue-700 mt-1">
                    You can still join PlayAway as an individual and connect with GAA communities worldwide.
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
            className="bg-blue-900 rounded-2xl p-8 shadow-2xl border border-blue-700"
          >
            <div className="space-y-6">
            {/* Progress Steps */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 overflow-x-auto py-4">
                {/* Step 1: International Unit */}
                <div className={`flex items-center space-x-2 ${selectedUnit ? 'text-green-400 drop-shadow-sm' : 'text-blue-400 drop-shadow-sm'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shadow-lg ${
                    selectedUnit ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                  }`}>
                    {selectedUnit ? <CheckCircle className="w-4 h-4" /> : '1'}
                  </div>
                  <span className="font-semibold whitespace-nowrap text-white drop-shadow-sm">International Unit</span>
                </div>
                
                {/* Conditional Steps based on Ireland vs Others */}
                {selectedUnit && (
                  <>
                    <ChevronRight className="w-4 h-4 text-white opacity-60" />
                    {isIreland() ? (
                      <>
                        {/* Ireland Flow: Province → County → Club */}
                        <div className={`flex items-center space-x-2 ${selectedProvince ? 'text-green-400 drop-shadow-sm' : 'text-blue-400 drop-shadow-sm'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shadow-lg ${
                            selectedProvince ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                          }`}>
                            {selectedProvince ? <CheckCircle className="w-4 h-4" /> : '2'}
                          </div>
                          <span className="font-semibold whitespace-nowrap text-white drop-shadow-sm">Province</span>
                        </div>
                        
                        {selectedProvince && (
                          <>
                            <ChevronRight className="w-4 h-4 text-white opacity-60" />
                            <div className={`flex items-center space-x-2 ${selectedCounty ? 'text-green-400 drop-shadow-sm' : 'text-blue-400 drop-shadow-sm'}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shadow-lg ${
                                selectedCounty ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                              }`}>
                                {selectedCounty ? <CheckCircle className="w-4 h-4" /> : '3'}
                              </div>
                              <span className="font-semibold whitespace-nowrap text-white drop-shadow-sm">County</span>
                            </div>
                          </>
                        )}
                        
                        {selectedCounty && (
                          <>
                            <ChevronRight className="w-4 h-4 text-white opacity-60" />
                            <div className={`flex items-center space-x-2 ${selectedClub ? 'text-green-400 drop-shadow-sm' : 'text-blue-400 drop-shadow-sm'}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                selectedClub ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                              }`}>
                                {selectedClub ? <CheckCircle className="w-4 h-4" /> : '4'}
                              </div>
                              <span className="font-semibold whitespace-nowrap text-white drop-shadow-sm">Club</span>
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Other Units Flow: Country → Club */}
                        <div className={`flex items-center space-x-2 ${selectedCountry ? 'text-green-400 drop-shadow-sm' : selectedUnit ? 'text-blue-400 drop-shadow-sm' : 'text-slate-400'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shadow-lg ${
                            selectedCountry ? 'bg-green-600 text-white' : selectedUnit ? 'bg-blue-600 text-white' : 'bg-slate-700 text-blue-200'
                          }`}>
                            {selectedCountry ? <CheckCircle className="w-4 h-4" /> : '2'}
                          </div>
                          <span className="font-semibold whitespace-nowrap text-white drop-shadow-sm">Country</span>
                        </div>
                        
                        {selectedCountry && (
                          <>
                            <ChevronRight className="w-4 h-4 text-white opacity-60" />
                            <div className={`flex items-center space-x-2 ${selectedClub ? 'text-green-400 drop-shadow-sm' : 'text-blue-400 drop-shadow-sm'}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                selectedClub ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                              }`}>
                                {selectedClub ? <CheckCircle className="w-4 h-4" /> : '3'}
                              </div>
                              <span className="font-semibold whitespace-nowrap text-white drop-shadow-sm">Club</span>
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
              className="bg-white rounded-xl border border-gray-200 p-3 md:p-5"
            >
              <label className="block text-sm md:text-base font-semibold text-gray-800 mb-2 md:mb-3">
                Step 1: Select International Unit
              </label>
              {loadingUnits ? (
                <div className="flex items-center justify-center py-4 md:py-6">
                  <Loader className="w-5 h-5 md:w-6 md:h-6 animate-spin text-blue-500" />
                  <span className="ml-2 text-sm md:text-base text-gray-600">Loading...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    value={selectedUnit || ''}
                    onChange={(e) => setSelectedUnit(e.target.value || null)}
                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all appearance-none touch-manipulation"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.75rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '3rem',
                      minHeight: '48px' // Ensure minimum touch target size on mobile
                    }}
                  >
                    <option value="">Select International Unit...</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </motion.div>

            {/* Step 2: Country (for non-Ireland units) */}
            <AnimatePresence>
              {selectedUnit && !isIreland() && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border border-gray-200 p-3 md:p-5"
                >
                  <label className="block text-sm md:text-base font-semibold text-gray-800 mb-2 md:mb-3">
                    Step 2: Select Country
                  </label>
                  {loadingCountries ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader className="w-6 h-6 animate-spin text-green-500" />
                      <span className="ml-2 text-gray-600">Loading countries...</span>
                    </div>
                  ) : countries.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      No countries available for this region
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <select
                        value={selectedCountry || ''}
                        onChange={(e) => setSelectedCountry(e.target.value || null)}
                        className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all appearance-none touch-manipulation"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.75rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.5em 1.5em',
                          paddingRight: '3rem',
                          minHeight: '48px'
                        }}
                      >
                        <option value="">Select Country...</option>
                        {countries.map((country) => (
                          <option key={country.id} value={country.id}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
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
                  className="bg-white rounded-xl border border-gray-200 p-3 md:p-5"
                >
                  <label className="block text-sm md:text-base font-semibold text-gray-800 mb-2 md:mb-3">
                    Step 2: Select Province
                  </label>
                  {loadingProvinces ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader className="w-6 h-6 animate-spin text-green-500" />
                      <span className="ml-2 text-gray-600">Loading provinces...</span>
                    </div>
                  ) : provinces.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      No provinces available
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <select
                        value={selectedProvince || ''}
                        onChange={(e) => setSelectedProvince(e.target.value || null)}
                        className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all appearance-none touch-manipulation"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.75rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.5em 1.5em',
                          paddingRight: '3rem',
                          minHeight: '48px'
                        }}
                      >
                        <option value="">Select Province...</option>
                        {provinces.map((province) => (
                          <option key={province.id} value={province.code}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                    </div>
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
                  className="bg-white rounded-xl border border-gray-200 p-3 md:p-5"
                >
                  <label className="block text-sm md:text-base font-semibold text-gray-800 mb-2 md:mb-3">
                    Step 3: Select County
                  </label>
                  {loadingCounties ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader className="w-6 h-6 animate-spin text-orange-500" />
                      <span className="ml-2 text-gray-600">Loading counties...</span>
                    </div>
                  ) : counties.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      No counties available for this province
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <select
                        value={selectedCounty || ''}
                        onChange={(e) => setSelectedCounty(e.target.value || null)}
                        className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all appearance-none touch-manipulation"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.75rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.5em 1.5em',
                          paddingRight: '3rem',
                          minHeight: '48px'
                        }}
                      >
                        <option value="">Select County...</option>
                        {counties.map((county) => (
                          <option key={county.id} value={county.code}>
                            {county.name}
                          </option>
                        ))}
                      </select>
                    </div>
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
                  className="bg-white rounded-xl border border-gray-200 p-3 md:p-5"
                >
                  <label className="block text-sm md:text-base font-semibold text-gray-800 mb-2 md:mb-3">
                    Step {isIreland() ? '4' : '3'}: Find Your Club
                  </label>
                  
                  {loadingClubs ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader className="w-6 h-6 animate-spin text-purple-500 mr-2" />
                      <span className="text-gray-600">Loading clubs...</span>
                    </div>
                  ) : clubs.length > 0 ? (
                    <>
                      {/* Search Input */}
                      <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={clubSearchTerm}
                          onChange={(e) => setClubSearchTerm(e.target.value)}
                          placeholder="Search clubs by name or location..."
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                        />
                      </div>


                      {/* Club Count (when more than 5) */}
                      {filteredClubs.length > 5 && (
                        <div className="mb-4 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <div className="flex items-center gap-1.5">
                              <Building className="w-4 h-4 text-blue-700" />
                              <span className="text-sm font-medium text-blue-700">{filteredClubs.length} clubs found</span>
                            </div>
                            <span className="text-xs text-blue-600 sm:before:content-['•'] sm:before:mr-2">Scroll to see all</span>
                          </div>
                        </div>
                      )}

                      {/* Club Results */}
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {filteredClubs.map((club) => (
                          <motion.button
                            key={club.id}
                            type="button"
                            onClick={() => handleClubSelection(club.id)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={`w-full p-2 md:p-3 rounded-lg border-2 text-left transition-all ${
                              selectedClub === club.id
                                ? 'border-purple-500 bg-purple-50 shadow-md'
                                : 'border-gray-200 hover:border-purple-500 hover:bg-purple-50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm md:text-base text-gray-900 truncate">
                                  {club.name}
                                </h4>
                                {club.location && (
                                  <p className="text-xs md:text-sm text-gray-500 mt-0.5 truncate">
                                    {club.location.split(',')[0].trim()}
                                  </p>
                                )}
                              </div>
                              {selectedClub === club.id && (
                                <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0" />
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>

                      {filteredClubs.length === 0 && clubSearchTerm && (
                        <div className="text-center py-8">
                          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-600">No clubs found matching &quot;{clubSearchTerm}&quot;</p>
                          <p className="text-sm text-gray-500 mt-1">Try a different search term or add your club manually</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">No clubs found in this area</p>
                      <p className="text-sm text-gray-400">Help us expand our directory by adding your club</p>
                    </div>
                  )}

                  {/* Add Club Button */}
                  {(selectedCountry || selectedCounty) && (
                    <motion.button
                      type="button"
                      onClick={() => {/* TODO: Implement manual club addition */}}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-4 p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-all"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">Can&apos;t find your club? Add it here</span>
                      </div>
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Selected Club Summary */}
            <AnimatePresence>
              {selectedClubData && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6"
                >
                  <div className="flex items-start gap-4">
                    {selectedClubData.imageUrl ? (
                      <Image
                        src={selectedClubData.imageUrl}
                        alt={`${selectedClubData.name} crest`}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-xl object-cover border-2 border-white shadow-lg flex-shrink-0"
                        unoptimized
                      />
                    ) : (
                      <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center border-2 border-green-200 flex-shrink-0">
                        <Building className="w-10 h-10 text-green-300" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <h3 className="text-xl font-bold text-green-900">Club Selected</h3>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">{selectedClubData.name}</h4>
                      <div className="flex items-center gap-2 text-green-700">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">
                          {selectedUnitData?.name}
                          {isIreland() ? (
                            <>
                              {selectedProvince && ` • ${provinces.find(p => p.code === selectedProvince)?.name}`}
                              {selectedCounty && ` • ${counties.find(c => c.code === selectedCounty)?.name}`}
                            </>
                          ) : (
                            selectedCountryData && ` • ${selectedCountryData.name}`
                          )}
                        </span>
                      </div>
                      {selectedClubData.verificationStatus === 'VERIFIED' && (
                        <div className="flex items-center gap-2 mt-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium text-green-600">Verified Club</span>
                        </div>
                      )}
                    </div>
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