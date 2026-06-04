import { TIMELINE_MARKERS } from '@/constants/matchEvents';

interface TimelineMarkerProps {
  minute: number;
  label: string;
}

function TimelineMarker({ minute, label }: TimelineMarkerProps) {
  const endOfShootout = label === TIMELINE_MARKERS.END_OF_SHOOTOUT.label;

  return (
    <div className="relative my-8 flex justify-center">
      <div className="z-10 flex items-center gap-2 rounded-full border bg-background px-4 py-1 shadow-sm">
        {!endOfShootout && <span className="text-xs font-bold">{minute}'</span>}

        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}

export default TimelineMarker;
