import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import TrangChu from './pages/TrangChu/TrangChu';
import ThongTinCaNhan from './pages/User/ThongTinCaNhan';
import DoiMatKhau from './pages/User/DoiMatKhau';
import QuanLyTaiKhoan from './pages/QuanLyTaiKhoan/QuanLyTaiKhoan';
import QuanLyMonHoc from './pages/QuanLyMonHoc/QuanLyMonHoc';
import QuanLyGiangVien from './pages/QuanLyGiangVien/QuanLyGiangVien';
import QuanLyLopHocPhan from './pages/QuanLyLopHocPhan/QuanLyLopHocPhan';

// Page transition animation configuration
const pageTransitions = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
};

// Wrapper component that handles the page transitions
const PageTransitionWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} {...pageTransitions}>
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/trang-chu" replace />} />
          <Route path="/trang-chu" element={<PageTransitionWrapper><TrangChu /></PageTransitionWrapper>} />
          <Route path="/thong-tin-ca-nhan" element={<PageTransitionWrapper><ThongTinCaNhan /></PageTransitionWrapper>} />
          <Route path="/doi-mat-khau" element={<PageTransitionWrapper><DoiMatKhau /></PageTransitionWrapper>} />
          <Route path="/quan-ly-tai-khoan" element={<PageTransitionWrapper><QuanLyTaiKhoan /></PageTransitionWrapper>} />
          <Route path="/quan-ly-mon-hoc" element={<PageTransitionWrapper><QuanLyMonHoc /></PageTransitionWrapper>} />
          <Route path="/quan-ly-giang-vien" element={<PageTransitionWrapper><QuanLyGiangVien /></PageTransitionWrapper>} />
          <Route path="/quan-ly-lop-hoc-phan" element={<PageTransitionWrapper><QuanLyLopHocPhan /></PageTransitionWrapper>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;