import React, { useState, useEffect } from 'react';
import { useAccount } from '../contexts/AccountContext';
import { useAccountStatus } from '../hooks/useAccountStatus';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, User, MessageSquare, Share2, Globe, Instagram, Twitter, Mail, Phone, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const { accountId, setAccountId } = useAccount();
  const { accountStatus, loading, refreshStatus } = useAccountStatus();
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');

  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (accountStatus?.metadata) {
      setDisplayName(accountStatus.metadata.displayName || '');
      setBio(accountStatus.metadata.bio || '');
      setEmail(accountStatus.metadata.supportEmail || '');
      setPhone(accountStatus.metadata.supportPhone || '');
      setWebsite(accountStatus.metadata.website || '');
      setInstagram(accountStatus.metadata.instagram || '');
      setTwitter(accountStatus.metadata.twitter || '');
    }
  }, [accountStatus]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/update-account-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          metadata: {
            displayName,
            bio,
            supportEmail: email,
            supportPhone: phone,
            website,
            instagram,
            twitter
          }
        }),
      });
      if (res.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        refreshStatus();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!accountId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F8F4] p-6">
        <div className="text-center space-y-6">
          <h1 className="text-2xl font-light italic">Access Restricted</h1>
          <Link to="/" className="inline-block border border-[#1D1D1B] px-8 py-3 text-[10px] uppercase tracking-editorial font-bold hover:bg-[#1D1D1B] hover:text-white transition-all">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F8F4] text-[#1D1D1B]">
      {/* Top Nav */}
      <nav className="flex justify-between items-center px-10 py-6 border-b border-[#1D1D1B]/10 bg-white sticky top-0 z-10">
        <div className="text-2xl font-bold tracking-tighter uppercase font-sans">Platform.</div>
        <div className="flex space-x-8 text-xs uppercase tracking-editorial font-sans font-medium">
          <Link to="/" className="opacity-40 hover:opacity-100 transition-opacity">Dashboard</Link>
          <a href="#" className="opacity-40 hover:opacity-100 transition-opacity">Inventory</a>
          <a href="#" className="opacity-40 hover:opacity-100 transition-opacity">Analytics</a>
          <Link to="/settings" className="border-b border-[#1D1D1B] pb-1">Settings</Link>
        </div>
        <div className="h-8 w-8 rounded-full bg-[#1D1D1B] flex items-center justify-center text-white text-xs font-sans">
          MC
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full p-10 md:p-20 overflow-auto">
        <div className="flex items-center justify-between mb-16">
          <Link to="/" className="flex items-center gap-2 text-[10px] uppercase tracking-editorial font-bold opacity-40 hover:opacity-100 transition-opacity group">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Back
          </Link>
          <h1 className="text-5xl font-light italic leading-none">Merchant Identity</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-16 pb-20">
          {/* Profile Section */}
          <section className="space-y-10">
            <div className="flex items-center gap-4 opacity-30 border-b border-[#1D1D1B]/10 pb-4">
              <User className="w-4 h-4" />
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold font-sans">Public Profile</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <label className="block text-[10px] uppercase tracking-editorial font-sans font-bold text-[#1D1D1B]/60">Merchant Handle / Name</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-0 py-3 border-b border-[#1D1D1B]/10 bg-transparent font-serif text-xl focus:outline-none focus:border-[#1D1D1B] transition-colors"
                  placeholder="e.g. Studio Oistars"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] uppercase tracking-editorial font-sans font-bold text-[#1D1D1B]/60">Short Narrative (Bio)</label>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-0 py-2 border-b border-[#1D1D1B]/10 bg-transparent font-sans text-sm italic focus:outline-none focus:border-[#1D1D1B] transition-colors resize-none"
                  placeholder="The story behind your craft..."
                  rows={2}
                />
              </div>
            </div>
          </section>

          {/* Contact Details */}
          <section className="space-y-10">
            <div className="flex items-center gap-4 opacity-30 border-b border-[#1D1D1B]/10 pb-4">
              <MessageSquare className="w-4 h-4" />
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold font-sans">Contact & Support</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <label className="block text-[10px] uppercase tracking-editorial font-sans font-bold text-[#1D1D1B]/60 flex items-center gap-2">
                  <Mail className="w-3 h-3" /> Support Email Address
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-0 py-3 border-b border-[#1D1D1B]/10 bg-transparent font-sans text-lg focus:outline-none focus:border-[#1D1D1B]"
                  placeholder="support@merchant.com"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] uppercase tracking-editorial font-sans font-bold text-[#1D1D1B]/60 flex items-center gap-2">
                  <Phone className="w-3 h-3" /> Phone Number
                </label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-0 py-3 border-b border-[#1D1D1B]/10 bg-transparent font-sans text-lg focus:outline-none focus:border-[#1D1D1B]"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </section>

          {/* Social Presence */}
          <section className="space-y-10">
            <div className="flex items-center gap-4 opacity-30 border-b border-[#1D1D1B]/10 pb-4">
              <Share2 className="w-4 h-4" />
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold font-sans">Digital Presence</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               <div className="space-y-4">
                <label className="block text-[10px] uppercase tracking-editorial font-sans font-bold text-[#1D1D1B]/60 flex items-center gap-2">
                  <Globe className="w-3 h-3" /> Website URL
                </label>
                <input 
                  type="url" 
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-0 py-2 border-b border-[#1D1D1B]/10 bg-transparent font-sans text-sm focus:outline-none focus:border-[#1D1D1B]"
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] uppercase tracking-editorial font-sans font-bold text-[#1D1D1B]/60 flex items-center gap-2">
                  <Instagram className="w-3 h-3" /> Instagram
                </label>
                <input 
                  type="text" 
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full px-0 py-2 border-b border-[#1D1D1B]/10 bg-transparent font-sans text-sm focus:outline-none focus:border-[#1D1D1B]"
                  placeholder="@handle"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] uppercase tracking-editorial font-sans font-bold text-[#1D1D1B]/60 flex items-center gap-2">
                  <Twitter className="w-3 h-3" /> Twitter / X
                </label>
                <input 
                  type="text" 
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="w-full px-0 py-2 border-b border-[#1D1D1B]/10 bg-transparent font-sans text-sm focus:outline-none focus:border-[#1D1D1B]"
                  placeholder="@handle"
                />
              </div>
            </div>
          </section>

          <div className="pt-20 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-[#1D1D1B]/10">
            <div className="text-[10px] font-sans italic opacity-40 max-w-xs text-center md:text-left">
              Changes updated here will be reflected on your public storefront instantly.
            </div>
            <button 
              type="submit"
              disabled={saving}
              className="px-16 py-4 bg-[#1D1D1B] text-white text-[10px] uppercase tracking-[0.4em] font-sans font-bold hover:bg-black transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
              Synchronize Archive
            </button>
          </div>

          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white border border-[#1D1D1B] px-8 py-3 rounded-sm shadow-2xl flex items-center gap-3 z-50 text-[10px] uppercase tracking-widest font-bold"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Manifest Updated Successfully
            </motion.div>
          )}
        </form>
      </main>
    </div>
  );
}
