import type { RawPortfolioData } from "@/types/portfolio";

export function validatePortfolioData(data: RawPortfolioData) {
  const professionalProfile =
    data?.professionalProfile ?? {};

  return {
    professionalProfile: {
      title:
        typeof professionalProfile.title === "string"
          ? professionalProfile.title
          : "",

      domain:
        typeof professionalProfile.domain === "string"
          ? professionalProfile.domain
          : "",

      specializations:
        Array.isArray(
          professionalProfile.specializations
        )
          ? professionalProfile.specializations.filter(
              (item: unknown) =>
                typeof item === "string"
            )
          : [],

      seniority:
        typeof professionalProfile.seniority === "string"
          ? professionalProfile.seniority
          : "",

      evidence:
        Array.isArray(
          professionalProfile.evidence
        )
          ? professionalProfile.evidence.filter(
              (item: unknown) =>
                typeof item === "string"
            )
          : [],
    },

    personalInfo:
      data?.personalInfo ?? {},

    summary:
      typeof data?.summary === "string"
        ? data.summary
        : "",

    skills:
      Array.isArray(data?.skills)
        ? data.skills
        : [],

    experience:
      Array.isArray(data?.experience)
        ? data.experience
        : [],

    projects:
      Array.isArray(data?.projects)
        ? data.projects
        : [],

    education:
      Array.isArray(data?.education)
        ? data.education
        : [],

    certifications:
      Array.isArray(data?.certifications)
        ? data.certifications
        : [],

    achievements:
      Array.isArray(data?.achievements)
        ? data.achievements
        : [],

    languages:
      Array.isArray(data?.languages)
        ? data.languages
        : [],

    interests:
      Array.isArray(data?.interests)
        ? data.interests
        : [],

    socialLinks:
      Array.isArray(data?.socialLinks)
        ? data.socialLinks
        : [],
  };
}
