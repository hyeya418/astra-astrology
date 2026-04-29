import axios from 'axios';

const API_ORIGIN = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : '');
const BASE_URL = API_ORIGIN ? `${API_ORIGIN}/chart` : '/chart';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 180000,
  headers: { 'Content-Type': 'application/json' },
});

function handleError(err) {
  const msg = err.response?.data?.error
    ?? (err.message === 'Network Error' ? '백엔드 서버에 연결하지 못했어요. 서버가 실행 중인지 확인해주세요.' : err.message)
    ?? '알 수 없는 오류가 발생했습니다.';
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

export async function getFortuneAnalysis(formData) {
  try {
    const { data } = await api.post('/analyze/fortune', formData);
    return data.data;
  } catch (err) { handleError(err); }
}

export async function getSajuAnalysis(formData) {
  try {
    const { data } = await api.post('/analyze/saju', formData);
    return data.data;
  } catch (err) { handleError(err); }
}

export async function getDailyAnalysis(formData) {
  try {
    const { data } = await api.post('/analyze/daily', formData);
    return data;
  } catch (err) { handleError(err); }
}

export async function getSynastryAnalysis(person1, person2) {
  try {
    const { data } = await api.post('/analyze/synastry', { person1, person2 });
    return data.data;
  } catch (err) { handleError(err); }
}
