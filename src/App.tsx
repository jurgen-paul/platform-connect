import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AccountProvider } from './contexts/AccountContext';
import Home from './pages/Home';
import Storefront from './pages/Storefront';
import Done from './pages/Done';

export default function App() {
  return (
    <AccountProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/storefront/:accountId" element={<Storefront />} />
          <Route path="/done" element={<Done />} />
        </Routes>
      </Router>
    </AccountProvider>
  );
}
