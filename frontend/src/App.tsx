import './App.css';

import { Route, Routes } from 'react-router-dom';

import AppLayout from './components/layout/AppLayout';
import HomePage from './components/pages/HomePage';
import StandingsPage from './components/pages/StandingsPage';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/standings" element={<StandingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
