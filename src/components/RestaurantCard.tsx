import { MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RestaurantCardProps {
  name: string;
  image: string;
  openTime: string;
  closeTime: string;
  dietary: string[];
  distance: string;
}

const getDietaryColor = (type: string) => {
  const colors: Record<string, string> = {
    Halal: "bg-success/10 text-success border-success/20",
    Vegan: "bg-primary/10 text-primary border-primary/20",
    Vegetarian: "bg-dietary-vegetarian/10 text-dietary-vegetarian border-dietary-vegetarian/20",
    Kosher: "bg-dietary-kosher/10 text-dietary-kosher border-dietary-kosher/20",
    "Gluten-Free": "bg-warning/10 text-warning border-warning/20",
  };
  return colors[type] || "bg-muted text-muted-foreground";
};

const RestaurantCard = ({ name, image, openTime, closeTime, dietary, distance }: RestaurantCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
      <div className="flex gap-3 p-3">
        <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>
        <CardContent className="flex-1 p-0 space-y-2">
          <div>
            <h3 className="font-semibold text-lg leading-tight">{name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Clock className="h-3 w-3" />
              <span>{openTime} | {closeTime}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {dietary.map((type, index) => (
              <Badge
                key={index}
                variant="outline"
                className={`text-xs ${getDietaryColor(type)}`}
              >
                {type}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="text-primary h-8 px-3">
              View Specials
            </Button>
            <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{distance}</span>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default RestaurantCard;
