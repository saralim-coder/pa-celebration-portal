import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout.jsx';
import EventLayout from './components/EventLayout.jsx';
import Home from './pages/Home.jsx';
import MyEvents from './pages/MyEvents.jsx';
import EventHome from './pages/EventHome.jsx';
import EventUpload from './pages/EventUpload.jsx';
import EventGallery from './pages/EventGallery.jsx';
import EventSlideshow from './pages/EventSlideshow.jsx';
import Dashboard from './pages/Dashboard.jsx';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Main portal */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/my-events" element={<MyEvents />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>

      {/* Event-scoped routes */}
      <Route path="/event/:eventId" element={<EventLayout />}>
        <Route index element={<EventHome />} />
        <Route path="upload" element={<EventUpload />} />
        <Route path="gallery" element={<EventGallery />} />
      </Route>
      <Route path="/event/:eventId/slideshow" element={<EventSlideshow />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App