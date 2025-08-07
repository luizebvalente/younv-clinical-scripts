import { useState, useEffect, useCallback } from 'react';
import clinicService from '../services/clinicService';
import { useAuth } from '../contexts/AuthContext';

export const useClinics = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { hasPermission } = useAuth();

  const loadClinics = useCallback(async () => {
    if (!hasPermission('super_admin')) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await clinicService.getAllClinics();
      setClinics(result);
    } catch (err) {
      setError(err.message);
      console.error('Load clinics error:', err);
    } finally {
      setLoading(false);
    }
  }, [hasPermission]);

  const createClinic = async (clinicData) => {
    try {
      const newClinic = await clinicService.createClinic(clinicData);
      setClinics(prev => [...prev, newClinic]);
      return newClinic;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateClinic = async (clinicId, updateData) => {
    try {
      const updated = await clinicService.updateClinic(clinicId, updateData);
      setClinics(prev => prev.map(clinic => 
        clinic.id === clinicId ? updated : clinic
      ));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deactivateClinic = async (clinicId) => {
    try {
      await clinicService.deactivateClinic(clinicId);
      setClinics(prev => prev.map(clinic => 
        clinic.id === clinicId ? { ...clinic, isActive: false } : clinic
      ));
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const activateClinic = async (clinicId) => {
    try {
      await clinicService.activateClinic(clinicId);
      setClinics(prev => prev.map(clinic => 
        clinic.id === clinicId ? { ...clinic, isActive: true } : clinic
      ));
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    loadClinics();
  }, [loadClinics]);

  return {
    clinics,
    loading,
    error,
    createClinic,
    updateClinic,
    deactivateClinic,
    activateClinic,
    refreshClinics: loadClinics
  };
};

export const useClinic = (clinicId) => {
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const loadClinic = useCallback(async () => {
    if (!clinicId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await clinicService.getClinicById(clinicId);
      setClinic(result);
    } catch (err) {
      setError(err.message);
      console.error('Load clinic error:', err);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  const loadStats = useCallback(async () => {
    if (!clinicId) return;

    try {
      const result = await clinicService.getClinicStats(clinicId);
      setStats(result);
    } catch (err) {
      console.error('Load clinic stats error:', err);
    }
  }, [clinicId]);

  const updateClinic = async (updateData) => {
    try {
      const updated = await clinicService.updateClinic(clinicId, updateData);
      setClinic(updated);
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    loadClinic();
    loadStats();
  }, [loadClinic, loadStats]);

  return {
    clinic,
    stats,
    loading,
    error,
    updateClinic,
    refreshClinic: loadClinic,
    refreshStats: loadStats
  };
};

export const useClinicSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      const searchResults = await clinicService.searchClinics(searchTerm);
      setResults(searchResults);
    } catch (err) {
      setError(err.message);
      console.error('Search clinics error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clearResults
  };
};

