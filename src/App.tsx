import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";

import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import ResetPassword from "./pages/ResetPassword";
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
import DreamCanvas from "./pages/DreamCanvas";
import Plan90 from "./pages/Plan90";
import BreathTrainer from "./pages/BreathTrainer";
import PitchTraining from "./pages/PitchTraining";
import WarmUp from "./pages/WarmUp";
import Comparator from "./pages/Comparator";
import AutoMix from "./pages/AutoMix";
import NotFound from "./pages/NotFound";
import SongSketch from "./pages/SongSketch";
import HarmonyLab from "./pages/HarmonyLab";
import LoopStation from "./pages/LoopStation";
import LyricsWriter from "./pages/LyricsWriter";
import VocalFX from "./pages/VocalFX";
import Duelos from "./pages/Duelos";
import VocalStories from "./pages/VocalStories";
import CollabRoom from "./pages/CollabRoom";
import FanRadar from "./pages/FanRadar";
import EmotionMap from "./pages/EmotionMap";
import GenreGym from "./pages/GenreGym";
import StageSimulator from "./pages/StageSimulator";
import VoiceJournal from "./pages/VoiceJournal";
import SkillTree from "./pages/SkillTree";
import TalentFeed from "./pages/TalentFeed";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* App routes — public, login only needed to save */}
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
          <Route path="/dream-canvas" element={<PageTransition><DreamCanvas /></PageTransition>} />
          <Route path="/plan-90" element={<PageTransition><Plan90 /></PageTransition>} />
          <Route path="/breath-trainer" element={<PageTransition><BreathTrainer /></PageTransition>} />
          <Route path="/pitch-training" element={<PageTransition><PitchTraining /></PageTransition>} />
          <Route path="/warmup" element={<PageTransition><WarmUp /></PageTransition>} />
          <Route path="/comparator" element={<PageTransition><Comparator /></PageTransition>} />
          <Route path="/automix" element={<PageTransition><AutoMix /></PageTransition>} />
          <Route path="/song-sketch" element={<PageTransition><SongSketch /></PageTransition>} />
          <Route path="/harmony-lab" element={<PageTransition><HarmonyLab /></PageTransition>} />
          <Route path="/loop-station" element={<PageTransition><LoopStation /></PageTransition>} />
          <Route path="/lyrics-writer" element={<PageTransition><LyricsWriter /></PageTransition>} />
          <Route path="/vocal-fx" element={<PageTransition><VocalFX /></PageTransition>} />
          <Route path="/duelos" element={<PageTransition><Duelos /></PageTransition>} />
          <Route path="/vocal-stories" element={<PageTransition><VocalStories /></PageTransition>} />
          <Route path="/collab-room" element={<PageTransition><CollabRoom /></PageTransition>} />
          <Route path="/fan-radar" element={<PageTransition><FanRadar /></PageTransition>} />
          <Route path="/emotion-map" element={<PageTransition><EmotionMap /></PageTransition>} />
          <Route path="/genre-gym" element={<PageTransition><GenreGym /></PageTransition>} />
          <Route path="/stage-simulator" element={<PageTransition><StageSimulator /></PageTransition>} />
          <Route path="/voice-journal" element={<PageTransition><VoiceJournal /></PageTransition>} />
          <Route path="/skill-tree" element={<PageTransition><SkillTree /></PageTransition>} />
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
        <AuthProvider>
          <AnimatedRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
