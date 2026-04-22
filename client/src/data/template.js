export const gradePoints = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  E: 0.0,
};

export const gradeOptions = Object.keys(gradePoints);

export const yearWeights = {
  1: 0,
  2: 20,
  3: 30,
  4: 50,
};

const template = [
  {
    key: "y1s1",
    title: "Year 1 - Semester 1",
    year: 1,
    modules: [
      { code: "IT1120", name: "Introduction to Programming", credits: 4, grade: "" },
      { code: "IE1030", name: "Data Communication Networks", credits: 4, grade: "" },
      { code: "IT1130", name: "Mathematics for Computing", credits: 4, grade: "" },
      { code: "IT1140", name: "Fundamentals of Computing", credits: 4, grade: "" },
    ],
  },
  {
    key: "y1s2",
    title: "Year 1 - Semester 2",
    year: 1,
    modules: [
      { code: "IT1160", name: "Discrete Mathematics", credits: 4, grade: "" },
      { code: "IT1170", name: "Data Structures and Algorithms", credits: 4, grade: "" },
      { code: "SE1010", name: "Software Engineering", credits: 4, grade: "" },
      { code: "IT1150", name: "Technical Writing", credits: 4, grade: "" },
    ],
  },
  {
    key: "y2s1",
    title: "Year 2 - Semester 1",
    year: 2,
    modules: [
      { code: "IT2120", name: "Probability and Statistics", credits: 4, grade: "" },
      { code: "SE2010", name: "Object Oriented Programming", credits: 4, grade: "" },
      { code: "IT2130", name: "Operating Systems & System Administration", credits: 4, grade: "" },
      { code: "IT2140", name: "Database Design and Development", credits: 4, grade: "" },
    ],
  },
  {
    key: "y2s2",
    title: "Year 2 - Semester 2",
    year: 2,
    modules: [
      { code: "IT2011", name: "Artificial Intelligence & Machine Learning", credits: 4, grade: "" },
      { code: "IT2150", name: "IT Project", credits: 4, grade: "" },
      { code: "SE2020", name: "Web and Mobile Technologies", credits: 4, grade: "" },
      { code: "IT2160", name: "Professional Skills", credits: 4, grade: "" },
    ],
  },
  {
    key: "y3s1",
    title: "Year 3 - Semester 1",
    year: 3,
    modules: [
      { code: "IT3120", name: "Industry Economics & Management", credits: 4, grade: "" },
      { code: "IT3130", name: "Application Development", credits: 4, grade: "" },
      { code: "IT3140", name: "Database Systems", credits: 4, grade: "" },
      { code: "IT3150", name: "IT Process and Infrastructure Management", credits: 4, grade: "" },
    ],
  },
  {
    key: "y3s2",
    title: "Year 3 - Semester 2",
    year: 3,
    modules: [
      { code: "IT3190", name: "Industry Training", credits: 0, grade: "" },
      { code: "IT3180", name: "Cloud Technologies", credits: 4, grade: "" },
      { code: "IT3200", name: "Data Analytics", credits: 4, grade: "" },
      { code: "IT3160", name: "Research Methods", credits: 4, grade: "" },
    ],
  },
  {
    key: "y4s1",
    title: "Year 4 - Semester 1",
    year: 4,
    modules: [
      { code: "IT4200", name: "Research Project - I", credits: 4, grade: "" },
      { code: "IT4210", name: "Information Security", credits: 4, grade: "" },
      { code: "IT4150", name: "Intelligent Systems Development", credits: 4, grade: "" },
      { code: "IT4180", name: "IT Policy Management and Governance", credits: 4, grade: "" },
      { code: "IT4160", name: "Software Quality Management", credits: 4, grade: "" },
    ],
  },
  {
    key: "y4s2",
    title: "Year 4 - Semester 2",
    year: 4,
    modules: [
      { code: "", name: "", credits: 0, grade: "" },
      { code: "", name: "", credits: 0, grade: "" },
    ],
  },
];

export const buildDefaultSemesters = () =>
  template.map((semester) => ({
    ...semester,
    semesterCredits: 0,
    semesterGpa: 0,
    modules: semester.modules.map((module) => ({ ...module })),
  }));
