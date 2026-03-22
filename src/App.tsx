import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";

// Lazy-loaded routes
const Login = lazy(() => import("./pages/Login"));
const Landing = lazy(() => import("./pages/Landing"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VocalDnaTest = lazy(() => import("./pages/VocalDnaTest"));
const Index = lazy(() => import("./pages/Index"));
const Karaoke = lazy(() => import("./pages/Karaoke"));
const Fingerprint = lazy(() => import("./pages/Fingerprint"));
const Coach = lazy(() => import("./pages/Coach"));
const Exercises = lazy(() => import("./pages/Exercises"));
const Challenges = lazy(() => import("./pages/Challenges"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const BreathTrainer = lazy(() => import("./pages/BreathTrainer"));
const PitchTraining = lazy(() => import("./pages/PitchTraining"));
const WarmUp = lazy(() => import("./pages/WarmUp"));
const Comparator = lazy(() => import("./pages/Comparator"));
const SongSketch = lazy(() => import("./pages/SongSketch"));
const LoopStation = lazy(() => import("./pages/LoopStation"));
const LyricsWriter = lazy(() => import("./pages/LyricsWriter"));
const Duelos = lazy(() => import("./pages/Duelos"));
const VoiceJournal = lazy(() => import("./pages/VoiceJournal"));
const SkillTree = lazy(() => import("./pages/SkillTree"));
const TalentFeed = lazy(() => import("./pages/TalentFeed"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function AmberSpinner() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<AmberSpinner />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public routes — no layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/vocal-dna-test" element={<VocalDnaTest />} />

          {/* App routes with layout */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<PageTransition><Index /></PageTransition>} />
            <Route path="/karaoke" element={<PageTransition><Karaoke /></PageTransition>} />
            <Route path="/fingerprint" element={<PageTransition><Fingerprint /></PageTransition>} />
            <Route path="/coach" element={<PageTransition><Coach /></PageTransition>} />
            <Route path="/exercises" element={<PageTransition><Exercises /></PageTransition>} />
            <Route path="/challenges" element={<PageTransition><Challenges /></PageTransition>} />
            <Route path="/portfolio" element={<PageTransition><Portfolio /></PageTransition>} />
            <Route path="/breath-trainer" element={<PageTransition><BreathTrainer /></PageTransition>} />
            <Route path="/pitch-training" element={<PageTransition><PitchTraining /></PageTransition>} />
            <Route path="/warmup" element={<PageTransition><WarmUp /></PageTransition>} />
            <Route path="/comparator" element={<PageTransition><Comparator /></PageTransition>} />
            <Route path="/song-sketch" element={<PageTransition><SongSketch /></PageTransition>} />
            <Route path="/loop-station" element={<PageTransition><LoopStation /></PageTransition>} />
            <Route path="/lyrics-writer" element={<PageTransition><LyricsWriter /></PageTransition>} />
            <Route path="/duelos" element={<PageTransition><Duelos /></PageTransition>} />
            <Route path="/voice-journal" element={<PageTransition><VoiceJournal /></PageTransition>} />
            <Route path="/skill-tree" element={<PageTransition><SkillTree /></PageTransition>} />
            <Route path="/talent-feed" element={<PageTransition><TalentFeed /></PageTransition>} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AnimatedRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
