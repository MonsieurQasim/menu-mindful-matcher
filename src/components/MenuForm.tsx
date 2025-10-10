import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Menu {
  id: string;
  name: string;
}

interface MenuFormProps {
  restaurantId: string;
  menu?: Menu;
  onSuccess: () => void;
  onCancel: () => void;
}

const MenuForm = ({ restaurantId, menu, onSuccess, onCancel }: MenuFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(menu?.name || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let error;
    if (menu) {
      ({ error } = await supabase
        .from("menus")
        .update({ name })
        .eq("id", menu.id));
    } else {
      ({ error } = await supabase
        .from("menus")
        .insert({
          restaurant_id: restaurantId,
          name: name,
        }));
    }

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Success",
      description: menu ? "Menu updated successfully" : "Menu created successfully",
    });

    setLoading(false);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Menu Name *</Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g., Lunch Menu, Dinner Specials"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? (menu ? "Updating..." : "Creating...") : (menu ? "Update Menu" : "Create Menu")}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default MenuForm;
