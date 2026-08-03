import React from "react";
import { Trophy, Star, Sparkles, Medal, Heart, Lightbulb, Target, Rocket, Shield, Globe, Crown, Award, BrainCircuit, Cpu, Zap } from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  trophy: Trophy,
  star: Star,
  sparkles: Sparkles,
  medal: Medal,
  heart: Heart,
  lightbulb: Lightbulb,
  target: Target,
  rocket: Rocket,
  shield: Shield,
  globe: Globe,
  crown: Crown,
  award: Award,
  brain: BrainCircuit,
  cpu: Cpu,
  zap: Zap,
};

export const AWARD_ICON_OPTIONS = Object.keys(ICONS);

export function AwardIcon({ name, size = 18 }: { name?: string | null; size?: number }) {
  const Icon = (name && ICONS[name]) || Trophy;
  return <Icon size={size} />;
}
