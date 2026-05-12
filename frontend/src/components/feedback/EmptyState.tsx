interface EmptyStateProps {
  title?: string;
  description?: string;
}

const EmptyState = ({
  title = 'No data available',
  description = 'There is currently nothing to display.',
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <h2 className="text-2xl font-semibold">{title}</h2>

      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default EmptyState;
