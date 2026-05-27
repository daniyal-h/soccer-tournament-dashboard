import { Button } from '../ui/button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onAction?: () => void | Promise<void>;
  actionLabel?: string;
}

const ErrorState = ({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again later.',
  onAction,
  actionLabel = 'Try again',
}: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <h2 className="text-2xl font-semibold">{title}</h2>

      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>

      {/* If refetch logic is given, display a 'Try again' button */}
      {onAction && (
        <Button
          onClick={() => void onAction()}
          className="mt-5 min-w-32 px-6 cursor-pointer py-2 shadow-sm transition-all hover:scale-[1.02]"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
