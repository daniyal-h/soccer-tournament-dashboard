import { Outlet } from 'react-router-dom';

import Navbar from './Navbar';
import PageContainer from './PageContainer';
import ScrollToTopButton from './ScrollToTopButton';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1">
        <PageContainer>
          <Outlet />
        </PageContainer>

        <ScrollToTopButton />
      </main>
    </div>
  );
};

export default AppLayout;
