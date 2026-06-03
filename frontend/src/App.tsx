import { Route, Routes } from 'react-router-dom';

import AppLayout from '@/components/layout/AppLayout';

import MatchDetails from './pages/MatchDetails';

import './App.css';
import Bracket from '@/pages/Bracket';
import NotFound from '@/pages/NotFound';
import PlayerStats from '@/pages/PlayerStats';
import Schedule from '@/pages/Schedule';
import Standings from '@/pages/Standings';
import TeamProfile from '@/pages/TeamProfile';
import Teams from '@/pages/Teams';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Standings />} />
        <Route path="/bracket" element={<Bracket />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/matches/:matchId" element={<MatchDetails />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/teams/:teamId" element={<TeamProfile />} />
        <Route path="/stats" element={<PlayerStats />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
