import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, ArrowLeft, Loader2, PackageX, ExternalLink, Instagram, Twitter, Globe, Mail, Search, Eye } from 'lucide-react';
import Fuse from 'fuse.js';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  priceId: string;
  image: string;
}

interface AccountMeta {
  displayName?: string;
  bio?: string;
  supportEmail?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
}

export default function Storefront() {
  const { accountId } = useParams<{ accountId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<AccountMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!accountId) return;
    
    // Fetch account metadata first
    fetch(`/api/account-status/${accountId}`)
      .then(res => res.json())
      .then(data => setMeta(data.metadata))
      .catch(err => console.error(err));

    fetch(`/api/products/${accountId}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [accountId]);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const fuse = useMemo(() => {
    return new Fuse(products, {
      keys: ['name', 'description', 'category'],
      threshold: 0.3,
      distance: 100,
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products;

    // First filter by category
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Then apply fuzzy search if query exists
    if (searchQuery.trim()) {
      const searchResult = fuse.search(searchQuery);
      result = searchResult.map(res => res.item);
    }

    return result;
  }, [products, selectedCategory, searchQuery, fuse]);

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return fuse.search(searchQuery).slice(0, 5).map(res => res.item);
  }, [searchQuery, fuse]);

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
          <div className="flex-1">
            <Link to="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-editorial font-bold opacity-40 hover:opacity-100 transition-opacity group">
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              Dashboard
            </Link>
          </div>
          <div className="text-center px-4 min-w-[200px]">
            <h1 className="text-xl font-light italic">{meta?.displayName || 'Merchant Collection'}</h1>
            <p className="text-[10px] font-sans uppercase tracking-[0.2em] opacity-40 mt-1">
              {meta?.bio ? meta.bio : `ID: ${accountId?.slice(0, 12)}...`}
            </p>
          </div>
          <div className="flex-1 flex justify-end items-center gap-2">
             {meta?.website && (
               <a href={meta.website} target="_blank" rel="noreferrer" className="p-2 opacity-40 hover:opacity-100 transition-opacity" title="Website">
                <Globe className="w-4 h-4" />
               </a>
             )}
             {meta?.supportEmail && (
               <a href={`mailto:${meta.supportEmail}`} className="p-2 opacity-40 hover:opacity-100 transition-opacity" title="Email Support">
                <Mail className="w-4 h-4" />
               </a>
             )}
             {meta?.instagram && (
               <a href={`https://instagram.com/${meta.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="p-2 opacity-40 hover:opacity-100 transition-opacity" title={`Follow ${meta.instagram}`}>
                <Instagram className="w-4 h-4" />
               </a>
             )}
             {meta?.twitter && (
               <div className="flex items-center">
                 <a href={`https://twitter.com/${meta.twitter.replace('@', '')}`} target="_blank" rel="noreferrer" className="p-2 opacity-40 hover:opacity-100 transition-opacity" title={`Follow ${meta.twitter}`}>
                  <Twitter className="w-4 h-4" />
                 </a>
                 <a 
                   href={`https://twitter.com/intent/tweet?text=Exploring the curated collection at ${meta.displayName}&url=${encodeURIComponent(window.location.href)}&via=${meta.twitter.replace('@', '')}`} 
                   target="_blank" 
                   rel="noreferrer" 
                   className="p-2 opacity-40 hover:opacity-100 transition-opacity" 
                   title="Share on Twitter"
                 >
                  <ExternalLink className="w-3 h-3" />
                 </a>
               </div>
             )}
             <div className="p-2 box-content">
                <ShoppingCart className="w-4 h-4 opacity-40" />
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-10 pt-12">
        {products.length === 0 ? (
          <div className="bg-white p-20 border border-dashed border-[#1D1D1B]/10 text-center space-y-8 max-w-2xl mx-auto mt-12">
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
          <div className="space-y-12">
            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border-b border-[#1D1D1B]/10 pb-6">
              <div className="flex items-center gap-8 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-[10px] uppercase tracking-editorial font-bold transition-all whitespace-nowrap ${
                      selectedCategory === cat ? 'opacity-100 border-b border-[#1D1D1B] pb-1' : 'opacity-30 hover:opacity-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-80 group">
                <div className="flex items-center gap-3 w-full">
                  <Search className="w-3 h-3 opacity-20 group-focus-within:opacity-100 transition-opacity" />
                  <input 
                    type="text"
                    placeholder="SEARCH COLLECTION..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="w-full bg-transparent border-none text-[10px] uppercase tracking-[0.2em] font-bold focus:outline-none placeholder:opacity-20 translate-y-px"
                  />
                  <div className={`absolute bottom-0 left-0 h-px bg-[#1D1D1B] transition-all duration-500 ${searchQuery ? 'w-full' : 'w-0'}`}></div>
                </div>

                {/* Suggestions Overlay */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#1D1D1B]/10 shadow-2xl z-20 overflow-hidden"
                    >
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => {
                            setSearchQuery(suggestion.name);
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left px-6 py-4 hover:bg-[#F9F8F4] transition-colors flex items-center justify-between group"
                        >
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest">{suggestion.name}</p>
                            <p className="text-[9px] opacity-40 italic">{suggestion.category}</p>
                          </div>
                          <p className="text-[10px] opacity-0 group-hover:opacity-40 transition-opacity font-sans">View Item</p>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
              {filteredProducts.map((product, idx) => (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group cursor-pointer flex flex-col"
                >
                <div 
                  className="aspect-[4/5] bg-neutral-100 mb-6 overflow-hidden relative border border-[#1D1D1B]/5 group/img"
                >
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Quick View Button */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover/img:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover/img:translate-y-0">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickViewProduct(product);
                      }}
                      className="w-10 h-10 bg-white border border-[#1D1D1B]/10 flex items-center justify-center hover:bg-[#1D1D1B] hover:text-white transition-all shadow-sm"
                      title="Quick View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  <div 
                    onClick={() => setQuickViewProduct(product)}
                    className="absolute inset-0 bg-[#1D1D1B]/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] cursor-pointer"
                  >
                    <div className="bg-white px-8 py-3 text-[10px] uppercase tracking-[0.3em] font-bold shadow-2xl translate-y-4 group-hover/img:translate-y-0 transition-transform duration-500">
                      Archive Details
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-white px-2 py-1 text-[10px] uppercase tracking-tighter font-sans font-bold shadow-sm">
                    {product.category}
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

            {filteredProducts.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-[10px] uppercase tracking-widest opacity-40 italic">No matches found in the archive for "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Status Bar (Editorial Touch) */}
      <footer className="max-w-7xl mx-auto px-10 mt-24 flex flex-col md:flex-row justify-between items-center py-10 border-t border-[#1D1D1B]/10 gap-8">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-[10px] uppercase tracking-editorial font-sans font-bold">
          <div className="flex items-center space-x-4">
            <span className="opacity-20">Viewing Collection:</span>
            <span className="underline decoration-1 underline-offset-4 opacity-40">/storefront/{accountId?.slice(0, 8)}</span>
          </div>
          
          {(meta?.website || meta?.instagram || meta?.twitter) && (
            <div className="flex items-center gap-8 border-l border-[#1D1D1B]/10 pl-8 h-4">
              {meta?.website && (
                <a href={meta.website} target="_blank" rel="noreferrer" className="opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2" title="Website">
                  <Globe className="w-3 h-3" />
                  <span className="lowercase hidden md:inline opacity-60">website</span>
                </a>
              )}
              {meta?.instagram && (
                <a href={`https://instagram.com/${meta.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2" title="Instagram">
                  <Instagram className="w-3 h-3" />
                  <span className="lowercase hidden md:inline opacity-60">{meta.instagram.replace('@', '')}</span>
                </a>
              )}
              {meta?.twitter && (
                <div className="flex items-center gap-4">
                  <a href={`https://twitter.com/${meta.twitter.replace('@', '')}`} target="_blank" rel="noreferrer" className="opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2" title="Twitter Profile">
                    <Twitter className="w-3 h-3" />
                    <span className="lowercase hidden md:inline opacity-60">{meta.twitter.replace('@', '')}</span>
                  </a>
                  <a 
                    href={`https://twitter.com/intent/tweet?text=Exploring the curated collection at ${meta.displayName}&url=${encodeURIComponent(window.location.href)}&via=${meta.twitter.replace('@', '')}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="opacity-40 hover:opacity-100 transition-opacity" 
                    title="Share Storefront"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="text-[10px] font-sans italic opacity-20">
          Curated with Platform. © {new Date().getFullYear()}
        </div>
      </footer>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 md:px-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickViewProduct(null)}
              className="absolute inset-0 bg-[#F9F8F4]/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative w-full max-w-5xl bg-white border border-[#1D1D1B]/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
            >
              <button 
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-6 right-6 z-10 w-10 h-10 border border-[#1D1D1B]/10 hover:border-[#1D1D1B] flex items-center justify-center transition-colors group"
              >
                <span className="text-xl font-light group-hover:rotate-90 transition-transform">×</span>
              </button>

              <div className="w-full md:w-1/2 bg-[#F3F2EE] aspect-[4/5] md:aspect-auto overflow-hidden">
                <img 
                  src={quickViewProduct.image} 
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover grayscale-0 transition-all duration-1000"
                />
              </div>

              <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
                <div className="mb-12 space-y-4">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-30 block">{quickViewProduct.category}</span>
                  <h2 className="text-4xl md:text-5xl font-light italic leading-tight">{quickViewProduct.name}</h2>
                  <div className="h-px w-12 bg-[#1D1D1B]/20"></div>
                </div>

                <div className="space-y-8 flex-grow">
                  <p className="text-sm md:text-md font-sans leading-relaxed opacity-60">
                    {quickViewProduct.description || 'Quality handcrafted piece from our curated archive. Each item in our collection is selected for its unique character and craftsmanship.'}
                  </p>
                  
                  <div className="flex items-baseline gap-4">
                    <p className="text-3xl font-sans font-light tracking-tight">
                      ${(quickViewProduct.price / 100).toFixed(2)}
                    </p>
                    <span className="text-[10px] uppercase tracking-widest opacity-20 font-bold">Inc. VAT</span>
                  </div>
                </div>

                <div className="mt-12 space-y-4">
                  <button 
                    onClick={() => {
                      handleCheckout(quickViewProduct.priceId);
                      setQuickViewProduct(null);
                    }}
                    disabled={checkingOut !== null}
                    className="w-full py-5 bg-[#1D1D1B] text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#1D1D1B]/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {checkingOut === quickViewProduct.priceId ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        Aquire Piece
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center opacity-30 font-sans tracking-widest">SECURE CHECKOUT BY STRIPE</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
