const mockTargets = [
    { studentId: "S123", semesterId: "Y2S1", targetGpa: 3.3 }
];

const mockEnrollments = [
    { studentId: "S123", semesterId: "Y2S1", subjectId: "DSA", subjectName: "Data Structures", credits: 4, difficulty: 5, caMarks: 62, caWeight: 0.4, finalWeight: 0.6 },
    { studentId: "S123", semesterId: "Y2S1", subjectId: "OOP", subjectName: "OOP", credits: 3, difficulty: 4, caMarks: 70, caWeight: 0.4, finalWeight: 0.6 },
    { studentId: "S123", semesterId: "Y2S1", subjectId: "DB", subjectName: "DBMS", credits: 3, difficulty: 3, caMarks: 68, caWeight: 0.4, finalWeight: 0.6 },
    { studentId: "S123", semesterId: "Y2S1", subjectId: "WD", subjectName: "Web Dev", credits: 2, difficulty: 2, caMarks: 78, caWeight: 0.4, finalWeight: 0.6 }
];

module.exports = { mockTargets, mockEnrollments };