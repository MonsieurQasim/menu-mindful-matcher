import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Utensils, MapPin, Star, ChevronRight } from "lucide-react";
import logo from "@/assets/logo.png";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        navigate("/discover");
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        navigate("/discover");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-12 pb-20">
        <div className="text-center space-y-8">
          <img src={logo} alt="Diety" className="h-24 mx-auto" />
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            Find Your Perfect Meal
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover restaurants and dishes that match your dietary preferences. Halal, Vegan,
            Vegetarian, Kosher, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-lg px-8" onClick={() => navigate("/auth")}>
              Get Started
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" onClick={() => navigate("/auth")}>
              I'm a Restaurant Owner
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-card p-6 rounded-xl shadow-md border border-border hover:shadow-lg transition-all">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Utensils className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
            <p className="text-muted-foreground">
              User-friendly interface to find exactly what you're craving with simple filters.
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-md border border-border hover:shadow-lg transition-all">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Filter by Preferences</h3>
            <p className="text-muted-foreground">
              Restaurants and menus filtered based on your specific dietary needs.
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-md border border-border hover:shadow-lg transition-all">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Trust Reviews</h3>
            <p className="text-muted-foreground">
              Increasing trust by valuable review system from real diners.
            </p>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-card/50 backdrop-blur-sm py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
            <div className="bg-muted rounded-2xl p-8 space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Set Your Preferences</h4>
                  <p className="text-sm text-muted-foreground">
                    Choose your dietary requirements - Halal, Vegan, Vegetarian, or any combination.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Discover Nearby Restaurants</h4>
                  <p className="text-sm text-muted-foreground">
                    See restaurants around you that match your dietary needs on an interactive map.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Browse Menus & Reviews</h4>
                  <p className="text-sm text-muted-foreground">
                    View dishes tagged with dietary information and read reviews from other diners.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
