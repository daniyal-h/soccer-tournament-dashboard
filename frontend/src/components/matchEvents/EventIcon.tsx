import { ArrowLeftRight, Goal, RectangleVertical, XCircle } from 'lucide-react';

import type { EventType } from '@/types/matchEvents';

interface EventIconProps {
  eventType: EventType;
}

const EventIcon = ({ eventType }: EventIconProps) => {
  switch (eventType) {
    case 'goal':
    case 'penalty_goal':
      return <Goal className="h-5 w-5 text-green-500" />;

    case 'own_goal':
      return <Goal className="h-5 w-5 text-red-500" />;

    case 'penalty_miss':
      return <XCircle className="h-5 w-5 text-red-500" />;

    case 'yellow_card':
      return <RectangleVertical className="h-5 w-5 fill-yellow-400 text-yellow-400" />;

    case 'red_card':
      return <RectangleVertical className="h-5 w-5 fill-red-500 text-red-500" />;

    case 'substitution':
      return <ArrowLeftRight className="h-5 w-5 text-blue-500" />;
  }
};

export default EventIcon;
