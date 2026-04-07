import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import InputForm from './pages/InputForm';
import ChartResult from './pages/ChartResult';
import Analysis from './pages/Analysis';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/input" element={<InputForm />} />
      <Route path="/chart" element={<ChartResult />} />
      <Route path="/analysis" element={<Analysis />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
