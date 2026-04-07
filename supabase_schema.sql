-- Supabase Schema for UNICORN FURNITURE BD
-- Inventory Management + POS + Invoicing System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles / Users
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff')),
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('furniture', 'wood')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Brands
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Vendors / Suppliers
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku TEXT UNIQUE,
    name TEXT NOT NULL,
    category_id UUID REFERENCES categories(id),
    brand_id UUID REFERENCES brands(id),
    type TEXT NOT NULL CHECK (type IN ('furniture', 'wood')),
    
    -- Furniture specific
    model TEXT,
    wood_type TEXT,
    size TEXT,
    color_polish TEXT,
    
    -- Wood specific
    specification TEXT,
    
    unit TEXT DEFAULT 'pcs', -- pcs, cft, sqft, etc
    purchase_price DECIMAL(12,2) DEFAULT 0,
    sale_price DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    stock_quantity DECIMAL(12,2) DEFAULT 0,
    min_stock_level DECIMAL(12,2) DEFAULT 5,
    image_url TEXT,
    production_status TEXT DEFAULT 'ready' CHECK (production_status IN ('ready', 'in_production', 'ordered')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Customers
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id_custom TEXT UNIQUE, -- e.g. CUST-001
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    whatsapp TEXT,
    imo TEXT,
    email TEXT,
    address TEXT,
    delivery_address TEXT,
    area_district TEXT,
    customer_type TEXT DEFAULT 'retail' CHECK (customer_type IN ('retail', 'wholesale', 'corporate')),
    due_balance DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Staff
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id_custom TEXT UNIQUE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    role TEXT NOT NULL,
    salary DECIMAL(12,2) DEFAULT 0,
    address TEXT,
    join_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_no TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    date DATE DEFAULT CURRENT_DATE,
    delivery_date DATE,
    subtotal DECIMAL(12,2) DEFAULT 0,
    discount_total DECIMAL(12,2) DEFAULT 0,
    transport_charge DECIMAL(12,2) DEFAULT 0,
    vat_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    advance_paid DECIMAL(12,2) DEFAULT 0,
    due_amount DECIMAL(12,2) DEFAULT 0,
    payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid', 'partial')),
    payment_method TEXT DEFAULT 'cash',
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Invoice Items
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity DECIMAL(12,2) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    discount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL
);

-- 10. Estimates / Quotations
CREATE TABLE IF NOT EXISTS estimates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estimate_no TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    date DATE DEFAULT CURRENT_DATE,
    valid_until DATE,
    total_amount DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL, -- e.g. 'Sales', 'Purchase', 'Salary', 'Rent', 'Utility'
    amount DECIMAL(12,2) NOT NULL,
    payment_method TEXT DEFAULT 'cash',
    reference_id UUID, -- Can be invoice_id, bill_id, etc.
    description TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Expenses
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    paid_to TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Reminders
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    type TEXT NOT NULL CHECK (type IN ('due_payment', 'delivery', 'order_ready')),
    message TEXT NOT NULL,
    scheduled_date TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Settings
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) - Simplified for this build
-- In production, you would add specific policies.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
