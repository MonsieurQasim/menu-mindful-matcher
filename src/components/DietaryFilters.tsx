import { Badge } from "@/components/ui/badge";

interface DietaryFiltersProps {
  selected: string[];
  onChange: (filters: string[]) => void;
}

const dietaryOptions = [
  { label: "Halal", color: "bg-success/10 text-success border-success/20 hover:bg-success/20" },
  { label: "Vegan", color: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20" },
  { label: "Vegetarian", color: "bg-dietary-vegetarian/10 text-dietary-vegetarian border-dietary-vegetarian/20 hover:bg-dietary-vegetarian/20" },
  { label: "Kosher", color: "bg-dietary-kosher/10 text-dietary-kosher border-dietary-kosher/20 hover:bg-dietary-kosher/20" },
  { label: "Gluten-Free", color: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20" },
  { label: "Dairy-Free", color: "bg-info/10 text-info border-info/20 hover:bg-info/20" },
];

const DietaryFilters = ({ selected, onChange }: DietaryFiltersProps) => {
  const toggleFilter = (filter: string) => {
    if (selected.includes(filter)) {
      onChange(selected.filter((f) => f !== filter));
    } else {
      onChange([...selected, filter]);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Dietary Preferences</h3>
      <div className="flex flex-wrap gap-2">
        {dietaryOptions.map(({ label, color }) => (
          <Badge
            key={label}
            variant={selected.includes(label) ? "default" : "outline"}
            className={`cursor-pointer transition-all ${selected.includes(label) ? color : "hover:bg-muted"}`}
            onClick={() => toggleFilter(label)}
          >
            {label}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default DietaryFilters;
