import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

interface Menu {
  id: string;
  name: string;
  created_at: string;
}

interface MenuListProps {
  restaurantId: string;
  onSelectMenu: (menuId: string, menuName: string) => void;
}

const MenuList = ({ restaurantId, onSelectMenu }: MenuListProps) => {
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
              <ChevronRight className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};

export default MenuList;
