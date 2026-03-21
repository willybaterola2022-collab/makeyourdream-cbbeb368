import { LucideIcon } from "lucide-react";
import {
  Target, Fingerprint, Wind, Flame, Dumbbell, Music2, ArrowUp, Layers, Sparkles, Crown,
  Heart, Mic, PenTool, Wand2, FileText, Disc, Radio, Sliders, Zap, Star,
  Repeat, Calendar, Brain, GitCompare, Briefcase, Monitor, Swords, Users, TrendingUp, Trophy,
} from "lucide-react";

export type SkillBranch = "tecnica" | "artistica" | "performance";
export type SkillStatus = "completed" | "unlocked" | "locked" | "coming-soon";

export interface SkillNodeData {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  branch: SkillBranch;
  route: string;
  requiredXP: number;
  requiredSessions: number;
  status: SkillStatus;
  order: number;
  isBoss?: boolean;
  mockSessions?: { current: number; total: number };
  rewardXP: number;
  rewardBadge: string;
  rewardTitle: string;
}

export const BRANCH_META: Record<SkillBranch, { label: string; color: string; gradient: string }> = {
  tecnica: { label: "Técnica", color: "#00E5A0", gradient: "from-emerald-500 to-teal-400" },
  artistica: { label: "Artística", color: "#FF3CAC", gradient: "from-pink-500 to-purple-500" },
  performance: { label: "Performance", color: "#2B86C5", gradient: "from-blue-500 to-cyan-400" },
};

export const LEVEL_TIERS = [
  { xp: 0, name: "Novato", color: "#A0A0B0" },
  { xp: 50, name: "Aprendiz", color: "#A0A0B0" },
  { xp: 150, name: "Cantante", color: "#00E5A0" },
  { xp: 300, name: "Intérprete", color: "#00E5A0" },
  { xp: 500, name: "Vocalista", color: "#2B86C5" },
  { xp: 750, name: "Artista", color: "#2B86C5" },
  { xp: 1000, name: "Performer", color: "#784BA0" },
  { xp: 1300, name: "Profesional", color: "#784BA0" },
  { xp: 1600, name: "Virtuoso", color: "#FF3CAC" },
  { xp: 2000, name: "Maestro", color: "#FF3CAC" },
  { xp: 2500, name: "Experto", color: "#FFA502" },
  { xp: 3000, name: "Elite", color: "#FFA502" },
  { xp: 3500, name: "Champion", color: "#FFA502" },
  { xp: 4000, name: "Diamante", color: "#00E5FF" },
  { xp: 4500, name: "Platino", color: "#E0E0E0" },
  { xp: 5000, name: "Legendario", color: "#FFD700" },
  { xp: 6000, name: "Mítico", color: "#FFD700" },
  { xp: 7500, name: "Inmortal", color: "#FFD700" },
  { xp: 9000, name: "Divino", color: "#FFD700" },
  { xp: 10000, name: "LEYENDA", color: "#FFD700" },
];

export function getLevelForXP(xp: number) {
  let level = LEVEL_TIERS[0];
  for (const tier of LEVEL_TIERS) {
    if (xp >= tier.xp) level = tier;
    else break;
  }
  const idx = LEVEL_TIERS.indexOf(level);
  const next = LEVEL_TIERS[idx + 1];
  const progress = next ? (xp - level.xp) / (next.xp - level.xp) : 1;
  return { ...level, index: idx + 1, total: LEVEL_TIERS.length, progress, nextXP: next?.xp ?? level.xp };
}

export function getStreakMultiplier(streak: number) {
  if (streak >= 14) return { value: 3, label: "3x", color: "#FFD700", tier: "fire" as const };
  if (streak >= 7) return { value: 2, label: "2x", color: "#FFA502", tier: "orange" as const };
  if (streak >= 4) return { value: 1.5, label: "1.5x", color: "#FFBE76", tier: "amber" as const };
  return { value: 1, label: "1x", color: "#A0A0B0", tier: "base" as const };
}

export const LEAGUE_TIERS = [
  { name: "Bronce", color: "#CD7F32", icon: "🥉", minXP: 0 },
  { name: "Plata", color: "#C0C0C0", icon: "🥈", minXP: 100 },
  { name: "Oro", color: "#FFD700", icon: "🥇", minXP: 300 },
  { name: "Diamante", color: "#00E5FF", icon: "💎", minXP: 600 },
  { name: "Leyenda", color: "#FF3CAC", icon: "👑", minXP: 1000 },
];

export const SKILL_TREE_DATA: SkillNodeData[] = [
  // ═══ TÉCNICA ═══
  { id: "t1", name: "Afinación Básica", description: "Domina la precisión tonal nota por nota", icon: Target, branch: "tecnica", route: "/pitch-training", requiredXP: 0, requiredSessions: 10, status: "unlocked", order: 1, mockSessions: { current: 3, total: 10 }, rewardXP: 50, rewardBadge: "🎯 Oído de Oro", rewardTitle: "Afinador Nivel 1" },
  { id: "t2", name: "Rango Vocal", description: "Descubre y expande tu rango completo", icon: Fingerprint, branch: "tecnica", route: "/fingerprint", requiredXP: 100, requiredSessions: 8, status: "locked", order: 2, mockSessions: { current: 0, total: 8 }, rewardXP: 75, rewardBadge: "🔬 ADN Vocal", rewardTitle: "Explorador de Rango" },
  { id: "t3", name: "Respiración", description: "Control diafragmático y soporte de aire", icon: Wind, branch: "tecnica", route: "/breath-trainer", requiredXP: 200, requiredSessions: 12, status: "locked", order: 3, mockSessions: { current: 0, total: 12 }, rewardXP: 100, rewardBadge: "🌬️ Pulmones de Acero", rewardTitle: "Maestro del Aire" },
  { id: "t4", name: "Calentamiento", description: "Rutinas de warm-up para proteger tu voz", icon: Flame, branch: "tecnica", route: "/warmup", requiredXP: 300, requiredSessions: 15, status: "locked", order: 4, mockSessions: { current: 0, total: 15 }, rewardXP: 100, rewardBadge: "🔥 Motor Encendido", rewardTitle: "Voz Caliente" },
  { id: "t5", name: "Ejercicios", description: "Ejercicios progresivos para tu nivel", icon: Dumbbell, branch: "tecnica", route: "/exercises", requiredXP: 400, requiredSessions: 20, status: "locked", order: 5, mockSessions: { current: 0, total: 20 }, rewardXP: 150, rewardBadge: "💪 Atleta Vocal", rewardTitle: "Guerrero del Ejercicio" },
  { id: "t6", name: "Armonías", description: "Canta segundas voces y armonías complejas", icon: Music2, branch: "tecnica", route: "/harmony-lab", requiredXP: 600, requiredSessions: 15, status: "coming-soon", order: 6, rewardXP: 200, rewardBadge: "🎶 Armonizador", rewardTitle: "Voz Dual" },
  { id: "t7", name: "Falsete", description: "Registro agudo limpio y controlado", icon: ArrowUp, branch: "tecnica", route: "/exercises", requiredXP: 800, requiredSessions: 12, status: "coming-soon", order: 7, rewardXP: 200, rewardBadge: "☁️ Voz Celestial", rewardTitle: "Ángel del Falsete" },
  { id: "t8", name: "Registro Mixto", description: "Transición fluida pecho-cabeza", icon: Layers, branch: "tecnica", route: "/warmup", requiredXP: 1000, requiredSessions: 15, status: "coming-soon", order: 8, rewardXP: 250, rewardBadge: "🔀 Camaleón Vocal", rewardTitle: "Maestro de Registros" },
  { id: "t9", name: "Melismas", description: "Runs y ornamentaciones a alta velocidad", icon: Sparkles, branch: "tecnica", route: "/exercises", requiredXP: 1500, requiredSessions: 20, status: "coming-soon", order: 9, rewardXP: 300, rewardBadge: "✨ Dedos de Seda", rewardTitle: "Virtuoso del Run" },
  { id: "t10", name: "Maestro Técnico", description: "Evaluación final — demuestra dominio completo", icon: Crown, branch: "tecnica", route: "/diagnostico", requiredXP: 2000, requiredSessions: 5, status: "coming-soon", order: 10, isBoss: true, rewardXP: 500, rewardBadge: "👑 Corona Técnica", rewardTitle: "MAESTRO TÉCNICO" },

  // ═══ ARTÍSTICA ═══
  { id: "a1", name: "Expresión Emocional", description: "Conecta emoción con cada nota que cantas", icon: Heart, branch: "artistica", route: "/emotion-map", requiredXP: 0, requiredSessions: 8, status: "unlocked", order: 1, mockSessions: { current: 5, total: 8 }, rewardXP: 50, rewardBadge: "❤️ Alma Cantante", rewardTitle: "Corazón Abierto" },
  { id: "a2", name: "Interpretación", description: "Canta con intención y personalidad", icon: Mic, branch: "artistica", route: "/karaoke", requiredXP: 100, requiredSessions: 10, status: "locked", order: 2, mockSessions: { current: 0, total: 10 }, rewardXP: 75, rewardBadge: "🎤 Showman", rewardTitle: "Intérprete Natural" },
  { id: "a3", name: "Composición", description: "Crea tus propias melodías y estructuras", icon: PenTool, branch: "artistica", route: "/song-sketch", requiredXP: 250, requiredSessions: 8, status: "locked", order: 3, mockSessions: { current: 0, total: 8 }, rewardXP: 100, rewardBadge: "🎼 Compositor", rewardTitle: "Creador de Melodías" },
  { id: "a4", name: "Efectos Vocales", description: "Grit, whistle, growl y más texturas", icon: Wand2, branch: "artistica", route: "/vocal-fx", requiredXP: 400, requiredSessions: 12, status: "locked", order: 4, mockSessions: { current: 0, total: 12 }, rewardXP: 150, rewardBadge: "🪄 Mago Vocal", rewardTitle: "Alquimista del Sonido" },
  { id: "a5", name: "Escritura", description: "Escribe letras con impacto emocional", icon: FileText, branch: "artistica", route: "/lyrics-writer", requiredXP: 500, requiredSessions: 10, status: "coming-soon", order: 5, rewardXP: 150, rewardBadge: "📝 Poeta Urbano", rewardTitle: "Letrista" },
  { id: "a6", name: "Producción", description: "Graba capas y construye tu canción", icon: Disc, branch: "artistica", route: "/loop-station", requiredXP: 700, requiredSessions: 8, status: "locked", order: 6, mockSessions: { current: 0, total: 8 }, rewardXP: 200, rewardBadge: "💿 Productor", rewardTitle: "Ingeniero de Sonido" },
  { id: "a7", name: "Géneros", description: "Domina pop, rock, R&B, jazz y más", icon: Radio, branch: "artistica", route: "/genre-gym", requiredXP: 900, requiredSessions: 15, status: "coming-soon", order: 7, rewardXP: 200, rewardBadge: "📻 Camaleón Musical", rewardTitle: "Multi-Género" },
  { id: "a8", name: "Auto Mix", description: "Mezcla automática con IA de tus tomas", icon: Sliders, branch: "artistica", route: "/automix", requiredXP: 1200, requiredSessions: 10, status: "coming-soon", order: 8, rewardXP: 250, rewardBadge: "🎛️ DJ Vocal", rewardTitle: "Mezclador Pro" },
  { id: "a9", name: "Improvisación", description: "Freestyle vocal con confianza total", icon: Zap, branch: "artistica", route: "/karaoke", requiredXP: 1500, requiredSessions: 15, status: "coming-soon", order: 9, rewardXP: 300, rewardBadge: "⚡ Rayo Freestyle", rewardTitle: "Improvisador" },
  { id: "a10", name: "Artista Completo", description: "Boss Battle — demuestra tu arte integral", icon: Star, branch: "artistica", route: "/portfolio", requiredXP: 2000, requiredSessions: 5, status: "coming-soon", order: 10, isBoss: true, rewardXP: 500, rewardBadge: "⭐ Estrella Total", rewardTitle: "ARTISTA COMPLETO" },

  // ═══ PERFORMANCE ═══
  { id: "p1", name: "Loop Station", description: "Crea loops en vivo y construye capas", icon: Repeat, branch: "performance", route: "/loop-station", requiredXP: 0, requiredSessions: 8, status: "unlocked", order: 1, mockSessions: { current: 1, total: 8 }, rewardXP: 50, rewardBadge: "🔁 Looper", rewardTitle: "Arquitecto de Loops" },
  { id: "p2", name: "Retos Diarios", description: "Completa retos para ganar XP cada día", icon: Calendar, branch: "performance", route: "/challenges", requiredXP: 100, requiredSessions: 7, status: "locked", order: 2, mockSessions: { current: 0, total: 7 }, rewardXP: 75, rewardBadge: "📅 Imparable", rewardTitle: "Guerrero Diario" },
  { id: "p3", name: "Coach IA", description: "Feedback personalizado de tu coach virtual", icon: Brain, branch: "performance", route: "/coach", requiredXP: 200, requiredSessions: 10, status: "locked", order: 3, mockSessions: { current: 0, total: 10 }, rewardXP: 100, rewardBadge: "🧠 Mente Brillante", rewardTitle: "Alumno Dedicado" },
  { id: "p4", name: "Comparador", description: "Mide tu evolución antes vs después", icon: GitCompare, branch: "performance", route: "/comparator", requiredXP: 350, requiredSessions: 6, status: "locked", order: 4, mockSessions: { current: 0, total: 6 }, rewardXP: 100, rewardBadge: "📊 Científico Vocal", rewardTitle: "Analista de Progreso" },
  { id: "p5", name: "Portfolio", description: "Construye tu carta de presentación vocal", icon: Briefcase, branch: "performance", route: "/portfolio", requiredXP: 500, requiredSessions: 8, status: "locked", order: 5, mockSessions: { current: 0, total: 8 }, rewardXP: 150, rewardBadge: "💼 Profesional", rewardTitle: "Portafolio Estelar" },
  { id: "p6", name: "Escenario", description: "Simula actuaciones en vivo con público", icon: Monitor, branch: "performance", route: "/stage-simulator", requiredXP: 700, requiredSessions: 10, status: "coming-soon", order: 6, rewardXP: 200, rewardBadge: "🎭 Actor de Escena", rewardTitle: "Showman" },
  { id: "p7", name: "Duelos", description: "Enfrenta a otros cantantes en tiempo real", icon: Swords, branch: "performance", route: "/duelos", requiredXP: 900, requiredSessions: 10, status: "coming-soon", order: 7, rewardXP: 200, rewardBadge: "⚔️ Gladiador", rewardTitle: "Duelista" },
  { id: "p8", name: "Colaboración", description: "Canta con otros artistas en salas live", icon: Users, branch: "performance", route: "/collab-room", requiredXP: 1200, requiredSessions: 8, status: "coming-soon", order: 8, rewardXP: 250, rewardBadge: "🤝 Hermandad", rewardTitle: "Colaborador" },
  { id: "p9", name: "Fan Base", description: "Construye tu audiencia y seguidores", icon: TrendingUp, branch: "performance", route: "/fan-radar", requiredXP: 1500, requiredSessions: 15, status: "coming-soon", order: 9, rewardXP: 300, rewardBadge: "📈 Viral", rewardTitle: "Influencer Vocal" },
  { id: "p10", name: "Leyenda", description: "El Boss Final — conviértete en leyenda", icon: Trophy, branch: "performance", route: "/portfolio", requiredXP: 2500, requiredSessions: 3, status: "coming-soon", order: 10, isBoss: true, rewardXP: 1000, rewardBadge: "🏆 Leyenda Inmortal", rewardTitle: "LEYENDA" },
];
