import { Mail, BookOpen, MessageCircleHeart, type LucideIcon } from "lucide-react";

export type NavItem = {
  to: "/" | "/research" | "/chat";
  label: string;
  short: string;
  icon: LucideIcon;
  description: string;
};

export const NAV_ITEMS: NavItem[] = [
  {
    to: "/",
    label: "Email Studio",
    short: "Email",
    icon: Mail,
    description: "Draft workplace email with the right tone.",
  },
  {
    to: "/research",
    label: "Research Desk",
    short: "Research",
    icon: BookOpen,
    description: "Turn questions and source material into a structured brief.",
  },
  {
    to: "/chat",
    label: "Ask Auntie Savvy",
    short: "Ask",
    icon: MessageCircleHeart,
    description: "Plan, prepare and think through decisions together.",
  },
];
