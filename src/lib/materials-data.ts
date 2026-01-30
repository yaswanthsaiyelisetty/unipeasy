// Types for the Materials module
export interface Unit {
  unit_number: number;
  unit_title: string;
  drive_link: string;
}

export interface Subject {
  id: string;
  title: string;
  branch: string[];
  year: string;
  units: Unit[];
}

// Branch data with icons and colors
export interface BranchInfo {
  id: string;
  name: string;
  shortName: string;
  description: string;
  color: string;
  icon: string;
}

export const branches: BranchInfo[] = [
  {
    id: "cse",
    name: "Computer Science Engineering",
    shortName: "CSE",
    description: "Core computing and software development",
    color: "bg-blue-500",
    icon: "Monitor",
  },
  {
    id: "csm",
    name: "Computer Science (AI & ML)",
    shortName: "CSM",
    description: "Artificial Intelligence & Machine Learning",
    color: "bg-purple-500",
    icon: "Brain",
  },
  {
    id: "csd",
    name: "Computer Science (Data Science)",
    shortName: "CSD",
    description: "Data Science & Analytics",
    color: "bg-cyan-500",
    icon: "Database",
  },
  {
    id: "it",
    name: "Information Technology",
    shortName: "IT",
    description: "Information systems and technology",
    color: "bg-green-500",
    icon: "Globe",
  },
  {
    id: "ece",
    name: "Electronics & Communication",
    shortName: "ECE",
    description: "Electronics, signals and communications",
    color: "bg-orange-500",
    icon: "Radio",
  },
  {
    id: "eee",
    name: "Electrical & Electronics",
    shortName: "EEE",
    description: "Power systems and electrical engineering",
    color: "bg-yellow-500",
    icon: "Zap",
  },
  {
    id: "civil",
    name: "Civil Engineering",
    shortName: "Civil",
    description: "Construction and infrastructure",
    color: "bg-amber-600",
    icon: "Building2",
  },
  {
    id: "mech",
    name: "Mechanical Engineering",
    shortName: "Mech",
    description: "Machines and mechanical systems",
    color: "bg-red-500",
    icon: "Cog",
  },
];

// Year data
export interface YearInfo {
  id: string;
  name: string;
  shortName: string;
  semester: string;
}

export const years: YearInfo[] = [
  {
    id: "1st-year",
    name: "1st Year",
    shortName: "1st",
    semester: "Semester 1 & 2",
  },
  {
    id: "2nd-year",
    name: "2nd Year",
    shortName: "2nd",
    semester: "Semester 3 & 4",
  },
  {
    id: "3rd-year",
    name: "3rd Year",
    shortName: "3rd",
    semester: "Semester 5 & 6",
  },
  {
    id: "4th-year",
    name: "4th Year",
    shortName: "4th",
    semester: "Semester 7 & 8",
  },
];

// Helper function to get branch info by ID
export function getBranchById(branchId: string): BranchInfo | undefined {
  return branches.find((b) => b.id === branchId.toLowerCase());
}

// Helper function to get year info by ID
export function getYearById(yearId: string): YearInfo | undefined {
  return years.find((y) => y.id === yearId.toLowerCase());
}

// Format branch ID to display name
export function formatBranchName(branchId: string): string {
  const branch = getBranchById(branchId);
  return branch ? branch.shortName : branchId.toUpperCase();
}

// Format year ID to display name
export function formatYearName(yearId: string): string {
  const year = getYearById(yearId);
  return year ? year.name : yearId;
}
