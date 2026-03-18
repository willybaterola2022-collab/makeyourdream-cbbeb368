import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import Index from "./pages/Index";
import Karaoke from "./pages/Karaoke";
import Fingerprint from "./pages/Fingerprint";
import Diagnostico from "./pages/Diagnostico";
import Coach from "./pages/Coach";
import Exercises from "./pages/Exercises";
import Challenges from "./pages/Challenges";
import Matching from "./pages/Matching";
import Duetos from "./pages/Duetos";
import Portfolio from "./pages/Portfolio";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes (no sidebar) */}
        <Route path="/landing" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* App routes (with sidebar layout) */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/karaoke" element={<PageTransition><Karaoke /></PageTransition>} />
          <Route path="/fingerprint" element={<PageTransition><Fingerprint /></PageTransition>} />
          <Route path="/diagnostico" element={<PageTransition><Diagnostico /></PageTransition>} />
          <Route path="/coach" element={<PageTransition><Coach /></PageTransition>} />
          <Route path="/exercises" element={<PageTransition><Exercises /></PageTransition>} />
          <Route path="/challenges" element={<PageTransition><Challenges /></PageTransition>} />
          <Route path="/matching" element={<PageTransition><Matching /></PageTransition>} />
          <Route path="/duetos" element={<PageTransition><Duetos /></PageTransition>} />
          <Route path="/portfolio" element={<PageTransition><Portfolio /></PageTransition>} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
