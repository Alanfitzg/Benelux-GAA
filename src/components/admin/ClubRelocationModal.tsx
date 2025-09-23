'use client';

import { useState, useEffect } from 'react';

type InternationalUnit = {
  id: string;
  name: string;
};

type Country = {
  id: string;
  name: string;
  internationalUnitId: string;
};

type Region = {
  id: string;
  name: string;
  countryId: string;
};

type Club = {
  id: string;
  name: string;
  internationalUnit?: { name: string } | null;
  country?: { name: string } | null;
  regionRecord?: { name: string } | null;
};

type Props = {
  club: Club;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function ClubRelocationModal({ club, isOpen, onClose, onSuccess }: Props) {
  const [internationalUnits, setInternationalUnits] = useState<InternationalUnit[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);

  const [selectedInternationalUnit, setSelectedInternationalUnit] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Load international units on mount
  useEffect(() => {
    if (isOpen) {
      fetchInternationalUnits();
    }
  }, [isOpen]);

  // Load countries when international unit changes
  useEffect(() => {
    if (selectedInternationalUnit) {
      fetchCountries(selectedInternationalUnit);
      setSelectedCountry('');
      setSelectedRegion('');
      setRegions([]);
    } else {
      setCountries([]);
      setSelectedCountry('');
      setSelectedRegion('');
      setRegions([]);
    }
  }, [selectedInternationalUnit]);

  // Load regions when country changes
  useEffect(() => {
    if (selectedCountry) {
      fetchRegions(selectedCountry);
      setSelectedRegion('');
    } else {
      setRegions([]);
      setSelectedRegion('');
    }
  }, [selectedCountry]);

  const fetchInternationalUnits = async () => {
    try {
      const response = await fetch('/api/clubs/international-units-sql');
      const data = await response.json();
      setInternationalUnits(data);
    } catch (error) {
      console.error('Error fetching international units:', error);
      setError('Failed to load international units');
    }
  };

  const fetchCountries = async (internationalUnitId: string) => {
    try {
      const response = await fetch(`/api/clubs/countries-sql?internationalUnitId=${internationalUnitId}`);
      const data = await response.json();
      setCountries(data);
    } catch (error) {
      console.error('Error fetching countries:', error);
      setError('Failed to load countries');
    }
  };

  const fetchRegions = async (countryId: string) => {
    try {
      const response = await fetch(`/api/clubs/regions?countryId=${countryId}`);
      const data = await response.json();
      setRegions(data);
    } catch (error) {
      console.error('Error fetching regions:', error);
      setError('Failed to load regions');
    }
  };

  const handleRelocate = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/clubs/${club.id}/relocate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          internationalUnitId: selectedInternationalUnit || null,
          countryId: selectedCountry || null,
          regionId: selectedRegion || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to relocate club');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error relocating club:', error);
      setError(error instanceof Error ? error.message : 'Failed to relocate club');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedInternationalUnit('');
    setSelectedCountry('');
    setSelectedRegion('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Relocate Club</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Club:</strong> {club.name}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            <strong>Current Location:</strong>{' '}
            {club.internationalUnit?.name || 'No international unit'} →{' '}
            {club.country?.name || 'No country'} →{' '}
            {club.regionRecord?.name || 'No region'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              International Unit
            </label>
            <select
              value={selectedInternationalUnit}
              onChange={(e) => setSelectedInternationalUnit(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              disabled={isLoading}
            >
              <option value="">Select International Unit</option>
              {internationalUnits.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              disabled={isLoading || !selectedInternationalUnit}
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Region (Optional)
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              disabled={isLoading || !selectedCountry}
            >
              <option value="">Select Region</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            disabled={isLoading}
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleRelocate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading || !selectedInternationalUnit || !selectedCountry}
            type="button"
          >
            {isLoading ? 'Relocating...' : 'Relocate Club'}
          </button>
        </div>
      </div>
    </div>
  );
}