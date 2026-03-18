import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/karaoke" element={<Karaoke />} />
            <Route path="/fingerprint" element={<Fingerprint />} />
            <Route path="/diagnostico" element={<Diagnostico />} />
            <Route path="/coach" element={<Coach />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/matching" element={<Matching />} />
            <Route path="/duetos" element={<Duetos />} />
            <Route path="/portfolio" element={<Portfolio />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
