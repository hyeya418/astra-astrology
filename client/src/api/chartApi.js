import axios from 'axios';

const api = axios.create({
  baseURL: '/chart',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

function handleError(err) {
  const msg = err.response?.data?.error ?? err.message ?? '알 수 없는 오류가 발생했습니다.';
  throw new Error(msg);
}

export async function getNatalChart(formData) {
  try {
    const { data } = await api.post('/natal', formData);
    return data.data;
  } catch (err) { handleError(err); }
}

export async function getPersonaAnalysis(formData) {
  try {
    const { data } = await api.post('/analyze/persona', formData);
    return data.data;
  } catch (err) { handleError(err); }
}

export async function getEnergyAnalysis(formData) {
  try {
    const { data } = await api.post('/analyze/energy', formData);
    return data.data;
  } catch (err) { handleError(err); }
}

export async function getCareerAnalysis(formData) {
  try {
    const { data } = await api.post('/analyze/career', formData);
    return data.data;
  } catch (err) { handleError(err); }
}

export async function getSynastryAnalysis(person1, person2) {
  try {
    const { data } = await api.post('/analyze/synastry', { person1, person2 });
    return data.data;
  } catch (err) { handleError(err); }
}
