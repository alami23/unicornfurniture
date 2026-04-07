import { supabase } from './supabase';

export const demoCategories = [
  { name: 'Sofa Sets', type: 'furniture' },
  { name: 'Dining Tables', type: 'furniture' },
  { name: 'Bed Frames', type: 'furniture' },
  { name: 'Wardrobes', type: 'furniture' },
  { name: 'Teak Wood Logs', type: 'wood' },
  { name: 'Mahogany Planks', type: 'wood' },
];

export const demoBrands = [
  { name: 'Unicorn Premium' },
  { name: 'Local Artisan' },
  { name: 'Imported Teak' },
];

export const demoCustomers = [
  {
    name: 'Rahim Ahmed',
    phone: '01711223344',
    whatsapp: '01711223344',
    email: 'rahim@example.com',
    address: 'House 12, Road 5, Dhanmondi, Dhaka',
    area_district: 'Dhaka',
    customer_type: 'retail',
    due_balance: 5000,
  },
  {
    name: 'Karim Wood Works',
    phone: '01822334455',
    whatsapp: '01822334455',
    email: 'karim@woodworks.com',
    address: 'Plot 45, BSCIC Industrial Area, Gazipur',
    area_district: 'Gazipur',
    customer_type: 'wholesale',
    due_balance: 25000,
  },
];

export const demoStaff = [
  {
    name: 'Abul Kashem',
    role: 'Manager',
    phone: '01911223344',
    salary: 35000,
    join_date: '2023-01-15',
    status: 'active',
  },
  {
    name: 'Sujon Mia',
    role: 'Carpenter',
    phone: '01611223344',
    salary: 22000,
    join_date: '2023-03-10',
    status: 'active',
  },
];

export const seedDemoData = async () => {
  try {
    // 1. Seed Categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .insert(demoCategories)
      .select();
    if (catError) throw catError;

    // 2. Seed Brands
    const { data: brands, error: brandError } = await supabase
      .from('brands')
      .insert(demoBrands)
      .select();
    if (brandError) throw brandError;

    // 3. Seed Customers
    const { error: custError } = await supabase
      .from('customers')
      .insert(demoCustomers);
    if (custError) throw custError;

    // 4. Seed Staff
    const { error: staffError } = await supabase
      .from('staff')
      .insert(demoStaff);
    if (staffError) throw staffError;

    // 5. Seed Products (using first category and brand)
    const furnitureCat = categories?.find(c => c.type === 'furniture');
    const woodCat = categories?.find(c => c.type === 'wood');
    const mainBrand = brands?.[0];

    const demoProducts = [
      {
        name: 'Luxury 3-Seater Sofa',
        sku: 'SOFA-001',
        category_id: furnitureCat?.id,
        brand_id: mainBrand?.id,
        type: 'furniture',
        sale_price: 45000,
        purchase_price: 32000,
        stock_quantity: 5,
        unit: 'pcs',
        wood_type: 'Teak',
        size: '7ft x 3ft',
        color_polish: 'Natural Oak',
      },
      {
        name: 'Burma Teak Log',
        sku: 'WOOD-001',
        category_id: woodCat?.id,
        brand_id: mainBrand?.id,
        type: 'wood',
        sale_price: 3500,
        purchase_price: 2800,
        stock_quantity: 150,
        unit: 'cft',
        specification: 'Grade A, 12ft length',
      },
    ];

    const { error: prodError } = await supabase
      .from('products')
      .insert(demoProducts);
    if (prodError) throw prodError;

    // 6. Seed some transactions
    const demoTransactions = [
      {
        date: new Date().toISOString().split('T')[0],
        description: 'Initial Shop Setup Expense',
        category: 'Maintenance',
        payment_method: 'Cash',
        amount: 15000,
        type: 'expense',
      },
      {
        date: new Date().toISOString().split('T')[0],
        description: 'Opening Balance Deposit',
        category: 'Investment',
        payment_method: 'Bank',
        amount: 500000,
        type: 'income',
      },
    ];

    const { error: transError } = await supabase
      .from('transactions')
      .insert(demoTransactions);
    if (transError) throw transError;

    return { success: true };
  } catch (error: any) {
    console.error('Seeding error:', error);
    return { success: false, error: error.message };
  }
};
