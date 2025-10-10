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
  postal_code: string;
  phone: string | null;
  email: string | null;
  website: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState<{ id: string; name: string } | null>(null);
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
    setEditingRestaurant(null);
    fetchRestaurants();
  };

  const handleDeleteRestaurant = async (restaurantId: string) => {
    if (!confirm("Are you sure you want to delete this restaurant? This will also delete all menus and dishes.")) {
      return;
    }

    const { error } = await supabase
      .from("restaurants")
      .delete()
      .eq("id", restaurantId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Restaurant deleted successfully",
    });
    fetchRestaurants();
  };

  const handleMenuAdded = () => {
    setShowMenuForm(false);
    setEditingMenu(null);
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
          <Button onClick={() => {
            setShowRestaurantForm(true);
            setEditingRestaurant(null);
          }} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Restaurant
          </Button>
        </div>

        {showRestaurantForm && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingRestaurant ? "Edit Restaurant" : "Add New Restaurant"}
            </h2>
            <RestaurantForm
              restaurant={editingRestaurant || undefined}
              onSuccess={handleRestaurantAdded}
              onCancel={() => {
                setShowRestaurantForm(false);
                setEditingRestaurant(null);
              }}
            />
          </Card>
        )}

        <div className="grid gap-4">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Store className="h-5 w-5 text-primary" />
                    {restaurant.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{restaurant.address}, {restaurant.city}</p>
                  {restaurant.description && (
                    <p className="text-sm mt-2">{restaurant.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingRestaurant(restaurant);
                      setShowRestaurantForm(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteRestaurant(restaurant.id)}
                  >
                    Delete
                  </Button>
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
              </div>

              {showMenuForm && selectedRestaurant === restaurant.id ? (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-3">{editingMenu ? "Edit Menu" : "Create Menu"}</h4>
                  <MenuForm
                    restaurantId={restaurant.id}
                    menu={editingMenu || undefined}
                    onSuccess={handleMenuAdded}
                    onCancel={() => {
                      setShowMenuForm(false);
                      setEditingMenu(null);
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
                    onEditMenu={(menu) => {
                      setSelectedRestaurant(restaurant.id);
                      setEditingMenu(menu);
                      setShowMenuForm(true);
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
