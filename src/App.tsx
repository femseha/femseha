import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import { Admin } from './pages/Admin';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/article/:slug" element={<ArticleDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
