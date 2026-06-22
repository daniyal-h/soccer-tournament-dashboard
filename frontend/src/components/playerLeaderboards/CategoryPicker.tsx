import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import type { CategoryType } from '@/types/playerLeaderboard';

import { CATEGORY_CONTENT, LEADERBOARD_CATEGORIES } from '@/constants/playerLeaderboards';

type CategoryPickerProps = {
  category: CategoryType;
  setCategory: (category: CategoryType) => void;
};

function CategoryPicker({ category, setCategory }: CategoryPickerProps) {
  return (
    <Tabs value={category} onValueChange={(value) => setCategory(value as CategoryType)}>
      <TabsList variant="line" className="grid w-full sm:gap-4 grid-cols-3 sm:w-fit">
        {LEADERBOARD_CATEGORIES.map((category) => (
          <TabsTrigger className="cursor-pointer" value={category} key={category}>
            {CATEGORY_CONTENT[category].title}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

export default CategoryPicker;
