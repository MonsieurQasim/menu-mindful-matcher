import { useState } from "react";
import { MapPin, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RestaurantCard from "@/components/RestaurantCard";
import DietaryFilters from "@/components/DietaryFilters";

// Mock data for demonstration
const mockRestaurants = [
  {
    id: "1",
    name: "Skiffer Turku",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
    openTime: "Open",
    closeTime: "Closes 20:00",
    dietary: ["Vegetarian", "Halal", "Vegan"],
    distance: "300m",
  },
  {
    id: "2",
    name: "Restaurant Gustavo",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
    openTime: "Open",
    closeTime: "Closes 21:00",
    dietary: ["Vegetarian", "Vegan", "Halal"],
    distance: "450m",
  },
  {
    id: "3",
    name: "Skiffer Turku",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop",
    openTime: "Open",
    closeTime: "Closes 19:00",
    dietary: ["Vegetarian", "Halal", "Vegan"],
    distance: "1.2km",
  },
];

const Discover = () => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>(["Halal", "Vegan", "Vegetarian"]);
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">Diety</h1>
          <Button variant="ghost" size="icon" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Dietary Filters */}
      {showFilters && (
        <div className="bg-card border-b border-border p-4">
          <DietaryFilters selected={selectedFilters} onChange={setSelectedFilters} />
        </div>
      )}

      {/* Quick Filter Badges */}
      <div className="bg-card/50 backdrop-blur-sm sticky top-14 z-10 p-4 flex gap-2 overflow-x-auto">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap flex items-center">
          Filters:
        </span>
        {selectedFilters.map((filter) => (
          <Badge key={filter} variant="secondary" className="whitespace-nowrap">
            {filter}
          </Badge>
        ))}
      </div>

      {/* Restaurant List */}
      <div className="container mx-auto px-4 py-4 space-y-4">
        {mockRestaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} {...restaurant} />
        ))}
      </div>

      {/* Map Preview */}
      <div className="fixed bottom-0 left-0 right-0 h-64 bg-muted rounded-t-3xl overflow-hidden shadow-lg">
        <div className="w-full h-full relative">
          <img
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=400&fit=crop"
            alt="Map"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-card/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="font-medium">Map view coming soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discover;
