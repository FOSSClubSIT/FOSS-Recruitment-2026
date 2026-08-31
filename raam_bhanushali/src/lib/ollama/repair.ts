import type {
  PortfolioData,
  RawPortfolioData,
  RawRecord,
} from "@/types/portfolio";

const isRecord = (v: unknown): v is RawRecord =>
  typeof v === "object" &&
  v !== null &&
  !Array.isArray(v);

const str = (v: unknown): string =>
  typeof v === "string" ? v.trim() : "";

const stringArray = (v: unknown): string[] =>
  Array.isArray(v)
    ? v.filter(
        (item): item is string =>
          typeof item === "string" && item.trim() !== ""
      )
    : [];

export function repairPortfolioData(
  data: RawPortfolioData
): PortfolioData {
  const d = data ?? {};

  const p = isRecord(d.professionalProfile)
    ? d.professionalProfile
    : {};

  const i = isRecord(d.personalInfo)
    ? d.personalInfo
    : {};

  const old = isRecord(d.personal)
    ? d.personal
    : {};

  // --------------------------------------------------
  // Personal information
  // --------------------------------------------------

  const personalInfo = {
    fullName:
      str(i.fullName) ||
      str(i.full_name) ||
      str(i.name) ||
      str(i.candidateName) ||
      str(old.fullName) ||
      str(old.full_name) ||
      str(old.name) ||
      str(old.candidateName),

    email:
      str(i.email) ||
      str(old.email),

    phone:
      str(i.phone) ||
      str(old.phone),

    location:
      str(i.location) ||
      str(i.address) ||
      str(old.location) ||
      str(old.address),

    website:
      str(i.website) ||
      str(old.website),

    linkedin:
      str(i.linkedin) ||
      str(i.linkedIn) ||
      str(old.linkedin) ||
      str(old.linkedIn),

    github:
      str(i.github) ||
      str(old.github),
  };

  // --------------------------------------------------
  // Social links
  // --------------------------------------------------

  const socialLinks: PortfolioData["socialLinks"] = [];

  const add = (
    platform: string,
    url: string
  ) => {
    if (!url) return;

    socialLinks.push({
      platform,
      url:
        url.startsWith("http://") ||
        url.startsWith("https://")
          ? url
          : `https://${url}`,
    });
  };

  add(
    "LinkedIn",
    personalInfo.linkedin
  );

  add(
    "GitHub",
    personalInfo.github
  );

  add(
    "Website",
    personalInfo.website
  );

  // --------------------------------------------------
  // Professional profile
  // --------------------------------------------------

  const professionalProfile = {
    title: str(p.title),

    domain: str(p.domain),

    specializations:
      stringArray(p.specializations),

    seniority: str(p.seniority),

    evidence:
      stringArray(p.evidence),
  };

  // --------------------------------------------------
  // Skills
  // --------------------------------------------------

  const skills = normalizeSkills(
    d.skills
  );

  // --------------------------------------------------
  // Experience
  // --------------------------------------------------

  const experience =
    Array.isArray(d.experience)
      ? d.experience
          .map((value) => {
            const x = isRecord(value)
              ? value
              : {};

            return {
              company: str(x.company),

              role:
                str(x.role) ||
                str(x.title),

              location:
                str(x.location),

              startDate:
                str(x.startDate) ||
                str(x.startYear),

              endDate:
                str(x.endDate) ||
                str(x.endYear),

              current:
                x.current === true,

              description:
                normalizeTextArray(
                  x.description
                ),
            };
          })
          .filter(
            (item) =>
              item.company ||
              item.role ||
              item.description.length > 0
          )
      : [];

  // --------------------------------------------------
  // Projects
  // --------------------------------------------------

  const projects =
    Array.isArray(d.projects)
      ? d.projects
          .map((value) => {
            const x = isRecord(value)
              ? value
              : {};

            return {
              title:
                str(x.title) ||
                str(x.name),

              description:
                normalizeTextArray(
                  x.description
                ),

              technologies:
                normalizeStringArray(
                  x.technologies
                ),

              githubUrl:
                str(x.githubUrl) ||
                str(x.github),

              liveUrl:
                str(x.liveUrl) ||
                str(x.url),
            };
          })
          .filter(
            (item) =>
              item.title ||
              item.description.length > 0
          )
      : [];

  // --------------------------------------------------
  // Education
  // --------------------------------------------------

  const education =
    Array.isArray(d.education)
      ? d.education
          .map((value) => {
            const x = isRecord(value)
              ? value
              : {};

            return {
              institution:
                str(x.institution) ||
                str(x.school) ||
                str(x.university),

              degree:
                str(x.degree) ||
                str(x.qualification),

              fieldOfStudy:
                str(x.fieldOfStudy) ||
                str(x.field) ||
                str(x.specialization),

              startYear:
                str(x.startYear) ||
                str(x.startDate),

              endYear:
                str(x.endYear) ||
                str(x.endDate),

              grade:
                str(x.grade) ||
                str(x.gpa) ||
                str(x.cgpa),
            };
          })
          .filter(
            (item) =>
              item.institution ||
              item.degree ||
              item.fieldOfStudy
          )
      : [];

  // --------------------------------------------------
  // Certifications
  // --------------------------------------------------

  const certifications =
    Array.isArray(d.certifications)
      ? d.certifications
          .map((value) => {
            if (typeof value === "string") {
              return {
                name: value,
              };
            }

            const x = isRecord(value)
              ? value
              : {};

            return {
              name:
                str(x.name) ||
                str(x.title) ||
                str(x.certification),

              issuer:
                str(x.issuer) ||
                str(x.organization),

              issueDate:
                str(x.issueDate) ||
                str(x.date),

              credentialUrl:
                str(x.credentialUrl) ||
                str(x.url),
            };
          })
          .filter(
            (item) => item.name
          )
      : [];

  // --------------------------------------------------
  // Achievements
  // --------------------------------------------------

  const achievements =
    Array.isArray(d.achievements)
      ? d.achievements
          .map((value) => {
            if (typeof value === "string") {
              return {
                title: value,
              };
            }

            const x = isRecord(value)
              ? value
              : {};

            return {
              title:
                str(x.title) ||
                str(x.name) ||
                str(x.achievement),

              description:
                str(x.description),

              date:
                str(x.date),
            };
          })
          .filter(
            (item) => item.title
          )
      : [];

  // --------------------------------------------------
  // Return normalized portfolio
  // --------------------------------------------------

  return {
    professionalProfile,

    personalInfo,

    summary:
      str(d.summary),

    skills,

    experience:
      experience as PortfolioData["experience"],

    projects:
      projects as PortfolioData["projects"],

    education:
      education as PortfolioData["education"],

    certifications:
      certifications as PortfolioData["certifications"],

    achievements:
      achievements as PortfolioData["achievements"],

    languages:
      stringArray(d.languages),

    interests:
      stringArray(d.interests),

    socialLinks,
  };
}

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function normalizeTextArray(
  value: unknown
): string[] {
  if (Array.isArray(value)) {
    return value
      .filter(
        (item): item is string =>
          typeof item === "string"
      )
      .map((item) => item.trim())
      .filter(Boolean);
  }

  const valueString = str(value);

  return valueString
    ? [valueString]
    : [];
}

function normalizeStringArray(
  value: unknown
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      if (isRecord(item)) {
        return str(item.name);
      }

      return "";
    })
    .filter(Boolean);
}

function normalizeSkills(
  value: unknown
): PortfolioData["skills"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((value) => {
      if (typeof value === "string") {
        return {
          name: value.trim(),
        };
      }

      const x = isRecord(value)
        ? value
        : {};

      return {
        name: str(x.name),
        category:
          str(x.category) ||
          undefined,
      };
    })
    .filter(
      (skill) => skill.name
    );
}