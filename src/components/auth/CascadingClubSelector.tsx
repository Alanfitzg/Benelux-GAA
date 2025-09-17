"use client";

import { useState, useEffect } from 'react';
import { Users, ChevronDown, Plus, AlertCircle, CheckCircle, Globe, MapPin, Building } from 'lucide-react';
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
  internationalUnitId: string;
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
  dataSource?: string;
}

interface CascadingClubSelectorProps {
  value: string | null;
  onChange: (clubId: string | null, isClubMember: boolean) => void;
  required?: boolean;
}

const SPORTS_OPTIONS = [
  'Gaelic Football',
  'Hurling',
  'Camogie',
  'Ladies Football',
  'Handball',
  'Rounders'
];

export default function CascadingClubSelector({ value, onChange, required = false }: CascadingClubSelectorProps) {
  // Toggle state
  const [isClubMember, setIsClubMember] = useState<boolean | null>(null);
  
  // Selection states
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedClub, setSelectedClub] = useState<string | null>(value);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  
  // Data states
  const [units, setUnits] = useState<InternationalUnit[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [counties, setCounties] = useState<County[]>([]);
  
  // Loading states
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const [loadingCounties, setLoadingCounties] = useState(false);
  
  // Manual submission state
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualSubmission, setManualSubmission] = useState({
    name: '',
    countryName: '',
    regionName: '',
    sportsSupported: [] as string[],
    website: '',
    email: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Load international units on mount
  useEffect(() => {
    loadInternationalUnits();
  }, []);

  // Load countries when unit is selected (or load regions directly for Britain)
  useEffect(() => {
    if (selectedUnit) {
      if (isBritain()) {
        // Britain: skip countries and load regions directly
        loadBritainRegions();
        setCountries([]);
      } else if (isNewYork()) {
        // New York: skip countries and regions, load clubs directly
        loadNewYorkClubs();
        setCountries([]);
        setRegions([]);
      } else if (isUSAGAA()) {
        // USA GAA: skip countries and load divisions (regions) directly
        loadUSAGAADivisions();
        setCountries([]);
      } else if (isCanada()) {
        // Canada: skip countries and load divisions (regions) directly
        loadCanadaDivisions();
        setCountries([]);
      } else {
        // Other units: load countries normally
        loadCountries(selectedUnit);
        setRegions([]);
      }
      setSelectedCountry(null);
      setSelectedRegion(null);
      setSelectedClub(null);
      setSelectedProvince(null);
      setSelectedCounty(null);
      setClubs([]);
      setCounties([]);
    }
  }, [selectedUnit]);

  // Load regions when country is selected (if applicable)
  useEffect(() => {
    if (selectedCountry) {
      const country = countries.find(c => c.id === selectedCountry);
      if (country?.hasRegions) {
        loadRegions(selectedCountry);
      } else {
        setRegions([]);
        setSelectedRegion(null);
        // Load clubs directly for countries without regions
        loadClubs(selectedCountry, null);
      }
    }
  }, [selectedCountry, countries]);

  // Load counties when Irish province is selected
  useEffect(() => {
    if (selectedProvince) {
      loadIrishCounties(selectedProvince);
      setSelectedCounty(null);
      setClubs([]);
    }
  }, [selectedProvince]);

  // Load clubs when county is selected (Ireland) or region is selected (other countries/Britain)
  useEffect(() => {
    if (selectedCounty) {
      // Ireland-specific: load clubs by county
      loadIrishClubs(selectedCounty);
    } else if (selectedRegion && !isIreland() && !isBritain() && !isNewYork() && !isUSAGAA() && !isCanada()) {
      // Other countries: load clubs by region
      loadClubs(selectedCountry, selectedRegion);
    } else if (selectedRegion && isBritain()) {
      // Britain: load clubs by region with Britain country ID
      loadBritainClubs(selectedRegion);
    } else if (selectedRegion && isUSAGAA()) {
      // USA GAA: load clubs by division (region)
      loadUSAGAAClubs(selectedRegion);
    } else if (selectedRegion && isCanada()) {
      // Canada: load clubs by division (region)
      loadCanadaClubs(selectedRegion);
    }
    // Note: New York clubs are loaded directly when unit is selected (no regions/countries)
  }, [selectedCounty, selectedRegion, selectedCountry]);

  const loadInternationalUnits = async () => {
    setLoadingUnits(true);
    try {
      const response = await fetch('/api/clubs/international-units-sql');
      if (response.ok) {
        const data = await response.json();
        setUnits(data);
      } else {
        console.error('Failed to load international units:', response.status);
        toast.error('Failed to load international units');
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
        console.error('Failed to load countries:', response.status);
        toast.error('Failed to load countries');
      }
    } catch (error) {
      console.error('Error loading countries:', error);
      toast.error('Failed to load countries');
    } finally {
      setLoadingCountries(false);
    }
  };

  const loadRegions = async (countryId: string) => {
    setLoadingRegions(true);
    try {
      const response = await fetch(`/api/clubs/regions-sql?countryId=${countryId}`);
      if (response.ok) {
        const data = await response.json();
        setRegions(data);
      } else {
        console.error('Failed to load regions:', response.status);
        toast.error('Failed to load regions');
      }
    } catch (error) {
      console.error('Error loading regions:', error);
      toast.error('Failed to load regions');
    } finally {
      setLoadingRegions(false);
    }
  };

  const loadBritainRegions = async () => {
    setLoadingRegions(true);
    try {
      // Get Britain country ID first
      const unitResponse = await fetch('/api/clubs/international-units-sql');
      if (!unitResponse.ok) throw new Error('Failed to load units');
      const units = await unitResponse.json();
      const britainUnit = units.find((u: any) => u.code === 'BRITAIN');
      if (!britainUnit) throw new Error('Britain unit not found');

      const countryResponse = await fetch(`/api/clubs/countries-sql?unitId=${britainUnit.id}`);
      if (!countryResponse.ok) throw new Error('Failed to load Britain country');
      const countries = await countryResponse.json();
      const britainCountry = countries.find((c: any) => c.code === 'BRITAIN');
      if (!britainCountry) throw new Error('Britain country not found');

      // Load Britain regions
      const response = await fetch(`/api/clubs/regions-sql?countryId=${britainCountry.id}`);
      if (response.ok) {
        const data = await response.json();
        setRegions(data);
      } else {
        console.error('Failed to load Britain regions:', response.status);
        toast.error('Failed to load regions');
      }
    } catch (error) {
      console.error('Error loading Britain regions:', error);
      toast.error('Failed to load regions');
    } finally {
      setLoadingRegions(false);
    }
  };

  const loadBritainClubs = async (regionId: string) => {
    setLoadingClubs(true);
    try {
      // Get Britain country ID first
      const unitResponse = await fetch('/api/clubs/international-units-sql');
      if (!unitResponse.ok) throw new Error('Failed to load units');
      const units = await unitResponse.json();
      const britainUnit = units.find((u: any) => u.code === 'BRITAIN');
      if (!britainUnit) throw new Error('Britain unit not found');

      const countryResponse = await fetch(`/api/clubs/countries-sql?unitId=${britainUnit.id}`);
      if (!countryResponse.ok) throw new Error('Failed to load Britain country');
      const countries = await countryResponse.json();
      const britainCountry = countries.find((c: any) => c.code === 'BRITAIN');
      if (!britainCountry) throw new Error('Britain country not found');

      // Load clubs by region
      const params = new URLSearchParams();
      params.append('countryId', britainCountry.id);
      params.append('regionId', regionId);
      
      const response = await fetch(`/api/clubs/filtered-sql?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setClubs(data);
      } else {
        console.error('Failed to load Britain clubs:', response.status);
        toast.error('Failed to load clubs');
      }
    } catch (error) {
      console.error('Error loading Britain clubs:', error);
      toast.error('Failed to load clubs');
    } finally {
      setLoadingClubs(false);
    }
  };

  const loadNewYorkClubs = async () => {
    setLoadingClubs(true);
    try {
      // Get New York unit first
      const unitResponse = await fetch('/api/clubs/international-units-sql');
      if (!unitResponse.ok) throw new Error('Failed to load units');
      const units = await unitResponse.json();
      const newYorkUnit = units.find((u: any) => u.code === 'NEW_YORK');
      if (!newYorkUnit) throw new Error('New York unit not found');

      const countryResponse = await fetch(`/api/clubs/countries-sql?unitId=${newYorkUnit.id}`);
      if (!countryResponse.ok) throw new Error('Failed to load New York countries');
      const countries = await countryResponse.json();
      const usaCountry = countries.find((c: any) => c.code === 'US');
      if (!usaCountry) throw new Error('USA country not found under New York');

      // Load all clubs directly from New York (no regions)
      const response = await fetch(`/api/clubs/filtered-sql?countryId=${usaCountry.id}`);
      if (response.ok) {
        const data = await response.json();
        setClubs(data);
      } else {
        console.error('Failed to load New York clubs:', response.status);
        toast.error('Failed to load clubs');
      }
    } catch (error) {
      console.error('Error loading New York clubs:', error);
      toast.error('Failed to load clubs');
    } finally {
      setLoadingClubs(false);
    }
  };

  const loadUSAGAADivisions = async () => {
    setLoadingRegions(true);
    try {
      // Get USA GAA unit first
      const unitResponse = await fetch('/api/clubs/international-units-sql');
      if (!unitResponse.ok) throw new Error('Failed to load units');
      const units = await unitResponse.json();
      const usaGaaUnit = units.find((u: any) => u.code === 'USA_GAA');
      if (!usaGaaUnit) throw new Error('USA GAA unit not found');

      const countryResponse = await fetch(`/api/clubs/countries-sql?unitId=${usaGaaUnit.id}`);
      if (!countryResponse.ok) throw new Error('Failed to load USA GAA countries');
      const countries = await countryResponse.json();
      const usaCountry = countries.find((c: any) => c.code === 'USA-GAA');
      if (!usaCountry) throw new Error('USA country not found under USA GAA');

      // Load divisions (regions)
      const response = await fetch(`/api/clubs/regions-sql?countryId=${usaCountry.id}`);
      if (response.ok) {
        const data = await response.json();
        setRegions(data);
      } else {
        console.error('Failed to load USA GAA divisions:', response.status);
        toast.error('Failed to load divisions');
      }
    } catch (error) {
      console.error('Error loading USA GAA divisions:', error);
      toast.error('Failed to load divisions');
    } finally {
      setLoadingRegions(false);
    }
  };

  const loadCanadaDivisions = async () => {
    setLoadingRegions(true);
    try {
      // Get Canada unit first
      const unitResponse = await fetch('/api/clubs/international-units-sql');
      if (!unitResponse.ok) throw new Error('Failed to load units');
      const units = await unitResponse.json();
      const canadaUnit = units.find((u: any) => u.code === 'CANADA');
      if (!canadaUnit) throw new Error('Canada unit not found');

      const countryResponse = await fetch(`/api/clubs/countries-sql?unitId=${canadaUnit.id}`);
      if (!countryResponse.ok) throw new Error('Failed to load Canada countries');
      const countries = await countryResponse.json();
      const canadaCountry = countries.find((c: any) => c.code === 'CAN');
      if (!canadaCountry) throw new Error('Canada country not found under Canada unit');

      // Load divisions (regions)
      const response = await fetch(`/api/clubs/regions-sql?countryId=${canadaCountry.id}`);
      if (response.ok) {
        const data = await response.json();
        setRegions(data);
      } else {
        console.error('Failed to load Canada divisions:', response.status);
        toast.error('Failed to load divisions');
      }
    } catch (error) {
      console.error('Error loading Canada divisions:', error);
      toast.error('Failed to load divisions');
    } finally {
      setLoadingRegions(false);
    }
  };

  const loadUSAGAAClubs = async (divisionId: string) => {
    setLoadingClubs(true);
    try {
      // Get USA GAA country first
      const unitResponse = await fetch('/api/clubs/international-units-sql');
      if (!unitResponse.ok) throw new Error('Failed to load units');
      const units = await unitResponse.json();
      const usaGaaUnit = units.find((u: any) => u.code === 'USA_GAA');
      if (!usaGaaUnit) throw new Error('USA GAA unit not found');

      const countryResponse = await fetch(`/api/clubs/countries-sql?unitId=${usaGaaUnit.id}`);
      if (!countryResponse.ok) throw new Error('Failed to load USA GAA countries');
      const countries = await countryResponse.json();
      const usaCountry = countries.find((c: any) => c.code === 'USA-GAA');
      if (!usaCountry) throw new Error('USA country not found under USA GAA');

      // Load clubs by division
      const params = new URLSearchParams();
      params.append('countryId', usaCountry.id);
      params.append('regionId', divisionId);
      
      const response = await fetch(`/api/clubs/filtered-sql?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setClubs(data);
      } else {
        console.error('Failed to load USA GAA clubs:', response.status);
        toast.error('Failed to load clubs');
      }
    } catch (error) {
      console.error('Error loading USA GAA clubs:', error);
      toast.error('Failed to load clubs');
    } finally {
      setLoadingClubs(false);
    }
  };

  const loadCanadaClubs = async (divisionId: string) => {
    setLoadingClubs(true);
    try {
      // Get Canada country first
      const unitResponse = await fetch('/api/clubs/international-units-sql');
      if (!unitResponse.ok) throw new Error('Failed to load units');
      const units = await unitResponse.json();
      const canadaUnit = units.find((u: any) => u.code === 'CANADA');
      if (!canadaUnit) throw new Error('Canada unit not found');

      const countryResponse = await fetch(`/api/clubs/countries-sql?unitId=${canadaUnit.id}`);
      if (!countryResponse.ok) throw new Error('Failed to load Canada countries');
      const countries = await countryResponse.json();
      const canadaCountry = countries.find((c: any) => c.code === 'CAN');
      if (!canadaCountry) throw new Error('Canada country not found');

      const params = new URLSearchParams();
      params.append('countryId', canadaCountry.id);
      params.append('regionId', divisionId);
      
      const response = await fetch(`/api/clubs/filtered-sql?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setClubs(data);
      } else {
        console.error('Failed to load Canada clubs:', response.status);
        toast.error('Failed to load clubs');
      }
    } catch (error) {
      console.error('Error loading Canada clubs:', error);
      toast.error('Failed to load clubs');
    } finally {
      setLoadingClubs(false);
    }
  };

  const loadClubs = async (countryId: string | null, regionId: string | null) => {
    if (!countryId) return;
    
    setLoadingClubs(true);
    try {
      const params = new URLSearchParams();
      params.append('countryId', countryId);
      if (regionId) params.append('regionId', regionId);
      
      const response = await fetch(`/api/clubs/filtered-sql?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setClubs(data);
      } else {
        console.error('Failed to load clubs:', response.status);
        toast.error('Failed to load clubs');
      }
    } catch (error) {
      console.error('Error loading clubs:', error);
      toast.error('Failed to load clubs');
    } finally {
      setLoadingClubs(false);
    }
  };

  const loadIrishCounties = async (provinceCode: string) => {
    setLoadingCounties(true);
    try {
      const response = await fetch(`/api/clubs/ireland-counties?provinceCode=${provinceCode}`);
      if (response.ok) {
        const data = await response.json();
        setCounties(data);
      } else {
        console.error('Failed to load Irish counties:', response.status);
        toast.error('Failed to load counties');
      }
    } catch (error) {
      console.error('Error loading Irish counties:', error);
      toast.error('Failed to load counties');
    } finally {
      setLoadingCounties(false);
    }
  };

  const loadIrishClubs = async (countyCode: string) => {
    setLoadingClubs(true);
    try {
      const response = await fetch(`/api/clubs/ireland-clubs?countyCode=${countyCode}`);
      if (response.ok) {
        const data = await response.json();
        setClubs(data);
      } else {
        console.error('Failed to load Irish clubs:', response.status);
        toast.error('Failed to load clubs');
      }
    } catch (error) {
      console.error('Error loading Irish clubs:', error);
      toast.error('Failed to load clubs');
    } finally {
      setLoadingClubs(false);
    }
  };

  const isIreland = () => {
    const country = countries.find(c => c.id === selectedCountry);
    return country?.code === 'IE';
  };

  const isBritain = () => {
    const unit = units.find(u => u.id === selectedUnit);
    return unit?.code === 'BRITAIN';
  };

  const isNewYork = () => {
    const unit = units.find(u => u.id === selectedUnit);
    return unit?.code === 'NEW_YORK';
  };

  const isUSAGAA = () => {
    const unit = units.find(u => u.id === selectedUnit);
    return unit?.code === 'USA_GAA';
  };

  const isCanada = () => {
    const unit = units.find(u => u.id === selectedUnit);
    return unit?.code === 'CANADA';
  };

  const handleClubMemberToggle = (isMember: boolean) => {
    setIsClubMember(isMember);
    if (!isMember) {
      // Reset all selections if not a club member
      setSelectedUnit(null);
      setSelectedCountry(null);
      setSelectedRegion(null);
      setSelectedClub(null);
      onChange(null, false);
    }
  };

  const handleClubSelection = (clubId: string) => {
    setSelectedClub(clubId);
    onChange(clubId, true);
  };

  const handleManualSubmit = async () => {
    if (!manualSubmission.name || !manualSubmission.countryName) {
      toast.error('Club name and country are required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/clubs/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...manualSubmission,
          countryId: selectedCountry,
          regionId: selectedRegion,
          internationalUnitId: selectedUnit,
        }),
      });

      if (response.ok) {
        toast.success('Club submission received! It will be reviewed by our admin team.');
        setShowManualForm(false);
        setManualSubmission({
          name: '',
          countryName: '',
          regionName: '',
          sportsSupported: [],
          website: '',
          email: ''
        });
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to submit club');
      }
    } catch (error) {
      console.error('Error submitting club:', error);
      toast.error('Failed to submit club. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedUnitData = units.find(u => u.id === selectedUnit);
  const selectedCountryData = countries.find(c => c.id === selectedCountry);
  const selectedRegionData = regions.find(r => r.id === selectedRegion);
  const selectedProvinceData = regions.find(r => r.code === selectedProvince);
  const selectedCountyData = counties.find(c => c.code === selectedCounty);
  const selectedClubData = clubs.find(c => c.id === selectedClub);

  return (
    <div className="space-y-6">
      {/* Step 1: Club Membership Toggle */}
      <div className="bg-gray-50 rounded-xl p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-4">
          Are you currently a member of a GAA club?
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleClubMemberToggle(true)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              isClubMember === true
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-green-600'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Yes, I'm a member</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleClubMemberToggle(false)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              isClubMember === false
                ? 'bg-gray-600 text-white shadow-lg'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              <span>No, not currently</span>
            </div>
          </button>
        </div>
        
        {isClubMember === false && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              No problem! You can still join PlayAway as an individual member and connect with GAA communities worldwide.
            </p>
          </div>
        )}
      </div>

      {/* Club Selection Form - Only show if user is a club member */}
      {isClubMember === true && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-green-600" />
            Select Your GAA Club
          </h3>

          {/* Step 2: International Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 1: Select International Unit
            </label>
            <select
              value={selectedUnit || ''}
              onChange={(e) => setSelectedUnit(e.target.value || null)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-colors"
              disabled={loadingUnits}
            >
              <option value="">Select International Unit...</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Country (skip for Britain, New York, and USA GAA) */}
          {selectedUnit && !isBritain() && !isNewYork() && !isUSAGAA() && !isCanada() && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Step 2: Select Country
              </label>
              <select
                value={selectedCountry || ''}
                onChange={(e) => setSelectedCountry(e.target.value || null)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-colors"
                disabled={loadingCountries || countries.length === 0}
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

          {/* Step 3: Ireland Province or Regular Region */}
          {selectedCountry && isIreland() && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Step 3: Select Province
              </label>
              <select
                value={selectedProvince || ''}
                onChange={(e) => setSelectedProvince(e.target.value || null)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-colors"
                disabled={loadingRegions || regions.length === 0}
              >
                <option value="">Select Province...</option>
                {regions.map((province) => (
                  <option key={province.id} value={province.code}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Step 2/3: Region/Division Selection (Britain regions, USA GAA divisions, or Non-Ireland countries, skip for New York) */}
          {((selectedCountry && !isIreland() && countries.find(c => c.id === selectedCountry)?.hasRegions) || 
            (isBritain() && regions.length > 0) ||
            (isUSAGAA() && regions.length > 0) ||
            (isCanada() && regions.length > 0)) && !isNewYork() && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Step {isBritain() || isUSAGAA() || isCanada() ? '2' : '3'}: Select {isUSAGAA() || isCanada() ? 'Division' : 'Region'}
              </label>
              <select
                value={selectedRegion || ''}
                onChange={(e) => setSelectedRegion(e.target.value || null)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-colors"
                disabled={loadingRegions || regions.length === 0}
              >
                <option value="">Select {isUSAGAA() || isCanada() ? 'Division' : 'Region'}...</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Step 4: Ireland County */}
          {selectedProvince && isIreland() && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Step 4: Select County
              </label>
              <select
                value={selectedCounty || ''}
                onChange={(e) => setSelectedCounty(e.target.value || null)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-colors"
                disabled={loadingCounties || counties.length === 0}
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

          {/* Step 2/3/4/5: Club Selection */}
          {((selectedCountry && !countries.find(c => c.id === selectedCountry)?.hasRegions) ||
            (selectedRegion && !isIreland() && !isBritain() && !isUSAGAA() && !isCanada()) ||
            (selectedRegion && isBritain()) ||
            (selectedRegion && isUSAGAA()) ||
            (selectedRegion && isCanada()) ||
            (selectedCounty && isIreland()) ||
            (isNewYork() && clubs.length >= 0)) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Step {isIreland() ? '5' : (isBritain() || isUSAGAA() || isCanada() ? '3' : (isNewYork() ? '2' : (countries.find(c => c.id === selectedCountry)?.hasRegions ? '4' : '3')))}: Select Club
              </label>
              {loadingClubs ? (
                <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                    Loading clubs...
                  </div>
                </div>
              ) : clubs.length > 0 ? (
                <select
                  value={selectedClub || ''}
                  onChange={(e) => handleClubSelection(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-colors"
                >
                  <option value="">Select Club...</option>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                      {club.verificationStatus === 'VERIFIED' && ' ✓'}
                      {club.location && ` - ${club.location}`}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500">
                  No clubs found in this area
                </div>
              )}
            </div>
          )}

          {/* Selected Club Summary */}
          {selectedClubData && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">{selectedClubData.name}</p>
                  <p className="text-sm text-green-700 mt-1">
                    {selectedUnitData?.name}
                    {selectedCountryData && ` • ${selectedCountryData.name}`}
                    {isIreland() && selectedProvinceData && ` • ${selectedProvinceData.name}`}
                    {isIreland() && selectedCountyData && ` • ${selectedCountyData.name}`}
                    {!isIreland() && selectedRegionData && ` • ${selectedRegionData.name}`}
                  </p>
                  {selectedClubData.verificationStatus === 'VERIFIED' && (
                    <p className="text-xs text-green-600 mt-1">✓ Verified Club</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Can't find your club? */}
          {selectedCountry && !loadingClubs && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900">Can't find your club?</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Help us add your club to our global directory.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowManualForm(true)}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Register Your Club Manually
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Manual Club Registration Form */}
          {showManualForm && (
            <div className="mt-6 p-6 bg-white border-2 border-gray-200 rounded-xl">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Register New Club</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Club Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualSubmission.name}
                    onChange={(e) => setManualSubmission({ ...manualSubmission, name: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    placeholder="Enter club name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualSubmission.countryName}
                    onChange={(e) => setManualSubmission({ ...manualSubmission, countryName: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    placeholder="Enter country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Region/State/County
                  </label>
                  <input
                    type="text"
                    value={manualSubmission.regionName}
                    onChange={(e) => setManualSubmission({ ...manualSubmission, regionName: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    placeholder="Enter region (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sports Supported
                  </label>
                  <div className="space-y-2">
                    {SPORTS_OPTIONS.map((sport) => (
                      <label key={sport} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={manualSubmission.sportsSupported.includes(sport)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setManualSubmission({
                                ...manualSubmission,
                                sportsSupported: [...manualSubmission.sportsSupported, sport]
                              });
                            } else {
                              setManualSubmission({
                                ...manualSubmission,
                                sportsSupported: manualSubmission.sportsSupported.filter(s => s !== sport)
                              });
                            }
                          }}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{sport}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={manualSubmission.website}
                    onChange={(e) => setManualSubmission({ ...manualSubmission, website: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={manualSubmission.email}
                    onChange={(e) => setManualSubmission({ ...manualSubmission, email: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    placeholder="club@example.com"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowManualForm(false)}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleManualSubmit}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </span>
                    ) : (
                      'Submit Club'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}