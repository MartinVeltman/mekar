
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Context Providers
import { LanguageProvider } from "./i18n/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { OfflineProvider } from "./contexts/OfflineContext";

// Components
import { BottomNavigation } from "./components/BottomNavigation";

// Pages
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Map } from "./pages/Map";
import { Reports } from "./pages/Reports";
import { ReportCreate } from "./pages/ReportCreate";
import { ReportDetail } from "./pages/ReportDetail";
import NotFound from "./pages/NotFound";

// Auth Route Guard
import { PrivateRoute } from "./components/PrivateRoute";

const queryClient = new QueryClient();

// Wrapper component for conditional navigation
const NavigationWrapper = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return !isLoginPage ? <BottomNavigation /> : null;
};

const App = () => {
  // Register the service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').then(
        registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        },
        error => {
          console.log('ServiceWorker registration failed: ', error);
        }
      );
    });
  }

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <OfflineProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  
                  {/* Protected routes */}
                  <Route
                    path="/home"
                    element={
                      <PrivateRoute>
                        <Home />
                      </PrivateRoute>
                    }
                  />
                  
                  <Route
                    path="/map"
                    element={
                      <PrivateRoute>
                        <Map />
                      </PrivateRoute>
                    }
                  />
                  
                  <Route
                    path="/reports"
                    element={
                      <PrivateRoute>
                        <Reports />
                      </PrivateRoute>
                    }
                  />
                  
                  <Route
                    path="/reports/create"
                    element={
                      <PrivateRoute>
                        <ReportCreate />
                      </PrivateRoute>
                    }
                  />
                  
                  <Route
                    path="/reports/:reportId"
                    element={
                      <PrivateRoute>
                        <ReportDetail />
                      </PrivateRoute>
                    }
                  />
                  
                  {/* Redirect root to either home or login */}
                  <Route
                    path="/"
                    element={<Navigate to="/home" replace />}
                  />
                  
                  {/* 404 Not Found route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                
                {/* Bottom Navigation - with conditional rendering */}
                <NavigationWrapper />
              </BrowserRouter>
            </TooltipProvider>
          </OfflineProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
