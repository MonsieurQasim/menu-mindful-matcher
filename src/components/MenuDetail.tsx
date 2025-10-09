import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";
import MenuItemForm from "./MenuItemForm";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  certificate_url: string | null;
}

interface MenuDetailProps {
  menuId: string;
  menuName: string;
  restaurantId: string;
  onBack: () => void;
}

const MenuDetail = ({ menuId, menuName, restaurantId, onBack }: MenuDetailProps) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchMenuItems();
  }, [menuId]);

  const fetchMenuItems = async () => {
    const { data } = await supabase
      .from("menu_items")
      .select("*")
      .eq("menu_id", menuId)
      .order("created_at", { ascending: false });

    if (data) {
      setItems(data);
    }
    setLoading(false);
  };

  const handleItemAdded = () => {
    setShowAddForm(false);
    fetchMenuItems();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menus
        </Button>
        <h3 className="text-lg font-semibold">{menuName}</h3>
      </div>

      {showAddForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Add New Dish</CardTitle>
          </CardHeader>
          <CardContent>
            <MenuItemForm
              menuId={menuId}
              restaurantId={restaurantId}
              onSuccess={handleItemAdded}
              onCancel={() => setShowAddForm(false)}
            />
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Dish
        </Button>
      )}

      <div className="space-y-3">
        {loading ? (
          <p className="text-muted-foreground">Loading dishes...</p>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">No dishes in this menu yet.</p>
        ) : (
          items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                    <p className="text-sm font-medium mt-1">€{item.price.toFixed(2)}</p>
                    {item.certificate_url && (
                      <a
                        href={item.certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline mt-1 inline-block"
                      >
                        View Halal Certificate
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MenuDetail;
