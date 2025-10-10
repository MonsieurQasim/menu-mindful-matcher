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

interface MenuItemFormProps {
  menuId: string;
  restaurantId: string;
  menuItem?: MenuItem;
  onSuccess: () => void;
  onCancel: () => void;
}

const MenuItemForm = ({ menuId, restaurantId, menuItem, onSuccess, onCancel }: MenuItemFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(menuItem?.image_url || null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [existingCertificate, setExistingCertificate] = useState<string | null>(menuItem?.certificate_url || null);
  const [formData, setFormData] = useState({
    name: menuItem?.name || "",
    description: menuItem?.description || "",
    price: menuItem?.price.toString() || "",
    dietary_halal: menuItem?.dietary_halal || false,
    dietary_vegetarian: menuItem?.dietary_vegetarian || false,
    dietary_vegan: menuItem?.dietary_vegan || false,
    dietary_gluten_free: menuItem?.dietary_gluten_free || false,
  });

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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.dietary_halal && !existingCertificate && !certificateFile) {
      toast({
        title: "Certificate Required",
        description: "Halal certificate is required for halal dishes",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    let imageUrl = menuItem?.image_url || null;
    if (imageFile) {
      setUploadingImage(true);
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `${restaurantId}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('menu-items')
        .upload(filePath, imageFile);

      setUploadingImage(false);

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
        .getPublicUrl(uploadData.path);

      imageUrl = publicUrl;
    }

    let certificateUrl = existingCertificate;
    if (certificateFile) {
      setUploadingCertificate(true);
      const certificateExt = certificateFile.name.split('.').pop();
      const certificatePath = `${restaurantId}/${Date.now()}_certificate.${certificateExt}`;
      
      const { error: certUploadError, data: certData } = await supabase.storage
        .from('certificates')
        .upload(certificatePath, certificateFile);

      setUploadingCertificate(false);

      if (certUploadError) {
        toast({
          title: "Error",
          description: "Failed to upload certificate: " + certUploadError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data: { publicUrl: certPublicUrl } } = supabase.storage
        .from('certificates')
        .getPublicUrl(certData.path);
      
      certificateUrl = certPublicUrl;
    }

    let error;
    if (menuItem) {
      ({ error } = await supabase
        .from("menu_items")
        .update({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          image_url: imageUrl,
          certificate_url: certificateUrl,
        })
        .eq("id", menuItem.id));
    } else {
      ({ error } = await supabase.from("menu_items").insert({
        menu_id: menuId,
        restaurant_id: restaurantId,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image_url: imageUrl,
        certificate_url: certificateUrl,
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
      description: menuItem ? "Dish updated successfully" : "Dish added successfully",
    });

    setLoading(false);
    onSuccess();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (field: string) => {
    setFormData({ ...formData, [field]: !formData[field as keyof typeof formData] });
  };

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
        />
        {imagePreview && (
          <div className="mt-2">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      <div>
        <Label>Dietary Options</Label>
        <div className="space-y-2 mt-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="dietary_halal"
              checked={formData.dietary_halal}
              onChange={() => handleCheckboxChange('dietary_halal')}
              className="w-4 h-4"
            />
            <Label htmlFor="dietary_halal" className="cursor-pointer">Halal</Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="dietary_vegetarian"
              checked={formData.dietary_vegetarian}
              onChange={() => handleCheckboxChange('dietary_vegetarian')}
              className="w-4 h-4"
            />
            <Label htmlFor="dietary_vegetarian" className="cursor-pointer">Vegetarian</Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="dietary_vegan"
              checked={formData.dietary_vegan}
              onChange={() => handleCheckboxChange('dietary_vegan')}
              className="w-4 h-4"
            />
            <Label htmlFor="dietary_vegan" className="cursor-pointer">Vegan</Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="dietary_gluten_free"
              checked={formData.dietary_gluten_free}
              onChange={() => handleCheckboxChange('dietary_gluten_free')}
              className="w-4 h-4"
            />
            <Label htmlFor="dietary_gluten_free" className="cursor-pointer">Gluten Free</Label>
          </div>
        </div>
      </div>

      {formData.dietary_halal && (
        <div>
          <Label htmlFor="certificate">Halal Certificate {!existingCertificate && '*'}</Label>
          <Input
            id="certificate"
            name="certificate"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleCertificateChange}
            required={!existingCertificate}
          />
          {existingCertificate && (
            <p className="text-xs text-muted-foreground mt-1">
              Current certificate on file. Upload new file to replace.
            </p>
          )}
          {!existingCertificate && (
            <p className="text-xs text-muted-foreground mt-1">
              Upload halal certification (PDF or image)
            </p>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading || uploadingImage || uploadingCertificate}>
          {loading 
            ? (menuItem ? "Updating..." : "Adding...") 
            : uploadingImage 
              ? "Uploading Image..." 
              : uploadingCertificate 
                ? "Uploading Certificate..." 
                : (menuItem ? "Update Dish" : "Add Dish")}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default MenuItemForm;
