import { useState, useEffect } from "react";
import { MapPin, Filter, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RestaurantCard from "@/components/RestaurantCard";
import TagFilter from "@/components/TagFilter";
import { supabase } from "@/integrations/supabase/client";

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  image_url: string | null;
  verified: boolean;
  menu_items: Array<{
    id: string;
    name: string;
    menu_item_tags: Array<{ tag_id: string }>;
  }>;
}

const Discover = () => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, [selectedFilters]);

  const fetchRestaurants = async () => {
    setLoading(true);
    
    let query = supabase
      .from("restaurants")
      .select(`
        *,
        menu_items (
          id,
          name,
          menu_item_tags (tag_id)
        )
      `);

    const { data, error } = await query;

    if (data && !error) {
      let filtered = data;

      if (selectedFilters.length > 0) {
        filtered = data.filter((restaurant) => {
          const restaurantTagIds = new Set(
            restaurant.menu_items.flatMap((item: any) =>
              item.menu_item_tags.map((mt: any) => mt.tag_id)
            )
          );
          return selectedFilters.every((filterId) => restaurantTagIds.has(filterId));
        });
      }

      setRestaurants(filtered as Restaurant[]);
    }
    setLoading(false);
  };

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

      {/* Tag Filters */}
      {showFilters && (
        <div className="bg-card border-b border-border p-4">
          <TagFilter selected={selectedFilters} onChange={setSelectedFilters} />
        </div>
      )}

      {/* Results */}
      <div className="container mx-auto px-4 py-4">
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-4">
            <TabsTrigger value="list">
              <List className="h-4 w-4 mr-2" />
              List View
            </TabsTrigger>
            <TabsTrigger value="map">
              <MapPin className="h-4 w-4 mr-2" />
              Map View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4 pb-64">
            {loading ? (
              <p className="text-center text-muted-foreground">Loading restaurants...</p>
            ) : restaurants.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No restaurants match your filters</p>
              </Card>
            ) : (
              restaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  name={restaurant.name}
                  image={restaurant.image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop"}
                  openTime="Open"
                  closeTime="Closes 20:00"
                  dietary={[]}
                  distance="N/A"
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="map" className="pb-64">
            <div className="h-[500px] bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-primary" />
                <p className="font-medium">Google Maps Integration</p>
                <p className="text-sm text-muted-foreground">Coming soon</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
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
