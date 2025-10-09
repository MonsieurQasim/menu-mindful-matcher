import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Tag {
  id: string;
  name: string;
  category: string;
}

interface MenuItemFormProps {
  menuId: string;
  restaurantId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const MenuItemForm = ({ menuId, restaurantId, onSuccess, onCancel }: MenuItemFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificatePreview, setCertificatePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    const { data } = await supabase.from("tags").select("*").order("category, name");
    if (data) setTags(data);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCertificateFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCertificatePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl = null;
    let certificateUrl = null;

    // Check if halal tag is selected and certificate is required
    const halalTag = tags.find(t => t.name.toLowerCase() === 'halal' && selectedTags.includes(t.id));
    if (halalTag && !certificateFile) {
      toast({
        title: "Certificate Required",
        description: "Halal certificate is required when adding halal dishes",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Upload image if selected
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('menu-items')
        .upload(filePath, imageFile);

      if (uploadError) {
        toast({
          title: "Error",
          description: "Failed to upload image: " + uploadError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('menu-items')
        .getPublicUrl(filePath);

      imageUrl = publicUrl;
    }

    // Upload certificate if provided
    if (certificateFile) {
      const fileExt = certificateFile.name.split('.').pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(filePath, certificateFile);

      if (uploadError) {
        toast({
          title: "Error",
          description: "Failed to upload certificate: " + uploadError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('certificates')
        .getPublicUrl(filePath);

      certificateUrl = publicUrl;
    }

    const { data: menuItem, error: menuError } = await supabase
      .from("menu_items")
      .insert({
        menu_id: menuId,
        restaurant_id: restaurantId,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image_url: imageUrl,
        certificate_url: certificateUrl,
      })
      .select()
      .single();

    if (menuError || !menuItem) {
      toast({
        title: "Error",
        description: menuError?.message || "Failed to create menu item",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (selectedTags.length > 0) {
      const tagInserts = selectedTags.map((tagId) => ({
        menu_item_id: menuItem.id,
        tag_id: tagId,
      }));

      const { error: tagError } = await supabase
        .from("menu_item_tags")
        .insert(tagInserts);

      if (tagError) {
        toast({
          title: "Warning",
          description: "Menu item created but tags failed to save",
          variant: "destructive",
        });
      }
    }

    setLoading(false);
    onSuccess();
  };

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((id) => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const dietaryTags = tags.filter((t) => t.category === "dietary");
  const ingredientTags = tags.filter((t) => t.category === "ingredient");
  const isHalalSelected = selectedTags.some(tagId => {
    const tag = tags.find(t => t.id === tagId);
    return tag?.name.toLowerCase() === 'halal';
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Dish Name *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g., Salmon Soup"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={2}
          placeholder="Describe your dish..."
        />
      </div>

      <div>
        <Label htmlFor="price">Price (€)</Label>
        <Input
          id="price"
          name="price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
          placeholder="12.50"
        />
      </div>

      <div>
        <Label htmlFor="image">Dish Image</Label>
        <Input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="cursor-pointer"
        />
        {imagePreview && (
          <div className="mt-2">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg border"
            />
          </div>
        )}
      </div>

      {isHalalSelected && (
        <div>
          <Label htmlFor="certificate">Halal Certificate * (Required for Halal dishes)</Label>
          <Input
            id="certificate"
            name="certificate"
            type="file"
            accept="image/*,application/pdf"
            onChange={handleCertificateChange}
            className="cursor-pointer"
          />
          {certificatePreview && (
            <div className="mt-2">
              {certificateFile?.type.includes('pdf') ? (
                <p className="text-sm text-muted-foreground">PDF certificate selected</p>
              ) : (
                <img
                  src={certificatePreview}
                  alt="Certificate preview"
                  className="w-full h-48 object-contain rounded-lg border"
                />
              )}
            </div>
          )}
        </div>
      )}

      <div>
        <Label>Dietary Tags *</Label>
        <p className="text-xs text-muted-foreground mb-2">Select all that apply</p>
        <div className="flex flex-wrap gap-2">
          {dietaryTags.map((tag) => (
            <Badge
              key={tag.id}
              variant={selectedTags.includes(tag.id) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleTag(tag.id)}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label>Ingredient Tags *</Label>
        <p className="text-xs text-muted-foreground mb-2">Select all ingredients in this dish</p>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {ingredientTags.map((tag) => (
            <Badge
              key={tag.id}
              variant={selectedTags.includes(tag.id) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleTag(tag.id)}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={loading || selectedTags.length === 0}>
          {loading ? "Adding..." : "Add Menu Item"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default MenuItemForm;
