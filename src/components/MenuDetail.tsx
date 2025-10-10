import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import MenuItemForm from "./MenuItemForm";
import { useToast } from "@/hooks/use-toast";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  certificate_url: string | null;
  dietary_halal: boolean;
  dietary_vegetarian: boolean;
  dietary_vegan: boolean;
  dietary_gluten_free: boolean;
}

interface MenuDetailProps {
  menuId: string;
  menuName: string;
  restaurantId: string;
  onBack: () => void;
}

const MenuDetail = ({ menuId, menuName, restaurantId, onBack }: MenuDetailProps) => {
  const { toast } = useToast();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    fetchMenuItems();
  }, [menuId]);

  const fetchMenuItems = async () => {
    const { data } = await supabase
      .from("menu_items")
      .select("id, name, description, price, image_url, certificate_url")
      .eq("menu_id", menuId)
      .order("created_at", { ascending: false });

    if (data) {
      setItems(data.map(item => ({
        ...item,
        dietary_halal: false,
        dietary_vegetarian: false,
        dietary_vegan: false,
        dietary_gluten_free: false,
      })));
    }
    setLoading(false);
  };

  const handleItemAdded = () => {
    setShowAddForm(false);
    setEditingItem(null);
    fetchMenuItems();
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this dish?")) {
      return;
    }

    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", itemId);

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
      description: "Dish deleted successfully",
    });
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

      {showAddForm || editingItem ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingItem ? "Edit Dish" : "Add New Dish"}</CardTitle>
          </CardHeader>
          <CardContent>
            <MenuItemForm
              menuId={menuId}
              restaurantId={restaurantId}
              menuItem={editingItem || undefined}
              onSuccess={handleItemAdded}
              onCancel={() => {
                setShowAddForm(false);
                setEditingItem(null);
              }}
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
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingItem(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
