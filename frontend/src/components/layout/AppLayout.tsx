import { Outlet } from "react-router-dom"

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <nav>Navbar</nav>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout