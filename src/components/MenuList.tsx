import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Menu {
  id: string;
  name: string;
  created_at: string;
}

interface MenuListProps {
  restaurantId: string;
  onSelectMenu: (menuId: string, menuName: string) => void;
  onEditMenu: (menu: Menu) => void;
}

const MenuList = ({ restaurantId, onSelectMenu, onEditMenu }: MenuListProps) => {
  const { toast } = useToast();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenus();
  }, [restaurantId]);

  const fetchMenus = async () => {
    const { data } = await supabase
      .from("menus")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false });

    if (data) {
      setMenus(data);
    }
    setLoading(false);
  };

  const handleDeleteMenu = async (menuId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this menu? This will also delete all dishes in it.")) {
      return;
    }

    const { error } = await supabase
      .from("menus")
      .delete()
      .eq("id", menuId);

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
      description: "Menu deleted successfully",
    });
    fetchMenus();
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading menus...</p>;
  }

  if (menus.length === 0) {
    return <p className="text-muted-foreground">No menus yet. Create your first menu to start adding dishes.</p>;
  }

  return (
    <div className="space-y-2">
      {menus.map((menu) => (
        <Card key={menu.id} className="cursor-pointer hover:bg-accent transition-colors" onClick={() => onSelectMenu(menu.id, menu.name)}>
          <CardHeader className="py-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>{menu.name}</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditMenu(menu);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => handleDeleteMenu(menu.id, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <ChevronRight className="h-4 w-4" />
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};

export default MenuList;
