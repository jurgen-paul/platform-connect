import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingCart, ArrowLeft, Loader2, PackageX, ExternalLink } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  priceId: string;
  image: string;
}

export default function Storefront() {
  const { accountId } = useParams<{ accountId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  useEffect(() => {
    if (!accountId) return;
    
    fetch(`/api/products/${accountId}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [accountId]);

  const handleCheckout = async (priceId: string) => {
    setCheckingOut(priceId);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, accountId }),
      });
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error(err);
      setCheckingOut(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F8F4]">
        <div className="text-center space-y-6">
          <Loader2 className="w-12 h-12 text-[#1D1D1B] animate-spin mx-auto opacity-20" />
          <p className="text-[#1D1D1B]/40 text-[10px] uppercase tracking-[0.3em] font-bold font-sans">Accessing Archive</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#1D1D1B] pb-24">
      {/* Header */}
      <header className="bg-white border-b border-[#1D1D1B]/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-10 py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[10px] uppercase tracking-editorial font-bold opacity-40 hover:opacity-100 transition-opacity group">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Dashboard
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-light italic">Merchant Collection</h1>
            <p className="text-[10px] font-sans uppercase tracking-[0.2em] opacity-40 mt-1">ID: {accountId?.slice(0, 12)}...</p>
          </div>
          <div className="w-24 flex justify-end">
             <ShoppingCart className="w-4 h-4 opacity-40" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-10 pt-20">
        {products.length === 0 ? (
          <div className="bg-white p-20 border border-dashed border-[#1D1D1B]/10 text-center space-y-8 max-w-2xl mx-auto">
            <PackageX className="w-12 h-12 text-[#1D1D1B] mx-auto opacity-10" />
            <div className="space-y-2">
              <h2 className="text-3xl font-light italic">Store is empty</h2>
              <p className="text-[#1D1D1B]/40 font-sans uppercase tracking-editorial text-[10px] font-bold">No items currently cataloged</p>
            </div>
            <Link to="/" className="inline-block border border-[#1D1D1B] px-10 py-4 text-[10px] uppercase tracking-editorial font-bold hover:bg-[#1D1D1B] hover:text-white transition-all">
              Return to Dashboard
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {products.map((product, idx) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-pointer flex flex-col"
              >
                <div className="aspect-[4/5] bg-neutral-100 mb-6 overflow-hidden relative border border-[#1D1D1B]/5">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-4 left-4 bg-white px-2 py-1 text-[10px] uppercase tracking-tighter font-sans font-bold shadow-sm">
                    In Stock
                  </div>
                </div>
                <div className="flex flex-col flex-grow">
                  <h3 className="text-xl font-medium mb-1">{product.name}</h3>
                  <p className="text-xs font-sans opacity-40 mb-4 italic line-clamp-2">
                    {product.description || 'Quality handcrafted piece from our curated archive.'}
                  </p>
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#1D1D1B]/5">
                    <p className="text-lg font-sans font-light tracking-tight">
                      ${(product.price / 100).toFixed(2)}
                    </p>
                    <button 
                      onClick={() => handleCheckout(product.priceId)}
                      disabled={checkingOut !== null}
                      className="px-6 py-2 border border-[#1D1D1B] text-[10px] uppercase tracking-editorial font-bold hover:bg-[#1D1D1B] hover:text-white transition-all disabled:opacity-30"
                    >
                      {checkingOut === product.priceId ? (
                        <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                      ) : 'Aquire'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Footer Status Bar (Editorial Touch) */}
      <footer className="max-w-7xl mx-auto px-10 mt-24 flex justify-between items-center py-8 border-t border-[#1D1D1B]/10">
        <div className="flex items-center space-x-4 text-[10px] uppercase tracking-editorial font-sans font-bold">
          <span className="opacity-20">Viewing Collection:</span>
          <span className="underline decoration-1 underline-offset-4 opacity-40">/storefront/{accountId?.slice(0, 8)}</span>
        </div>
        <div className="text-[10px] font-sans italic opacity-20">
          Last updated: Today, UTC
        </div>
      </footer>
    </div>
  );
}
