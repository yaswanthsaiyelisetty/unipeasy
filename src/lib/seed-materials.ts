// Utility script to seed Firestore with sample subject data
// Run this from browser console or create an admin page to initialize data

import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface SeedUnit {
  unit_number: number;
  unit_title: string;
  drive_link: string;
}

export interface SeedSubject {
  title: string;
  branch: string[];
  year: string;
  units: SeedUnit[];
}

// Sample data structure - replace drive_link with actual Google Drive links
export const sampleSubjects: Record<string, SeedSubject> = {
  "digital-electronics": {
    title: "Digital Electronics",
    branch: ["ECE", "EEE", "CSE"],
    year: "2nd-year",
    units: [
      {
        unit_number: 1,
        unit_title: "Number Systems and Boolean Algebra",
        drive_link: "https://drive.google.com/file/d/YOUR_FILE_ID_1/view",
      },
      {
        unit_number: 2,
        unit_title: "Logic Gates and Combinational Circuits",
        drive_link: "https://drive.google.com/file/d/YOUR_FILE_ID_2/view",
      },
      {
        unit_number: 3,
        unit_title: "Sequential Logic Circuits",
        drive_link: "https://drive.google.com/file/d/YOUR_FILE_ID_3/view",
      },
      {
        unit_number: 4,
        unit_title: "Memory and Programmable Logic Devices",
        drive_link: "https://drive.google.com/file/d/YOUR_FILE_ID_4/view",
      },
      {
        unit_number: 5,
        unit_title: "A/D and D/A Converters",
        drive_link: "https://drive.google.com/file/d/YOUR_FILE_ID_5/view",
      },
    ],
  },
  "data-structures": {
    title: "Data Structures",
    branch: ["CSE", "CSM", "CSD", "IT"],
    year: "2nd-year",
    units: [
      {
        unit_number: 1,
        unit_title: "Arrays and Linked Lists",
        drive_link: "https://drive.google.com/file/d/YOUR_FILE_ID_1/view",
      },
      {
        unit_number: 2,
        unit_title: "Stacks and Queues",
        drive_link: "https://drive.google.com/file/d/YOUR_FILE_ID_2/view",
      },
      {
        unit_number: 3,
        unit_title: "Trees and Binary Search Trees",
        drive_link: "https://drive.google.com/file/d/YOUR_FILE_ID_3/view",
      },
      {
        unit_number: 4,
        unit_title: "Graphs and Graph Algorithms",
        drive_link: "https://drive.google.com/file/d/YOUR_FILE_ID_4/view",
      },
      {
        unit_number: 5,
        unit_title: "Sorting and Searching Algorithms",
        drive_link: "https://drive.google.com/file/d/YOUR_FILE_ID_5/view",
      },
    ],
  },
  "engineering-mathematics-1": {
    title: "Engineering Mathematics - I",
    branch: ["CSE", "CSM", "CSD", "IT", "ECE", "EEE", "CIVIL", "MECH"],
    year: "1st-year",
    units: [
      {
        unit_number: 1,
        unit_title: "Matrices and Linear Algebra",
        drive_link: "https://drive.google.com/file/d/YOUR_FILE_ID_1/view",
      },
      {
        unit_number: 2,
        unit_title: "Differential Calculus",
        drive_link: "https://drive.google.com/file/d/YOUR_FILE_ID_2/view",
      },
      {
        unit_number: 3,
        unit_title: "Integral Calculus",
        drive_link: "https://drive.google.com/file/d/YOUR_FILE_ID_3/view",
      },
      {
        unit_number: 4,
        unit_title: "Differential Equations",
        drive_link: "https://drive.google.com/file/d/YOUR_FILE_ID_4/view",
      },
      {
        unit_number: 5,
        unit_title: "Vector Calculus",
        drive_link: "https://drive.google.com/file/d/YOUR_FILE_ID_5/view",
      },
    ],
  },
};

// Function to seed the database
export async function seedSubjectsCollection() {
  try {
    const subjectsRef = collection(db, "subjects");

    for (const [id, subject] of Object.entries(sampleSubjects)) {
      const docRef = doc(subjectsRef, id);
      await setDoc(docRef, subject);
      console.log(`Added subject: ${subject.title}`);
    }

    console.log("✅ Successfully seeded subjects collection!");
    return true;
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    return false;
  }
}

// Export for use in a utility page or script
export default seedSubjectsCollection;
