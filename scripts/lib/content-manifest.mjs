// scripts/lib/content-manifest.mjs
// Per page: required level-2 sections (camelCase keys) and the leaf requirements the
// pages depend on, so a careless markdown edit fails loudly at content:sync.
// Section flags: requireBody, requireImage, requireQuote, minLinks, minItems, fields[], minCards.
// Per-card flags (applied to every child): cardRequireBody, cardRequireImage, cardRequireQuote,
//   cardMinLinks, cardFields[].
export const MANIFEST = {
  home: { sections: [
    { key: 'hero', requireBody: true, fields: ['eyebrow', 'heading'], requireImage: true, minLinks: 2 },
    { key: 'professionalExpertise', minCards: 3, cardRequireBody: true },
    { key: 'personalPassions', minCards: 2, cardFields: ['subtitle'], cardMinLinks: 1, cardRequireBody: true },
  ] },
  portfolio: { sections: [
    { key: 'intro', requireBody: true },
    { key: 'projects', minCards: 9 },
  ] },
  portfolioEjPrisons: { sections: [
    { key: 'header', requireBody: true, fields: ['eyebrow', 'heading'], minLinks: 2 },
    { key: 'environmentalRiskIndicators' },
    { key: 'projectOverview', requireBody: true },
    { key: 'projectTeamAndMyContribution' },
    { key: 'exploreTheResearch', requireBody: true, minLinks: 1 },
  ] },
  interests: { sections: [
    { key: 'interests', minCards: 6, cardRequireImage: true, cardRequireBody: true },
    { key: 'gis', requireBody: true },
  ] },
  resume: { sections: [
    { key: 'header', requireBody: true, fields: ['heading', 'title', 'contact'], minLinks: 1 },
    { key: 'professionalExperience', minCards: 3, cardFields: ['company', 'period'] },
    { key: 'education', minCards: 1, cardFields: ['degree', 'minor', 'coursework-heading'], cardRequireBody: true },
    { key: 'professionalSkills', minItems: 1 },
    { key: 'technicalSkills', minItems: 1 },
    { key: 'additionalAchievements', requireBody: true },
  ] },
  site: { sections: [
    { key: 'footer', requireBody: true },
    { key: 'seo', fields: ['title', 'description'] },
  ] },
};
