-- UNICORN FURNITURE BD - Supabase Database Schema

-- 1. Categories Table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('furniture', 'wood')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Brands Table
CREATE TABLE brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Products Table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sku TEXT UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('furniture', 'wood')),
  sale_price NUMERIC(15, 2) DEFAULT 0,
  purchase_price NUMERIC(15, 2) DEFAULT 0,
  stock_quantity NUMERIC(15, 2) DEFAULT 0,
  min_stock_level NUMERIC(15, 2) DEFAULT 5,
  unit TEXT DEFAULT 'pcs',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  wood_type TEXT,
  size TEXT,
  color_polish TEXT,
  specification TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Customers Table
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  area_district TEXT,
  customer_type TEXT CHECK (customer_type IN ('retail', 'wholesale')),
  due_balance NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Invoices Table
CREATE TABLE invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  total_amount NUMERIC(15, 2) NOT NULL,
  paid_amount NUMERIC(15, 2) DEFAULT 0,
  due_amount NUMERIC(15, 2) DEFAULT 0,
  status TEXT CHECK (status IN ('paid', 'partial', 'unpaid')),
  payment_method TEXT,
  type TEXT CHECK (type IN ('furniture', 'wood')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Invoice Items Table
CREATE TABLE invoice_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity NUMERIC(15, 2) NOT NULL,
  unit_price NUMERIC(15, 2) NOT NULL,
  total_price NUMERIC(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Staff Table
CREATE TABLE staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  phone TEXT,
  email TEXT,
  salary NUMERIC(15, 2) DEFAULT 0,
  join_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Transactions Table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT,
  amount NUMERIC(15, 2) NOT NULL,
  payment_method TEXT,
  description TEXT,
  reference_id UUID, -- Can be invoice_id or other
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. SMS Campaigns Table
CREATE TABLE sms_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  message TEXT NOT NULL,
  recipients_type TEXT,
  recipient_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'delivered',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. SMS Templates Table
CREATE TABLE sms_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Settings Table
CREATE TABLE settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
-- For this internal app, we'll allow all authenticated users to perform CRUD operations.
-- In a real production app with multiple users, you'd restrict this further.

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create Policies (Allow all for authenticated users)
CREATE POLICY "Allow all for authenticated users" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON brands FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON invoice_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON staff FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON sms_campaigns FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON sms_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert some initial data
INSERT INTO settings (key, value) VALUES 
('shop_info', '{"name": "UNICORN FURNITURE BD", "address": "Dhaka, Bangladesh", "phone": "+880123456789", "currency": "BDT"}');

INSERT INTO categories (name, type) VALUES 
('Sofa Sets', 'furniture'),
('Dining Tables', 'furniture'),
('Beds', 'furniture'),
('Almirah', 'furniture'),
('Teak Wood', 'wood'),
('Mahogany Wood', 'wood'),
('Garjan Wood', 'wood');

INSERT INTO brands (name) VALUES 
('Unicorn Original'),
('Local Premium'),
('Imported');
