export const C = {
  navy:    "#1E3A5F",
  blue:    "#2563EB",
  sky:     "#60A5FA",
  slate:   "#475569",
  mist:    "#EFF6FF",
  white:   "#FFFFFF",
  gray:    "#F1F5F9",
  border:  "#CBD5E1",
  success: "#10B981",
  warn:    "#F59E0B",
  text:    "#1E293B",
  sub:     "#64748B",
};

export const GRADES = ["A+","A","A-","B+","B","B-","C+","C","C-","D","F"];

export const GRADE_POINTS = {
  "A+":4.0, "A":4.0, "A-":3.7,
  "B+":3.3, "B":3.0, "B-":2.7,
  "C+":2.3, "C":2.0, "C-":1.7,
  "D":1.0,  "F":0.0
};

export const SEMESTERS = [
  "Semester 1","Semester 2","Semester 3","Semester 4",
  "Semester 5","Semester 6","Semester 7","Semester 8"
];

export const UNIVERSITIES = [
  "University of Colombo",
  "University of Moratuwa",
  "University of Kelaniya",
  "SLIIT",
  "NSBM",
  "Informatics Institute of Technology",
  "Other"
];

export const GPA_TREND = [
  { sem:"Sem 1", gpa:3.2 },
  { sem:"Sem 2", gpa:3.5 },
  { sem:"Sem 3", gpa:3.4 },
  { sem:"Sem 4", gpa:3.7 },
  { sem:"Sem 5", gpa:3.8 },
];

export const DONUT_DATA = [
  { name:"Achieved GPA", value:3.8 },
  { name:"Remaining",    value:0.2 },
];

export const DONUT_COLORS = ["#2563EB", "#E2E8F0"];

export function classifyGPA(gpa) {
  if (gpa >= 3.7) return { label:"First Class",   color:"#10B981", icon:"🏆", bg:"#ECFDF5" };
  if (gpa >= 3.3) return { label:"Upper Second",  color:"#2563EB", icon:"🥈", bg:"#EFF6FF" };
  if (gpa >= 3.0) return { label:"Lower Second",  color:"#F59E0B", icon:"🥉", bg:"#FFFBEB" };
  return               { label:"Pass",            color:"#475569", icon:"📘", bg:"#F8FAFC" };
}

export const inputCls = `w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-slate-700 placeholder-slate-400 transition`;
export const labelCls = `block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide`;
export const btnPrimary = `flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition text-sm shadow`;
export const btnGhost   = `flex items-center justify-center gap-2 w-full border border-blue-200 hover:bg-blue-50 text-blue-600 font-semibold py-2.5 rounded-xl transition text-sm`;