import './App.css';

import { Route, Routes } from 'react-router-dom';

import AppLayout from './components/layout/AppLayout';
import Home from './components/pages/Home';
import Schedule from './components/pages/Schedule';
import Standings from './components/pages/Standings';
import NotFound from './components/pages/NotFound';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/standings" element={<Standings />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
