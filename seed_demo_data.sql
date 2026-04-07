-- UNICORN FURNITURE BD - Demo Data Seed Script

-- 1. Insert Demo Customers
INSERT INTO customers (name, phone, whatsapp, email, address, area_district, customer_type, due_balance) VALUES 
('Rahim Ahmed', '01711223344', '01711223344', 'rahim@example.com', 'Dhanmondi, Dhaka', 'Dhaka', 'retail', 5000),
('Karim Ullah', '01811223344', '01811223344', 'karim@example.com', 'Uttara, Dhaka', 'Dhaka', 'retail', 0),
('Sultana Begum', '01911223344', '01911223344', 'sultana@example.com', 'Gulshan, Dhaka', 'Dhaka', 'retail', 12000),
('Tanvir Hossain', '01611223344', '01611223344', 'tanvir@example.com', 'Mirpur, Dhaka', 'Dhaka', 'retail', 0),
('Karim Wood Works', '01822334455', '01822334455', 'karim@woodworks.com', 'Plot 45, BSCIC Industrial Area, Gazipur', 'Gazipur', 'wholesale', 25000);

-- 2. Insert Demo Products
-- Note: Replace UUIDs if needed, or use subqueries
INSERT INTO products (sku, name, type, sale_price, purchase_price, stock_quantity, min_stock_level, unit, category_id, brand_id) VALUES 
('FUR-001', 'Luxury Sofa Set (3+2+1)', 'furniture', 85000, 65000, 5, 2, 'set', (SELECT id FROM categories WHERE name = 'Sofa Sets' LIMIT 1), (SELECT id FROM brands WHERE name = 'Unicorn Original' LIMIT 1)),
('FUR-002', 'Teak Wood Dining Table (6 Chairs)', 'furniture', 120000, 95000, 3, 1, 'set', (SELECT id FROM categories WHERE name = 'Dining Tables' LIMIT 1), (SELECT id FROM brands WHERE name = 'Unicorn Original' LIMIT 1)),
('FUR-003', 'King Size Bed - Mahogany', 'furniture', 45000, 35000, 8, 3, 'pcs', (SELECT id FROM categories WHERE name = 'Beds' LIMIT 1), (SELECT id FROM brands WHERE name = 'Local Premium' LIMIT 1)),
('WOOD-001', 'Burma Teak Log', 'wood', 4500, 3800, 150, 50, 'cft', (SELECT id FROM categories WHERE name = 'Teak Wood' LIMIT 1), (SELECT id FROM brands WHERE name = 'Imported' LIMIT 1)),
('WOOD-002', 'Mahogany Plank', 'wood', 2200, 1800, 300, 100, 'cft', (SELECT id FROM categories WHERE name = 'Mahogany Wood' LIMIT 1), (SELECT id FROM brands WHERE name = 'Local Premium' LIMIT 1));

-- 3. Insert Demo Staff
INSERT INTO staff (name, role, phone, email, salary, status) VALUES 
('Abdur Rahman', 'Sales Manager', '01511223344', 'rahman@unicorn.com', 35000, 'active'),
('Fatema Khatun', 'Accountant', '01411223344', 'fatema@unicorn.com', 28000, 'active'),
('Jasim Uddin', 'Delivery Head', '01311223344', 'jasim@unicorn.com', 22000, 'active');

-- 4. Insert Demo Invoices
INSERT INTO invoices (customer_id, invoice_number, total_amount, paid_amount, due_amount, status, payment_method, type) VALUES 
((SELECT id FROM customers WHERE name = 'Rahim Ahmed' LIMIT 1), 'INV-1001', 85000, 80000, 5000, 'partial', 'cash', 'furniture'),
((SELECT id FROM customers WHERE name = 'Karim Ullah' LIMIT 1), 'INV-1002', 4500, 4500, 0, 'paid', 'bkash', 'wood');

-- 5. Insert Demo Invoice Items
INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price, total_price) VALUES 
((SELECT id FROM invoices WHERE invoice_number = 'INV-1001' LIMIT 1), (SELECT id FROM products WHERE sku = 'FUR-001' LIMIT 1), 1, 85000, 85000),
((SELECT id FROM invoices WHERE invoice_number = 'INV-1002' LIMIT 1), (SELECT id FROM products WHERE sku = 'WOOD-001' LIMIT 1), 1, 4500, 4500);

-- 6. Insert Demo Transactions
INSERT INTO transactions (type, category, amount, payment_method, description, reference_id) VALUES 
('income', 'Sales', 80000, 'cash', 'Payment for Invoice INV-1001', (SELECT id FROM invoices WHERE invoice_number = 'INV-1001' LIMIT 1)),
('income', 'Sales', 4500, 'bkash', 'Payment for Invoice INV-1002', (SELECT id FROM invoices WHERE invoice_number = 'INV-1002' LIMIT 1)),
('expense', 'Salary', 35000, 'bank', 'Salary for Abdur Rahman - March 2024', NULL),
('expense', 'Rent', 50000, 'bank', 'Showroom Rent - March 2024', NULL),
('expense', 'Utility', 8500, 'cash', 'Electricity Bill - March 2024', NULL);

-- 7. Insert Demo SMS Templates
INSERT INTO sms_templates (title, content) VALUES 
('Payment Reminder', 'Dear {name}, your payment of {amount} for Invoice {inv} is due. Please pay by {date}.'),
('Order Confirmation', 'Hi {name}, your order {inv} has been confirmed. Thank you for choosing Unicorn Furniture!'),
('Delivery Alert', 'Good news {name}! Your furniture is out for delivery. Our team will reach you soon.');
