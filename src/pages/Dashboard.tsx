import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, LogOut, Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RestaurantForm from "@/components/RestaurantForm";
import MenuForm from "@/components/MenuForm";
import MenuList from "@/components/MenuList";
import MenuDetail from "@/components/MenuDetail";

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchRestaurants();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
  };

  const fetchRestaurants = async () => {
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .eq("owner_id", user.id);

    if (data && !error) {
      setRestaurants(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/auth");
  };

  const handleRestaurantAdded = () => {
    setShowRestaurantForm(false);
    fetchRestaurants();
    toast({
      title: "Success",
      description: "Restaurant added successfully!",
    });
  };

  const handleMenuAdded = () => {
    setShowMenuForm(false);
    toast({
      title: "Success",
      description: "Menu created successfully!",
    });
  };

  const handleSelectMenu = (menuId: string, menuName: string) => {
    setSelectedMenu({ id: menuId, name: menuName });
  };

  const handleBackToMenus = () => {
    setSelectedMenu(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">Diety Dashboard</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button onClick={() => setShowRestaurantForm(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Restaurant
          </Button>
        </div>

        {showRestaurantForm && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Add New Restaurant</h2>
            <RestaurantForm
              onSuccess={handleRestaurantAdded}
              onCancel={() => setShowRestaurantForm(false)}
            />
          </Card>
        )}

        <div className="grid gap-4">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Store className="h-5 w-5 text-primary" />
                    {restaurant.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{restaurant.address}, {restaurant.city}</p>
                  {restaurant.description && (
                    <p className="text-sm mt-2">{restaurant.description}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedRestaurant(restaurant.id);
                    setShowMenuForm(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Menu
                </Button>
              </div>

              {showMenuForm && selectedRestaurant === restaurant.id ? (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-3">Create Menu</h4>
                  <MenuForm
                    restaurantId={restaurant.id}
                    onSuccess={handleMenuAdded}
                    onCancel={() => {
                      setShowMenuForm(false);
                      setSelectedRestaurant(null);
                    }}
                  />
                </div>
              ) : selectedMenu && selectedRestaurant === restaurant.id ? (
                <div className="mt-4">
                  <MenuDetail
                    menuId={selectedMenu.id}
                    menuName={selectedMenu.name}
                    restaurantId={restaurant.id}
                    onBack={handleBackToMenus}
                  />
                </div>
              ) : (
                <div className="mt-4">
                  <h4 className="font-medium mb-3">Menus</h4>
                  <MenuList
                    restaurantId={restaurant.id}
                    onSelectMenu={(menuId, menuName) => {
                      setSelectedRestaurant(restaurant.id);
                      handleSelectMenu(menuId, menuName);
                    }}
                  />
                </div>
              )}
            </Card>
          ))}

          {restaurants.length === 0 && !showRestaurantForm && (
            <Card className="p-12 text-center">
              <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Restaurants Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first restaurant to start managing your menu
              </p>
              <Button onClick={() => setShowRestaurantForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Restaurant
              </Button>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
