-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  price NUMERIC(10,2) NOT NULL,
  expiry_date DATE NOT NULL,
  warehouse TEXT NOT NULL DEFAULT 'Warehouse A',
  daily_sales_avg INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow anyone authenticated to read products
CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can manage products
CREATE POLICY "Authenticated users can insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with realistic Indian market products
INSERT INTO public.products (name, category, quantity, price, expiry_date, warehouse, daily_sales_avg) VALUES
  ('Amul Toned Milk 1L',        'Dairy',       120, 54.00,  CURRENT_DATE + 1,  'Warehouse A', 45),
  ('Epigamia Greek Yogurt 400g', 'Dairy',       80,  89.00,  CURRENT_DATE + 2,  'Warehouse A', 20),
  ('Harvest Gold Bread Loaf',   'Bakery',      200, 42.00,  CURRENT_DATE + 1,  'Warehouse B', 70),
  ('Theobroma Sourdough 400g',  'Bakery',       50, 165.00, CURRENT_DATE + 3,  'Warehouse B', 12),
  ('Fresh Palak (Spinach) 250g','Vegetables',   90,  30.00,  CURRENT_DATE + 2,  'Warehouse C', 30),
  ('Cherry Tomatoes 250g',      'Vegetables',  150, 60.00,  CURRENT_DATE + 4,  'Warehouse A', 40),
  ('Baby Carrots 300g',         'Vegetables',  110, 45.00,  CURRENT_DATE + 7,  'Warehouse C', 25),
  ('Strawberries 200g',         'Fruits',       60, 120.00, CURRENT_DATE + 1,  'Warehouse A', 25),
  ('Robusta Bananas 1 dozen',   'Fruits',      300, 49.00,  CURRENT_DATE + 3,  'Warehouse B', 80),
  ('Hass Avocado (3 pack)',     'Fruits',       45, 249.00, CURRENT_DATE + 2,  'Warehouse A', 15),
  ('Chicken Caesar Wrap',       'Ready-to-eat', 30, 189.00, CURRENT_DATE + 1,  'Warehouse B', 18),
  ('Veggie Sushi Box (8 pcs)',  'Ready-to-eat', 25, 299.00, CURRENT_DATE + 1,  'Warehouse A', 10),
  ('Pasta Salad 350g',          'Ready-to-eat', 40, 149.00, CURRENT_DATE + 3,  'Warehouse C', 12),
  ('Tropicana Orange Juice 1L', 'Beverages',   180, 120.00, CURRENT_DATE + 8,  'Warehouse A', 35),
  ('Epigamia Almond Milk 1L',  'Beverages',    95, 199.00, CURRENT_DATE + 10, 'Warehouse B', 18),
  ('Mixed Berry Smoothie 300ml','Beverages',    35, 129.00, CURRENT_DATE + 2,  'Warehouse C', 12),
  ('Wingreens Hummus 200g',    'Snacks',       70, 179.00, CURRENT_DATE + 5,  'Warehouse A', 15),
  ('Amul Cheddar Cheese 200g', 'Dairy',        85, 145.00, CURRENT_DATE + 6,  'Warehouse B', 20),
  ('Blueberries 125g',         'Fruits',       55, 199.00, CURRENT_DATE + 4,  'Warehouse C', 18),
  ('Egg Fried Rice 400g',      'Ready-to-eat', 65, 159.00, CURRENT_DATE + 2,  'Warehouse A', 22);