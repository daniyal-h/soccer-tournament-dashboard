import { Outlet } from 'react-router-dom';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <nav className="border-b">Navbar</nav>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
