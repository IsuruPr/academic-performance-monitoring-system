export const curriculumMap = {
  "SLIIT": {
    "BSc (Hons) in Software Engineering": [
      {
        year: 1,
        semesterName: "Year 1 Semester 1",
        modules: [
          { code: "IT1010", name: "Introduction to Programming", credits: 4, grade: "" },
          { code: "IT1020", name: "Mathematics for Computing", credits: 4, grade: "" },
          { code: "IT1030", name: "Computer Systems Requirenments", credits: 4, grade: "" },
          { code: "IT1040", name: "Communication Skills", credits: 3, grade: "" }
        ]
      },
      {
        year: 1,
        semesterName: "Year 1 Semester 2",
        modules: [
          { code: "IT1050", name: "Object Oriented Programming", credits: 4, grade: "" },
          { code: "IT1060", name: "Software Engineering Process", credits: 4, grade: "" },
          { code: "IT1080", name: "Database Management Systems", credits: 4, grade: "" },
          { code: "IT1090", name: "Information Systems & Data Management", credits: 3, grade: "" }
        ]
      },
      {
        year: 2,
        semesterName: "Year 2 Semester 1",
        modules: [
          { code: "IT2010", name: "Object Oriented Concepts", credits: 4, grade: "" },
          { code: "IT2020", name: "Software Engineering Tools", credits: 4, grade: "" },
          { code: "IT2050", name: "Computer Networks", credits: 4, grade: "" },
          { code: "IT2060", name: "Data Structures & Algorithms", credits: 4, grade: "" }
        ]
      }
    ],
    "BSc (Hons) in Information Technology": [
      {
        year: 1,
        semesterName: "Year 1 Semester 1",
        modules: [
          { code: "IT1010", name: "Introduction to Programming", credits: 4, grade: "" },
          { code: "IT1020", name: "Mathematics for Computing", credits: 4, grade: "" },
          { code: "IT1030", name: "Computer Systems", credits: 4, grade: "" },
          { code: "IT1040", name: "Communication Skills", credits: 3, grade: "" }
        ]
      },
      {
        year: 1,
        semesterName: "Year 1 Semester 2",
        modules: [
          { code: "IT1050", name: "Object Oriented Programming", credits: 4, grade: "" },
          { code: "IT1060", name: "Software Engineering", credits: 4, grade: "" },
          { code: "IT1080", name: "Database Management Systems", credits: 4, grade: "" },
          { code: "IT1090", name: "Information Systems & Data Management", credits: 3, grade: "" }
        ]
      }
    ]
  }
};

export const getCurriculum = (university, degree) => {
  if (!university || !degree) return null;
  const uniData = curriculumMap[university];
  if (!uniData) return null;
  return uniData[degree] || null;
};

export const generateBlankSemesters = (count) => {
  const semesters = [];
  let year = 1;
  let sem = 1;
  
  for (let i = 0; i < count; i++) {
    semesters.push({
      year,
      semesterName: `Year ${year} Semester ${sem}`,
      modules: [
        { code: "", name: "", credits: 3, grade: "" },
        { code: "", name: "", credits: 3, grade: "" },
        { code: "", name: "", credits: 3, grade: "" },
        { code: "", name: "", credits: 3, grade: "" }
      ]
    });
    
    if (sem === 2) {
      sem = 1;
      year++;
    } else {
      sem++;
    }
  }
  return semesters;
};
