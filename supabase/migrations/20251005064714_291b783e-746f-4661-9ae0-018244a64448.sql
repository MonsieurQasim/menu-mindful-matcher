-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create restaurants table
CREATE TABLE public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'Finland',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT,
  email TEXT,
  website TEXT,
  image_url TEXT,
  cover_image_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tags table with hierarchical structure
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL, -- 'dietary', 'ingredient', 'allergen', etc.
  parent_tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create menu_items table
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  image_url TEXT,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create menu_item_tags junction table
CREATE TABLE public.menu_item_tags (
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (menu_item_id, tag_id)
);

-- Create user_dietary_preferences table
CREATE TABLE public.user_dietary_preferences (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, tag_id)
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_dietary_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for restaurants
CREATE POLICY "Anyone can view restaurants" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Owners can create restaurants" ON public.restaurants FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own restaurants" ON public.restaurants FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete own restaurants" ON public.restaurants FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for tags
CREATE POLICY "Anyone can view tags" ON public.tags FOR SELECT USING (true);

-- RLS Policies for menu_items
CREATE POLICY "Anyone can view menu items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Restaurant owners can create menu items" ON public.menu_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.restaurants WHERE id = restaurant_id AND owner_id = auth.uid())
);
CREATE POLICY "Restaurant owners can update own menu items" ON public.menu_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.restaurants WHERE id = restaurant_id AND owner_id = auth.uid())
);
CREATE POLICY "Restaurant owners can delete own menu items" ON public.menu_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.restaurants WHERE id = restaurant_id AND owner_id = auth.uid())
);

-- RLS Policies for menu_item_tags
CREATE POLICY "Anyone can view menu item tags" ON public.menu_item_tags FOR SELECT USING (true);
CREATE POLICY "Restaurant owners can manage menu item tags" ON public.menu_item_tags FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.menu_items mi 
    JOIN public.restaurants r ON mi.restaurant_id = r.id 
    WHERE mi.id = menu_item_id AND r.owner_id = auth.uid()
  )
);

-- RLS Policies for user_dietary_preferences
CREATE POLICY "Users can view own preferences" ON public.user_dietary_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own preferences" ON public.user_dietary_preferences FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert comprehensive dietary and ingredient tags
INSERT INTO public.tags (name, category, parent_tag_id, description) VALUES
-- Religious Dietary Tags
('Halal', 'dietary', NULL, 'Permissible according to Islamic law'),
('Kosher', 'dietary', NULL, 'Permissible according to Jewish dietary law'),
('Hindu Vegetarian', 'dietary', NULL, 'Follows Hindu dietary guidelines'),
('Jain', 'dietary', NULL, 'Excludes root vegetables and certain ingredients'),

-- Plant-Based Dietary Tags
('Vegan', 'dietary', NULL, 'No animal products'),
('Vegetarian', 'dietary', NULL, 'No meat or fish'),
('Pescatarian', 'dietary', NULL, 'No meat except fish'),
('Flexitarian', 'dietary', NULL, 'Primarily plant-based with occasional meat'),

-- Allergen & Health Tags
('Gluten-Free', 'dietary', NULL, 'No gluten-containing ingredients'),
('Dairy-Free', 'dietary', NULL, 'No dairy products'),
('Nut-Free', 'dietary', NULL, 'No nuts'),
('Soy-Free', 'dietary', NULL, 'No soy products'),
('Egg-Free', 'dietary', NULL, 'No eggs'),
('Lactose-Free', 'dietary', NULL, 'No lactose'),
('Low-Carb', 'dietary', NULL, 'Reduced carbohydrate content'),
('Keto', 'dietary', NULL, 'Ketogenic diet friendly'),
('Paleo', 'dietary', NULL, 'Paleolithic diet friendly'),
('Raw', 'dietary', NULL, 'Uncooked and unprocessed'),
('Organic', 'dietary', NULL, 'Organically produced ingredients');

-- Get parent IDs for hierarchical tags
DO $$
DECLARE
  meat_id UUID;
  poultry_id UUID;
  fish_id UUID;
  seafood_id UUID;
  dairy_id UUID;
  vegetables_id UUID;
  grains_id UUID;
  legumes_id UUID;
BEGIN
  -- Insert main ingredient categories
  INSERT INTO public.tags (name, category, description) VALUES
  ('Meat', 'ingredient', 'Animal meat products') RETURNING id INTO meat_id;
  
  INSERT INTO public.tags (name, category, description) VALUES
  ('Poultry', 'ingredient', 'Poultry products') RETURNING id INTO poultry_id;
  
  INSERT INTO public.tags (name, category, description) VALUES
  ('Fish', 'ingredient', 'Fish products') RETURNING id INTO fish_id;
  
  INSERT INTO public.tags (name, category, description) VALUES
  ('Seafood', 'ingredient', 'Seafood products') RETURNING id INTO seafood_id;
  
  INSERT INTO public.tags (name, category, description) VALUES
  ('Dairy', 'ingredient', 'Dairy products') RETURNING id INTO dairy_id;
  
  INSERT INTO public.tags (name, category, description) VALUES
  ('Vegetables', 'ingredient', 'Vegetable products') RETURNING id INTO vegetables_id;
  
  INSERT INTO public.tags (name, category, description) VALUES
  ('Grains', 'ingredient', 'Grain products') RETURNING id INTO grains_id;
  
  INSERT INTO public.tags (name, category, description) VALUES
  ('Legumes', 'ingredient', 'Legume products') RETURNING id INTO legumes_id;

  -- Meat subcategories
  INSERT INTO public.tags (name, category, parent_tag_id) VALUES
  ('Beef', 'ingredient', meat_id),
  ('Lamb', 'ingredient', meat_id),
  ('Goat', 'ingredient', meat_id),
  ('Pork', 'ingredient', meat_id),
  ('Veal', 'ingredient', meat_id),
  ('Venison', 'ingredient', meat_id),
  ('Bison', 'ingredient', meat_id);

  -- Poultry subcategories
  INSERT INTO public.tags (name, category, parent_tag_id) VALUES
  ('Chicken', 'ingredient', poultry_id),
  ('Turkey', 'ingredient', poultry_id),
  ('Duck', 'ingredient', poultry_id),
  ('Goose', 'ingredient', poultry_id),
  ('Quail', 'ingredient', poultry_id);

  -- Fish subcategories
  INSERT INTO public.tags (name, category, parent_tag_id) VALUES
  ('Salmon', 'ingredient', fish_id),
  ('Tuna', 'ingredient', fish_id),
  ('Cod', 'ingredient', fish_id),
  ('Haddock', 'ingredient', fish_id),
  ('Trout', 'ingredient', fish_id),
  ('Mackerel', 'ingredient', fish_id),
  ('Tilapia', 'ingredient', fish_id),
  ('Bass', 'ingredient', fish_id),
  ('Sardine', 'ingredient', fish_id);

  -- Seafood subcategories
  INSERT INTO public.tags (name, category, parent_tag_id) VALUES
  ('Shrimp', 'ingredient', seafood_id),
  ('Crab', 'ingredient', seafood_id),
  ('Lobster', 'ingredient', seafood_id),
  ('Prawns', 'ingredient', seafood_id),
  ('Oyster', 'ingredient', seafood_id),
  ('Mussel', 'ingredient', seafood_id),
  ('Clam', 'ingredient', seafood_id),
  ('Scallop', 'ingredient', seafood_id),
  ('Squid', 'ingredient', seafood_id),
  ('Octopus', 'ingredient', seafood_id);

  -- Dairy subcategories
  INSERT INTO public.tags (name, category, parent_tag_id) VALUES
  ('Milk', 'ingredient', dairy_id),
  ('Cheese', 'ingredient', dairy_id),
  ('Butter', 'ingredient', dairy_id),
  ('Yogurt', 'ingredient', dairy_id),
  ('Cream', 'ingredient', dairy_id);

  -- Vegetables subcategories
  INSERT INTO public.tags (name, category, parent_tag_id) VALUES
  ('Tomato', 'ingredient', vegetables_id),
  ('Potato', 'ingredient', vegetables_id),
  ('Onion', 'ingredient', vegetables_id),
  ('Carrot', 'ingredient', vegetables_id),
  ('Broccoli', 'ingredient', vegetables_id),
  ('Spinach', 'ingredient', vegetables_id),
  ('Mushroom', 'ingredient', vegetables_id),
  ('Pepper', 'ingredient', vegetables_id),
  ('Lettuce', 'ingredient', vegetables_id),
  ('Cucumber', 'ingredient', vegetables_id);

  -- Grains subcategories
  INSERT INTO public.tags (name, category, parent_tag_id) VALUES
  ('Rice', 'ingredient', grains_id),
  ('Wheat', 'ingredient', grains_id),
  ('Oats', 'ingredient', grains_id),
  ('Quinoa', 'ingredient', grains_id),
  ('Barley', 'ingredient', grains_id),
  ('Corn', 'ingredient', grains_id);

  -- Legumes subcategories
  INSERT INTO public.tags (name, category, parent_tag_id) VALUES
  ('Chickpeas', 'ingredient', legumes_id),
  ('Lentils', 'ingredient', legumes_id),
  ('Black Beans', 'ingredient', legumes_id),
  ('Kidney Beans', 'ingredient', legumes_id),
  ('Peas', 'ingredient', legumes_id),
  ('Soybeans', 'ingredient', legumes_id);
END $$;