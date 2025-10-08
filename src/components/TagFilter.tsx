import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Tag {
  id: string;
  name: string;
  category: string;
  parent_tag_id: string | null;
  description: string | null;
}

interface TagFilterProps {
  selected: string[];
  onChange: (tagIds: string[]) => void;
}

const TagFilter = ({ selected, onChange }: TagFilterProps) => {
  const [dietaryTags, setDietaryTags] = useState<Tag[]>([]);
  const [ingredientTags, setIngredientTags] = useState<Tag[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .order("name");

    if (data && !error) {
      const dietary = data.filter((tag) => tag.category === "dietary");
      const ingredients = data.filter((tag) => tag.category === "ingredient");
      setDietaryTags(dietary);
      setIngredientTags(ingredients);
    }
  };

  const toggleTag = (tagId: string) => {
    if (selected.includes(tagId)) {
      onChange(selected.filter((id) => id !== tagId));
    } else {
      onChange([...selected, tagId]);
    }
  };

  const toggleCategory = (categoryName: string) => {
    if (expandedCategories.includes(categoryName)) {
      setExpandedCategories(expandedCategories.filter((c) => c !== categoryName));
    } else {
      setExpandedCategories([...expandedCategories, categoryName]);
    }
  };

  const getChildTags = (parentId: string) => {
    return ingredientTags.filter((tag) => tag.parent_tag_id === parentId);
  };

  const renderTag = (tag: Tag, isChild = false) => {
    const children = getChildTags(tag.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedCategories.includes(tag.id);
    const otherTagId = `${tag.id}-other`;

    return (
      <div key={tag.id} className={isChild ? "ml-4" : ""}>
        <div className="flex items-center gap-2 mb-2">
          {hasChildren && (
            <button
              onClick={() => toggleCategory(tag.id)}
              className="p-1 hover:bg-muted rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          <Badge
            variant={selected.includes(tag.id) ? "default" : "outline"}
            className="cursor-pointer transition-all hover:scale-105"
            onClick={() => toggleTag(tag.id)}
          >
            {tag.name}
          </Badge>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {children.map((child) => renderTag(child, true))}
            <div className="ml-4 flex items-center gap-2 mb-2">
              <Badge
                variant={selected.includes(otherTagId) ? "default" : "outline"}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => toggleTag(otherTagId)}
              >
                Other
              </Badge>
            </div>
          </div>
        )}
      </div>
    );
  };

  const parentIngredients = ingredientTags.filter((tag) => !tag.parent_tag_id);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-3 text-foreground">Dietary Preferences</h3>
        <div className="flex flex-wrap gap-2">
          {dietaryTags.map((tag) => (
            <Badge
              key={tag.id}
              variant={selected.includes(tag.id) ? "default" : "outline"}
              className="cursor-pointer transition-all hover:scale-105"
              onClick={() => toggleTag(tag.id)}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3 text-foreground">Ingredients</h3>
        <div className="space-y-2">
          {parentIngredients.map((tag) => renderTag(tag))}
        </div>
      </div>
    </div>
  );
};

export default TagFilter;
