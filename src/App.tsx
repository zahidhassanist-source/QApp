import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import Layout from '@/components/Layout';

// Lazy load page components to reduce initial bundle size
const Login = lazy(() => import('@/pages/Login'));
const Home = lazy(() => import('@/pages/Home'));
const Category = lazy(() => import('@/pages/Category'));
const YearList = lazy(() => import('@/pages/YearList'));
const Viewer = lazy(() => import('@/pages/Viewer'));
const Admin = lazy(() => import('@/pages/Admin'));
const Bookmarks = lazy(() => import('@/pages/Bookmarks'));
const Profile = lazy(() => import('@/pages/Profile'));
const Browse = lazy(() => import('@/pages/Browse'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useStore((state) => state.user);
  const checkSession = useStore((state) => state.checkSession);

  React.useEffect(() => {
    checkSession();
  }, [checkSession]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Home />} />
            <Route path="browse/*" element={<Browse />} />
            <Route path="viewer/:id" element={<Viewer />} />
            <Route path="admin" element={<Admin />} />
            <Route path="bookmarks" element={<Bookmarks />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
