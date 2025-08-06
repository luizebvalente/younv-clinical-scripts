import { useState, useEffect, useCallback } from 'react';
import scriptService from '../services/scriptService';
import { useAuth } from '../contexts/AuthContext';

export const useScripts = (clinicId, options = {}) => {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const { userData } = useAuth();

  const { categoryId, autoLoad = true } = options;

  const loadScripts = useCallback(async (reset = false) => {
    if (!clinicId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await scriptService.getScriptsByClinic(clinicId, {
        categoryId,
        lastDoc: reset ? null : lastDoc
      });

      if (reset) {
        setScripts(result.scripts);
      } else {
        setScripts(prev => [...prev, ...result.scripts]);
      }

      setHasMore(result.hasMore);
      setLastDoc(result.lastDoc);
    } catch (err) {
      setError(err.message);
      console.error('Load scripts error:', err);
    } finally {
      setLoading(false);
    }
  }, [clinicId, categoryId, lastDoc]);

  const refreshScripts = useCallback(() => {
    setLastDoc(null);
    loadScripts(true);
  }, [loadScripts]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadScripts(false);
    }
  }, [loading, hasMore, loadScripts]);

  useEffect(() => {
    if (autoLoad && clinicId) {
      refreshScripts();
    }
  }, [clinicId, categoryId, autoLoad, refreshScripts]);

  return {
    scripts,
    loading,
    error,
    hasMore,
    loadScripts,
    refreshScripts,
    loadMore
  };
};

export const useScript = (scriptId) => {
  const [script, setScript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadScript = useCallback(async () => {
    if (!scriptId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await scriptService.getScriptById(scriptId);
      setScript(result);
    } catch (err) {
      setError(err.message);
      console.error('Load script error:', err);
    } finally {
      setLoading(false);
    }
  }, [scriptId]);

  const updateScript = async (updateData) => {
    try {
      const updated = await scriptService.updateScript(scriptId, updateData);
      setScript(updated);
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteScript = async () => {
    try {
      await scriptService.deleteScript(scriptId);
      setScript(null);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    loadScript();
  }, [loadScript]);

  return {
    script,
    loading,
    error,
    updateScript,
    deleteScript,
    refreshScript: loadScript
  };
};

export const useScriptSearch = (clinicId) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (searchTerm) => {
    if (!clinicId || !searchTerm.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const searchResults = await scriptService.searchScripts(searchTerm, clinicId);
      setResults(searchResults);
    } catch (err) {
      setError(err.message);
      console.error('Search scripts error:', err);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

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

export const useScriptsByCategory = (categoryId, clinicId) => {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadScripts = useCallback(async () => {
    if (!categoryId || !clinicId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await scriptService.getScriptsByCategory(categoryId, clinicId);
      setScripts(result);
    } catch (err) {
      setError(err.message);
      console.error('Load scripts by category error:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, clinicId]);

  useEffect(() => {
    loadScripts();
  }, [loadScripts]);

  return {
    scripts,
    loading,
    error,
    refreshScripts: loadScripts
  };
};

