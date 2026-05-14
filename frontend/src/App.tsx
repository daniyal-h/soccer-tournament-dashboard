import './App.css';

import { Route, Routes } from 'react-router-dom';

import AppLayout from '@/components/layout/AppLayout';
import Schedule from '@/pages/Schedule';
import Standings from '@/pages/Standings';
import NotFound from '@/pages/NotFound';
import TeamProfile from '@/pages/TeamProfile';
import Bracket from '@/pages/Bracket';
import Teams from '@/pages/Teams';
import PlayerStats from '@/pages/PlayerStats';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Standings />} />
        <Route path="/bracket" element={<Bracket />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/teams/:teamId" element={<TeamProfile />} />
        <Route path="/stats" element={<PlayerStats />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
