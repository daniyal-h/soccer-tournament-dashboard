import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GroupTable } from "./GroupTable";
import { type Standing } from "@/constants/standings";

interface GroupCardProps {
  group: string;
  rows: Standing[];
}

// a card contains an accordion with its group identifier to show a group table
const GroupCard = ({ group, rows }: GroupCardProps) => {
  return (
    <Card className="w-full shadow-sm">
      <CardContent className="p-3">
        <Accordion type="single" collapsible defaultValue="standings">
          <AccordionItem value="standings">
            <AccordionTrigger>Group {group}</AccordionTrigger>
            <AccordionContent>
              <GroupTable rows={rows} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default GroupCard;