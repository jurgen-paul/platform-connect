import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AccountProvider } from './contexts/AccountContext';
import Home from './pages/Home';
import Storefront from './pages/Storefront';
import Done from './pages/Done';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AccountProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/storefront/:accountId" element={<Storefront />} />
          <Route path="/done" element={<Done />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Router>
    </AccountProvider>
  );
}
