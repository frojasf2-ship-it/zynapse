import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home/Home'
import Biography from './pages/Biography/Biography'
import Research from './pages/Research/Research'
import News from './pages/News/News'
import Development from './pages/Development/Development'
import Contact from './pages/Contact/Contact'
import Login from './pages/Auth/Login'
import AdminDashboard from './pages/Admin/AdminDashboard'
import ForumList from './pages/Forum/ForumList'
import ThreadDetail from './pages/Forum/ThreadDetail'
import { db } from './firebase/firebaseConfig'
import { doc, runTransaction } from 'firebase/firestore'
import './App.css'

function App() {
  // Increment visit counter on app load
  useEffect(() => {
    const incrementVisits = async () => {
      try {
        const statsRef = doc(db, 'stats', 'global');
        await runTransaction(db, async (transaction) => {
          const statsDoc = await transaction.get(statsRef);
          const currentVisits = statsDoc.exists() ? (statsDoc.data().visits || 0) : 0;
          transaction.set(statsRef, { visits: currentVisits + 1 });
        });
      } catch (error) {
        console.error('Error incrementing visits:', error);
      }
    };

    incrementVisits();
  }, []);
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/conocenos" element={<Biography />} />
        <Route path="/investigacion" element={<Research />} />
        <Route path="/noticias" element={<News />} />
        <Route path="/desarrollo" element={<Development />} />
        <Route path="/foro" element={<ForumList />} />
        <Route path="/foro/:id" element={<ThreadDetail />} />
        <Route path="/contacto" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </>
  )
}

export default App
