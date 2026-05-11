import React, { useState } from 'react';
import { useAccount } from '../contexts/AccountContext';
import { useAccountStatus } from '../hooks/useAccountStatus';
import { motion } from 'motion/react';
import { Store, Plus, CreditCard, ExternalLink, Package, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const { accountId, setAccountId } = useAccount();
  const { accountStatus, loading, needsOnboarding } = useAccountStatus();
  
  const [email, setEmail] = useState('');
  const [creatingAccount, setCreatingAccount] = useState(false);

  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productImage, setProductImage] = useState('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [lastProduct, setLastProduct] = useState<any>(null);

  const fetchProducts = async () => {
    if (!accountId) return;
    setFetchingProducts(true);
    try {
      const res = await fetch(`/api/products/${accountId}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingProducts(false);
    }
  };

  React.useEffect(() => {
    if (accountId) {
      fetchProducts();
    }
  }, [accountId]);

  const createAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAccount(true);
    try {
      const res = await fetch('/api/create-connect-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const { accountId } = await res.json();
      setAccountId(accountId);
      
      const linkRes = await fetch('/api/create-account-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });
      const { url } = await linkRes.json();
      window.location.href = url;
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingAccount(false);
    }
  };

  const getOnboardingLink = async () => {
    if (!accountId) return;
    setCreatingAccount(true);
    try {
      const res = await fetch('/api/create-account-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingAccount(false);
    }
  };

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) return;
    setCreatingProduct(true);
    try {
      const endpoint = editingProductId ? '/api/update-product' : '/api/create-product';
      const body = {
        productName,
        productDescription: productDesc,
        productPrice,
        productCategory,
        productImage,
        accountId,
        productId: editingProductId
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setLastProduct(editingProductId ? { productName } : data);
      
      if (!editingProductId) {
        setProductName('');
        setProductDesc('');
        setProductPrice('');
        setProductCategory('');
        setProductImage('');
      } else {
        setEditingProductId(null);
        setProductName('');
        setProductDesc('');
        setProductPrice('');
        setProductCategory('');
        setProductImage('');
      }
      fetchProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingProduct(false);
    }
  };

  const startEdit = (product: any) => {
    setEditingProductId(product.id);
    setProductName(product.name);
    setProductDesc(product.description || '');
    setProductPrice((product.price / 100).toString());
    setProductCategory(product.category || '');
    setProductImage(product.image || '');
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setProductName('');
    setProductDesc('');
    setProductPrice('');
    setProductCategory('');
    setProductImage('');
  };

  return (
    <div className="flex flex-col h-screen bg-[#F9F8F4] text-[#1D1D1B] overflow-hidden">
      {/* Top Navigation Bar */}
      <nav className="flex justify-between items-center px-10 py-6 border-b border-[#1D1D1B]/10 bg-white z-10">
        <div className="text-2xl font-bold tracking-tighter uppercase font-sans">Platform.</div>
        <div className="flex space-x-8 text-xs uppercase tracking-editorial font-sans font-medium">
          <Link to="/" className="border-b border-[#1D1D1B] pb-1">Dashboard</Link>
          <a href="#" className="opacity-40 hover:opacity-100 transition-opacity">Inventory</a>
          <a href="#" className="opacity-40 hover:opacity-100 transition-opacity">Analytics</a>
          <Link to="/settings" className="opacity-40 hover:opacity-100 transition-opacity">Settings</Link>
        </div>
        <div className="flex items-center space-x-4">
          {accountId && (
            <button 
              onClick={() => setAccountId(null)}
              className="text-[10px] uppercase tracking-editorial font-bold opacity-40 hover:opacity-100 transition-opacity"
            >
              Sign Out
            </button>
          )}
          <div className="h-8 w-8 rounded-full bg-[#1D1D1B] flex items-center justify-center text-white text-xs font-sans">
            MC
          </div>
        </div>
      </nav>

      {!accountId ? (
        <div className="flex-1 flex items-center justify-center p-12 overflow-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-white p-10 border border-[#1D1D1B]/10"
          >
            <p className="text-[10px] uppercase tracking-editorial font-sans font-bold text-[#1D1D1B]/40 mb-2">New Vendor</p>
            <h2 className="text-3xl font-light italic mb-8">Join the Marketplace</h2>
            <form onSubmit={createAccount} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-editorial font-sans font-bold text-[#1D1D1B]/60 mb-2">Email address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F9F8F4] border border-[#1D1D1B]/10 font-sans text-sm focus:outline-none focus:border-[#1D1D1B] transition-colors"
                  placeholder="name@studio.com"
                />
              </div>
              <button 
                type="submit"
                disabled={creatingAccount}
                className="w-full py-4 bg-[#1D1D1B] text-white text-[10px] uppercase tracking-[0.3em] font-sans font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
              >
                {creatingAccount ? <Loader2 className="animate-spin w-4 h-4" /> : 'Create Account'}
              </button>
            </form>
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Panel */}
          <aside className="w-80 border-r border-[#1D1D1B]/10 p-10 flex flex-col bg-[#F3F2EE] overflow-y-auto">
            <div className="mb-12">
              <p className="text-[10px] uppercase tracking-editorial font-sans font-bold text-[#1D1D1B]/40 mb-2">Connected Account</p>
              <p className="text-sm font-sans font-semibold break-all">{accountId}</p>
              
              <div className="mt-8 p-6 bg-white border border-[#1D1D1B]/5 rounded-sm">
                <div className="flex items-center justify-between mb-3 font-sans">
                  <span className="text-[10px] uppercase tracking-editorial font-bold">Status</span>
                  {loading ? (
                    <Loader2 className="w-3 h-3 animate-spin opacity-40" />
                  ) : (
                    <span className={`h-2 w-2 rounded-full ${needsOnboarding ? 'bg-orange-500' : 'bg-emerald-500'}`}></span>
                  )}
                </div>
                <p className="text-xs italic leading-relaxed opacity-60">
                  {needsOnboarding 
                    ? 'Pending Stripe onboarding. Complete setup to enable payouts and product listing.' 
                    : 'Your account is verified. You are ready to process transactions.'}
                </p>
                {needsOnboarding && (
                  <button 
                    onClick={getOnboardingLink}
                    className="mt-6 w-full py-3 bg-[#1D1D1B] text-white text-[10px] uppercase tracking-editorial font-sans font-bold hover:bg-black transition-colors"
                  >
                    Complete Onboarding
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-6">
               <div>
                  <p className="text-[10px] uppercase tracking-editorial font-sans font-bold text-[#1D1D1B]/40 mb-4">Identity</p>
                  <Link 
                    to="/settings"
                    className="flex justify-between items-center py-3 border-b border-[#1D1D1B]/10 text-xs font-sans font-bold uppercase tracking-editorial group"
                  >
                    Manage Settings
                    <ArrowLeft className="w-3 h-3 rotate-180 opacity-40" />
                  </Link>
               </div>
               <div>
                  <p className="text-[10px] uppercase tracking-editorial font-sans font-bold text-[#1D1D1B]/40 mb-4">Storefront</p>
                  <Link 
                    to={`/storefront/${accountId}`}
                    className="flex justify-between items-center py-3 border-b border-[#1D1D1B]/10 text-xs font-sans font-bold uppercase tracking-editorial group"
                  >
                    View Public Page
                    <ExternalLink className="w-3 h-3 group-hover:translate-x-1 transition-transform opacity-40" />
                  </Link>
               </div>
            </div>

            <div className="mt-auto pt-10">
              <div className="p-8 bg-[#1D1D1B] text-white rounded-sm relative overflow-hidden">
                <p className="text-[10px] uppercase tracking-editorial mb-2 opacity-40 font-bold">Balance Overview</p>
                <p className="text-3xl font-light">$0.00</p>
                <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/5 rounded-full"></div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-16 overflow-y-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <h1 className="text-6xl font-light italic leading-none -ml-1">Merchant Storefront</h1>
                <p className="text-sm mt-4 font-sans uppercase tracking-[0.3em] opacity-40">Add to your collection</p>
              </div>
              <div className="p-4 bg-white border border-[#1D1D1B]/10 opacity-70 italic text-xs max-w-xs">
                "Design is the silent ambassador of your brand." — Paul Rand
              </div>
            </div>

            <div className="max-w-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-sans uppercase tracking-[0.3em] font-bold opacity-40">
                  {editingProductId ? 'Edit Entry' : 'New Archive Entry'}
                </h3>
                {editingProductId && (
                  <button 
                    onClick={cancelEdit}
                    className="text-[10px] uppercase tracking-editorial font-bold text-red-500 hover:underline"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={editingProductId ? 'edit' : 'create'}
                className="bg-white p-10 border border-[#1D1D1B]/10 shadow-sm"
              >
                <form onSubmit={createProduct} className="space-y-8">
                  <div>
                    <label className="block text-[10px] uppercase tracking-editorial font-sans font-bold text-[#1D1D1B]/60 mb-3">Product Nomenclature</label>
                    <input 
                      type="text" 
                      required
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="w-full px-0 py-2 border-b border-[#1D1D1B]/10 bg-transparent font-serif text-2xl focus:outline-none focus:border-[#1D1D1B] transition-colors"
                      placeholder="e.g. Signature Ceramic Vase"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] uppercase tracking-editorial font-sans font-bold text-[#1D1D1B]/60 mb-3">Category</label>
                      <input 
                        type="text" 
                        value={productCategory}
                        onChange={(e) => setProductCategory(e.target.value)}
                        className="w-full px-0 py-2 border-b border-[#1D1D1B]/10 bg-transparent font-sans text-sm focus:outline-none focus:border-[#1D1D1B] transition-colors"
                        placeholder="e.g. Ceramics"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-editorial font-sans font-bold text-[#1D1D1B]/60 mb-3">Valuation (USD)</label>
                      <div className="relative">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xl font-light opacity-40">$</span>
                        <input 
                          type="number" 
                          step="0.01"
                          required
                          disabled={!!editingProductId} // Prices are complex to update in Stripe, let's keep them immutable for now or explain they need a new product for price change
                          value={productPrice}
                          onChange={(e) => setProductPrice(e.target.value)}
                          className={`w-full pl-6 py-2 border-b border-[#1D1D1B]/10 bg-transparent font-sans text-xl focus:outline-none focus:border-[#1D1D1B] ${editingProductId ? 'opacity-30 cursor-not-allowed' : ''}`}
                          placeholder="0.00"
                        />
                      </div>
                      {editingProductId && (
                        <p className="text-[9px] opacity-40 mt-1 italic italic">Price value is immutable after record creation.</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-editorial font-sans font-bold text-[#1D1D1B]/60 mb-3">Image Resource (URL)</label>
                    <input 
                      type="url" 
                      value={productImage}
                      onChange={(e) => setProductImage(e.target.value)}
                      className="w-full px-0 py-2 border-b border-[#1D1D1B]/10 bg-transparent font-sans text-sm focus:outline-none focus:border-[#1D1D1B] transition-colors"
                      placeholder="https://images.unsplash.com/..."
                    />
                    <p className="text-[10px] opacity-40 mt-1 italic italic">Provide a direct link to an image asset (JPG, PNG).</p>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-editorial font-sans font-bold text-[#1D1D1B]/60 mb-3">Brief Description</label>
                    <textarea 
                      value={productDesc}
                      onChange={(e) => setProductDesc(e.target.value)}
                      className="w-full px-0 py-2 border-b border-[#1D1D1B]/10 bg-transparent font-sans text-sm italic focus:outline-none focus:border-[#1D1D1B] transition-colors resize-none"
                      placeholder="Hand-thrown stone, matte finish..."
                      rows={2}
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={creatingProduct || needsOnboarding}
                    className="w-full py-4 border border-[#1D1D1B] text-[10px] uppercase tracking-[0.3em] font-sans font-bold hover:bg-[#1D1D1B] hover:text-white transition-all disabled:opacity-30 flex items-center justify-center gap-3"
                  >
                    {creatingProduct ? <Loader2 className="animate-spin w-4 h-4" /> : editingProductId ? 'Update Archive' : '+ Post to Catalog'}
                  </button>
                  {needsOnboarding && (
                    <p className="text-[10px] text-orange-600 text-center uppercase tracking-widest font-bold">
                      Account verification required for listing
                    </p>
                  )}
                </form>

                {lastProduct && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    className="mt-8 p-4 bg-[#F3F2EE] border border-[#1D1D1B]/5 text-[10px] uppercase tracking-editorial font-bold flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 opacity-40" />
                    Archive Entry {editingProductId ? 'Updated' : 'Created'}: "{lastProduct.productName}"
                  </motion.div>
                )}
              </motion.div>

              {/* Product Inventory */}
              <div className="mt-24 space-y-12">
                <div>
                  <h3 className="text-sm font-sans uppercase tracking-[0.3em] font-bold opacity-40 mb-2">Live Inventory</h3>
                  <div className="h-px w-full bg-[#1D1D1B]/10"></div>
                </div>

                {fetchingProducts ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin opacity-20" />
                  </div>
                ) : products.length === 0 ? (
                  <div className="p-20 text-center border border-dashed border-[#1D1D1B]/10">
                    <Package className="w-10 h-10 mx-auto opacity-10 mb-4" />
                    <p className="text-[10px] uppercase tracking-widest opacity-40">No listed items in curation</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {products.map((product) => (
                      <div key={product.id} className="bg-white p-6 border border-[#1D1D1B]/5 flex items-center justify-between group hover:border-[#1D1D1B]/20 transition-all">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-[#F3F2EE] overflow-hidden grayscale">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest mb-1">{product.name}</p>
                            <p className="text-[10px] opacity-40 font-serif italic">{product.category} — ${(product.price / 100).toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <button 
                            onClick={() => startEdit(product)}
                            className="text-[10px] uppercase tracking-editorial font-bold opacity-30 hover:opacity-100 transition-opacity"
                          >
                            Modify
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      ) }
    </div>
  );
}
