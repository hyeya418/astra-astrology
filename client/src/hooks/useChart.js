import { useState, useCallback } from 'react';
import {
  getNatalChart,
  getPersonaAnalysis,
  getEnergyAnalysis,
  getCareerAnalysis,
  getSynastryAnalysis,
} from '../api/chartApi';

export function useChart() {
  const [chart, setChart] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchChart = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getNatalChart(data);
      setChart(result);
      setFormData(data);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { chart, formData, loading, error, fetchChart };
}

export function useAnalysis(type) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiMap = {
    persona: getPersonaAnalysis,
    energy: getEnergyAnalysis,
    career: getCareerAnalysis,
  };

  const fetch = useCallback(async (formData) => {
    const apiFn = apiMap[type];
    if (!apiFn) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await apiFn(formData);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [type]);

  return { data, loading, error, fetch };
}

export function useSynastry() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async (person1, person2) => {
    if (!person1 || !person2) { setData(null); setError(null); return; }
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await getSynastryAnalysis(person1, person2);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetch };
}
