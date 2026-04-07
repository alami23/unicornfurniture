'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Plus, 
  Minus, 
  Trash2, 
  ChevronRight,
  Package,
  CheckCircle2,
  Printer,
  X,
  CreditCard,
  Banknote
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import Modal from '@/components/ui/Modal';

interface Product {
  id: string;
  name: string;
  sku: string;
  sale_price: number;
  stock_quantity: number;
  image_url?: string;
  category: { name: string } | null;
}

interface CartItem extends Product {
  quantity: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
}

export default function POSFurniturePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Checkout states
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bkash' | 'bank'>('cash');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastInvoiceId, setLastInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    setLoading(true);
    const [prodRes, custRes] = await Promise.all([
      supabase.from('products').select('*, category:categories(name)').eq('type', 'furniture').order('name'),
      supabase.from('customers').select('id, name, phone').order('name')
    ]);
    
    const mappedProducts = (prodRes.data as any[])?.map(p => ({
      ...p,
      category: Array.isArray(p.category) ? p.category[0] : p.category
    }));

    setProducts(mappedProducts || []);
    setCustomers(custRes.data || []);
    setLoading(false);
  }

  const addToCart = (product: Product) => {
    if (product.stock_quantity <= 0) {
      toast.error('Product out of stock');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          toast.error('Cannot add more than available stock');
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        if (delta > 0 && newQty > item.stock_quantity) {
          toast.error('Cannot exceed available stock');
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.sale_price * item.quantity), 0);
  const tax = subtotal * 0.05; // 5% VAT
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return;
    }
    setAmountPaid(total);
    setIsCheckoutModalOpen(true);
  };

  const processOrder = async () => {
    setIsProcessing(true);
    try {
      // 1. Create Invoice
      const { data: invoice, error: invError } = await supabase
        .from('invoices')
        .insert([{
          customer_id: selectedCustomer?.id,
          invoice_number: `INV-${Date.now()}`,
          total_amount: total,
          paid_amount: amountPaid,
          due_amount: total - amountPaid,
          status: amountPaid >= total ? 'paid' : (amountPaid > 0 ? 'partial' : 'unpaid'),
          payment_method: paymentMethod,
          type: 'furniture'
        }])
        .select()
        .single();

      if (invError) throw invError;

      // 2. Create Invoice Items & Update Stock
      const invoiceItems = cart.map(item => ({
        invoice_id: invoice.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.sale_price,
        total_price: item.sale_price * item.quantity
      }));

      const { error: itemsError } = await supabase.from('invoice_items').insert(invoiceItems);
      if (itemsError) throw itemsError;

      // Update Stock (Looping for simplicity, in production use a RPC or transaction)
      for (const item of cart) {
        await supabase
          .from('products')
          .update({ stock_quantity: item.stock_quantity - item.quantity })
          .eq('id', item.id);
      }

      // 3. Update Customer Due Balance
      if (total - amountPaid > 0) {
        const { data: cust } = await supabase.from('customers').select('due_balance').eq('id', selectedCustomer?.id).single();
        await supabase
          .from('customers')
          .update({ due_balance: (cust?.due_balance || 0) + (total - amountPaid) })
          .eq('id', selectedCustomer?.id);
      }

      // 4. Create Transaction
      if (amountPaid > 0) {
        await supabase.from('transactions').insert([{
          type: 'income',
          category: 'Sales',
          amount: amountPaid,
          payment_method: paymentMethod,
          reference_id: invoice.id,
          description: `Payment for Invoice ${invoice.invoice_number}`
        }]);
      }

      setLastInvoiceId(invoice.id);
      setOrderSuccess(true);
      setCart([]);
      setSelectedCustomer(null);
      toast.success('Order processed successfully!');
    } catch (error: any) {
      toast.error('Checkout failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-6 overflow-hidden">
      {/* Left: Product Selection */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button className="px-4 py-1.5 bg-white text-blue-600 rounded-lg text-xs font-bold shadow-sm">All Furniture</button>
            <button className="px-4 py-1.5 text-slate-500 hover:text-slate-700 text-xs font-bold">Beds</button>
            <button className="px-4 py-1.5 text-slate-500 hover:text-slate-700 text-xs font-bold">Sofas</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
              ))
            ) : filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock_quantity <= 0}
                className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left flex flex-col group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="aspect-square bg-slate-50 rounded-xl mb-3 flex items-center justify-center text-slate-300 relative overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <Package className="w-10 h-10" />
                  )}
                  {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                    <span className="absolute top-2 right-2 px-2 py-1 bg-amber-500 text-white text-[8px] font-bold rounded-md uppercase tracking-wider">Low Stock</span>
                  )}
                  {product.stock_quantity <= 0 && (
                    <span className="absolute inset-0 bg-slate-900/40 flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-wider">Out of Stock</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">{product.category?.name || 'Furniture'}</p>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">{product.name}</h4>
                  <p className="text-xs font-bold text-slate-400">{product.sku}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900">{formatCurrency(product.sale_price)}</p>
                  <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Cart & Checkout */}
      <div className="w-full lg:w-[400px] flex flex-col gap-6">
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Current Order</h3>
                <p className="text-xs font-medium text-slate-500">{cart.length} items selected</p>
              </div>
            </div>
            <button onClick={() => setCart([])} className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 border-b border-slate-100">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Customer</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                value={selectedCustomer?.id || ''}
                onChange={(e) => {
                  const cust = customers.find(c => c.id === e.target.value);
                  setSelectedCustomer(cust || null);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
              >
                <option value="">Select Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <ShoppingCart className="w-12 h-12 mb-3" />
                <p className="text-sm font-medium">Your cart is empty</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex-shrink-0 flex items-center justify-center text-slate-400">
                    {item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-xl" /> : <Package className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-bold text-slate-900 truncate">{item.name}</h5>
                    <p className="text-xs font-bold text-blue-600">{formatCurrency(item.sale_price)}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all"><Minus className="w-3 h-3" /></button>
                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all"><Plus className="w-3 h-3" /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><X className="w-4 h-4" /></button>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-3">
            <div className="flex justify-between text-sm font-medium text-slate-500">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-slate-500">
              <span>VAT (5%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0 || !selectedCustomer}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Checkout
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <Modal
        isOpen={isCheckoutModalOpen}
        onClose={() => !isProcessing && setIsCheckoutModalOpen(false)}
        title={orderSuccess ? "Order Successful" : "Complete Payment"}
        size="md"
        footer={orderSuccess ? (
          <div className="flex gap-3 w-full">
            <button onClick={() => { setIsCheckoutModalOpen(false); setOrderSuccess(false); }} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">Close</button>
            <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <Printer className="w-4 h-4" />
              Print Invoice
            </button>
          </div>
        ) : (
          <div className="flex gap-3 w-full">
            <button onClick={() => setIsCheckoutModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
            <button onClick={processOrder} disabled={isProcessing} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50">
              {isProcessing ? 'Processing...' : 'Confirm Order'}
            </button>
          </div>
        )}
      >
        {orderSuccess ? (
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Payment Received!</h3>
            <p className="text-slate-500 mt-2">The order has been processed and stock has been updated.</p>
            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 w-full">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">Invoice Number</span>
                <span className="font-bold text-slate-900">INV-{Date.now().toString().slice(-6)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Amount</span>
                <span className="font-bold text-blue-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex justify-between items-center">
              <span className="text-blue-700 font-bold">Total Amount Due</span>
              <span className="text-xl font-bold text-blue-700">{formatCurrency(total)}</span>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'cash', label: 'Cash', icon: Banknote },
                  { id: 'card', label: 'Card', icon: CreditCard },
                  { id: 'bkash', label: 'bKash', icon: MessageSquare },
                  { id: 'bank', label: 'Bank', icon: ExternalLink },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                      paymentMethod === method.id 
                        ? "border-blue-600 bg-blue-50 text-blue-700" 
                        : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200"
                    )}
                  >
                    <method.icon className="w-5 h-5" />
                    <span className="font-bold text-sm">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount Paid (BDT)</label>
              <input 
                type="number" 
                value={amountPaid}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <div className="flex gap-2">
                <button onClick={() => setAmountPaid(total)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-bold text-slate-600 uppercase transition-colors">Exact Amount</button>
                <button onClick={() => setAmountPaid(0)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-bold text-slate-600 uppercase transition-colors">Unpaid</button>
              </div>
            </div>

            {amountPaid < total && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p className="text-xs text-amber-700 font-medium">
                  Remaining <span className="font-bold">{formatCurrency(total - amountPaid)}</span> will be added to customer's due balance.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
