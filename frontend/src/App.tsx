import '@/App.css';

import { Route, Routes } from 'react-router-dom';

import AppLayout from '@/components/layout/AppLayout';
import Schedule from '@/pages/Schedule';
import Standings from '@/pages/Standings';
import NotFound from '@/pages/NotFound';
import TeamProfile from '@/pages/TeamProfile';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/" element={<Standings />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/teams/:teamId" element={<TeamProfile />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
