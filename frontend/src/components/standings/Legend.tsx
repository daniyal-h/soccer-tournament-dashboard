import { LEGEND } from '@/constants/standings';

const Legend = () => {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
      {LEGEND.map((item) => (
        <span
          key={item.abbr}
          className={item.mobileHidden ? 'hidden sm:inline-flex' : 'inline-flex'}
        >
          <span className="font-medium text-foreground">
            {item.abbr}
          </span>

          <span className="mx-1">=</span>

          <span>{item.full}</span>
        </span>
      ))}
    </div>
  );
};

export default Legend;
