
export interface Project {
  id: string;
  title: string;
  impact: string;
  tech: string[];
  image: string;
  link?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 0-100
  category: 'Strategy' | 'AI Development' | 'Growth' | 'Operations' | 'Other';
  description?: string;
}

export interface Stat {
  id: string;
  label: string;
  value: string;
  sub: string;
  icon: string; // Lucide icon name
  color: string;
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  github?: string;
  email?: string;
  website?: string;
  whatsapp?: string;
  appLink?: string;
}

export interface RoadmapItem {
  id: string;
  year: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface ProfileData {
  name: string;
  title: string;
  bio: string;
  skills: Skill[];
  projects: Project[];
  profileImage: string;
  imagePosition?: { x: number, y: number };
  galleryImages: string[];
  stats: Stat[];
  social: SocialLinks;
  aiReadinessScore: number;
  roadmap: RoadmapItem[];
}

export enum AppMode {
  VIEW = 'view',
  EDIT = 'edit'
}
