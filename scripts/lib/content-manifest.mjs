// scripts/lib/content-manifest.mjs
// Per page: required level-2 sections (camelCase keys), required fields, min card counts.
export const MANIFEST = {
  home: { sections: [
    { key: 'hero', requireBody: true, fields: ['eyebrow', 'heading'] },
    { key: 'professionalExpertise', minCards: 3 },
    { key: 'personalPassions', minCards: 2 },
  ] },
  portfolio: { sections: [
    { key: 'intro', requireBody: true },
    { key: 'projects', minCards: 9 },
  ] },
  portfolioEjPrisons: { sections: [
    { key: 'header', requireBody: true, fields: ['eyebrow', 'heading'] },
    { key: 'environmentalRiskIndicators' },
    { key: 'projectOverview', requireBody: true },
    { key: 'projectTeamAndMyContribution' },
    { key: 'exploreTheResearch', requireBody: true },
  ] },
  interests: { sections: [
    { key: 'interests', minCards: 6 },
    { key: 'gis', requireBody: true },
  ] },
  resume: { sections: [
    { key: 'header', requireBody: true, fields: ['heading', 'title', 'contact'] },
    { key: 'professionalExperience', minCards: 3 },
    { key: 'education', minCards: 1 },
    { key: 'professionalSkills' },
    { key: 'technicalSkills' },
    { key: 'additionalAchievements', requireBody: true },
  ] },
  site: { sections: [
    { key: 'footer', requireBody: true },
    { key: 'seo', fields: ['title', 'description'] },
  ] },
};
