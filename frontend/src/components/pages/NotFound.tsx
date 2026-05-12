const NotFound = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-medium text-muted-foreground">404 ERROR</p>

      <h1 className="mt-2 text-5xl font-bold tracking-tight">Page not found</h1>

      <p className="mt-4 max-w-md text-muted-foreground">
        The page you are looking for does not exist or the link is invalid.
      </p>
    </div>
  );
};

export default NotFound;
