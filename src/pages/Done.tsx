import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, ArrowRight, ShoppingBag, Store } from 'lucide-react';

export default function Done() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-[#F9F8F4] flex items-center justify-center p-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-12 border border-[#1D1D1B]/10 text-center space-y-12"
      >
        <div className="relative">
          <div className="relative bg-[#1D1D1B] w-20 h-20 flex items-center justify-center mx-auto text-white">
            <CheckCircle className="w-10 h-10" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.3em] font-sans font-bold text-emerald-600">Transaction Complete</p>
            <h1 className="text-4xl font-light italic leading-tight">Payment Successful</h1>
          </div>
          <p className="text-[#1D1D1B]/60 italic text-sm leading-relaxed">
            Thank you for your purchase. Your order has been registered in our curated archive.
          </p>
          {sessionId && (
             <div className="pt-6 border-t border-[#1D1D1B]/5">
               <p className="text-[10px] text-[#1D1D1B]/40 uppercase tracking-editorial font-sans font-bold mb-2">Record Hash</p>
               <p className="text-[10px] font-mono text-[#1D1D1B]/60 break-all bg-[#F9F8F4] p-3 border border-[#1D1D1B]/5">{sessionId}</p>
             </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Link 
            to="/" 
            className="w-full py-4 bg-[#1D1D1B] text-white text-[10px] uppercase tracking-[0.3em] font-sans font-bold hover:bg-black transition-all"
          >
            Dashboard
          </Link>
          <button 
             onClick={() => window.close()}
             className="text-[10px] uppercase tracking-editorial font-bold opacity-40 hover:opacity-100 transition-opacity"
          >
            Close Window
          </button>
        </div>
        
        <div className="flex items-center justify-center gap-2 pt-8 border-t border-[#1D1D1B]/5 text-[10px] font-bold text-[#1D1D1B]/20 uppercase tracking-[0.3em]">
          <ShoppingBag className="w-3 h-3" />
          Order Verified
        </div>
      </motion.div>
    </div>
  );
}
