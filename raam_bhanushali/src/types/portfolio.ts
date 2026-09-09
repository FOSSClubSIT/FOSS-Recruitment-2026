export interface SocialLink {
  platform: string;
  url: string;
}

export interface Skill {
  name: string;
  category?: string;
}

export interface Experience {
  company: string;
  role: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description: string[] | unknown[];
}

export interface Project {
  title: string;
  description: string | unknown[];
  technologies: string[] | unknown[];
  githubUrl?: string;
  liveUrl?: string;
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startYear?: string;
  endYear?: string;
  grade?: string;
}

export interface Certification {
  name: string;
  issuer?: string;
  issueDate?: string;
  credentialUrl?: string;
}

export interface Achievement {
  title: string;
  description?: string;
  date?: string;
}

export interface PersonalInfo {
  fullName: string;
  headline?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
}

export interface PortfolioData {

  professionalProfile: ProfessionalProfile;
  personalInfo: PersonalInfo;

  summary: string;

  skills: Skill[];

  experience: Experience[];

  projects: Project[];

  education: Education[];

  certifications: Certification[];

  achievements: Achievement[];

  languages: string[];

  interests: string[];

  socialLinks: SocialLink[];

  
}

export type ProfessionalProfile = {
  title: string;
  domain: string;
  specializations: string[];
  seniority: string;
  evidence: string[];
};

export type RawRecord = Record<string, unknown>;
export interface RawPortfolioData {
  [key: string]: unknown;
  professionalProfile?: RawRecord;
  personalInfo?: RawRecord;
  personal?: RawRecord;
  skills?: unknown;
  projects?: unknown;
  experience?: unknown;
  summary?: unknown;
  education?: unknown;
  certifications?: unknown;
  achievements?: unknown;
  languages?: unknown;
  interests?: unknown;
  socialLinks?: unknown;
}
