// Discipline (Course Category) static data with priority order

export const disciplines = [
  { name: "Medical Ug", priority: 1 },
  { name: "Medical Pg", priority: 2 },
  { name: "Paramedical", priority: 3 },
  { name: "Nursing", priority: 4 },
  { name: "Pharmacy", priority: 5 },
  { name: "Agriculture", priority: 6 },
  { name: "Aviation", priority: 7 },
  { name: "Law", priority: 8 },
  { name: "Management", priority: 9 },
  { name: "Computer Application", priority: 10 },
  { name: "Marine", priority: 11 },
  { name: "Arch & Design", priority: 12 },
  { name: "Masscom. And Media", priority: 13 },
  { name: "Hotel Management", priority: 14 },
  { name: "Engineering", priority: 15 },
  { name: "M.Tech", priority: 16 },
  { name: "Architecture And Planning", priority: 17 },
  { name: "Yoga And Naturopathy", priority: 18 },
  { name: "Animation, Vfx & Gaming Design", priority: 19 },
  { name: "Life Science", priority: 20 },
  { name: "Humanities & Social Sciences", priority: 21 },
];

// Helper: Get all discipline names
export const getAllDisciplineNames = () => disciplines.map(d => d.name);

// Helper: Get discipline by name
export const getDisciplineByName = (name) =>
  disciplines.find(d => d.name.toLowerCase() === name.toLowerCase());
