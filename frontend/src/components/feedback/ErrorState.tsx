interface ErrorStateProps {
  title?: string;
  description?: string;
}

const ErrorState = ({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again later.',
}: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <h2 className="text-2xl font-semibold">{title}</h2>

      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default ErrorState;
