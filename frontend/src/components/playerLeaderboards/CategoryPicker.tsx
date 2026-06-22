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
      <TabsList variant="line">
        {LEADERBOARD_CATEGORIES.map((category) => (
          <TabsTrigger value={category} key={category}>
            {CATEGORY_CONTENT[category].title}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

export default CategoryPicker;
