import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
  getDoc,
  Timestamp,
} from "firebase/firestore";

export interface DocumentFile {
  id: string;
  userId: string;
  name: string;
  subject: string;
  folder: string;
  fileUrl: string;
  fileData?: string; // Base64 encoded file data
  fileType: string;
  fileSize: number;
  createdAt: Date;
  isShared: boolean;
  shareId: string | null;
}

export interface Folder {
  id: string;
  userId: string;
  name: string;
  subject: string;
  createdAt: Date;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
}

// Subject Functions
export async function createSubject(userId: string, name: string): Promise<Subject> {
  const docRef = await addDoc(collection(db, "subjects"), {
    userId,
    name,
    createdAt: Timestamp.now(),
  });
  
  return {
    id: docRef.id,
    userId,
    name,
    createdAt: new Date(),
  };
}

export async function getSubjects(userId: string): Promise<Subject[]> {
  const q = query(
    collection(db, "subjects"),
    where("userId", "==", userId)
  );
  
  const snapshot = await getDocs(q);
  const subjects = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as Subject[];
  
  // Sort client-side to avoid needing composite index
  return subjects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function deleteSubject(subjectId: string): Promise<void> {
  await deleteDoc(doc(db, "subjects", subjectId));
}

// Folder Functions
export async function createFolder(userId: string, name: string, subject: string): Promise<Folder> {
  const docRef = await addDoc(collection(db, "folders"), {
    userId,
    name,
    subject,
    createdAt: Timestamp.now(),
  });
  
  return {
    id: docRef.id,
    userId,
    name,
    subject,
    createdAt: new Date(),
  };
}

export async function getFolders(userId: string, subject: string): Promise<Folder[]> {
  const q = query(
    collection(db, "folders"),
    where("userId", "==", userId),
    where("subject", "==", subject)
  );
  
  const snapshot = await getDocs(q);
  const folders = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as Folder[];
  
  // Sort client-side to avoid needing composite index
  return folders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function deleteFolder(folderId: string): Promise<void> {
  await deleteDoc(doc(db, "folders", folderId));
}

// Document Functions

// Helper function to convert File to Base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export async function uploadDocument(
  userId: string,
  file: File,
  subject: string,
  folder: string
): Promise<DocumentFile> {
  // FREE TIER LIMITS:
  // - Firestore: 1 GB storage, 50K reads/day, 20K writes/day
  // - Limit file size to 500KB to stay within free tier
  // - Base64 encoding adds ~33% overhead
  const MAX_FILE_SIZE = 500 * 1024; // 500KB limit for free tier
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large for free tier. Maximum size is 500KB. Your file is ${formatFileSize(file.size)}. Tip: Compress your PDF or image before uploading.`);
  }

  // Convert file to Base64
  const fileData = await fileToBase64(file);
  
  // Generate share ID
  const shareId = generateShareId();
  
  // Save to Firestore (no Firebase Storage needed!)
  const docRef = await addDoc(collection(db, "documents"), {
    userId,
    name: file.name,
    subject,
    folder,
    fileData, // Store Base64 data directly in Firestore
    fileUrl: fileData, // Use Base64 as the URL (data URL)
    fileType: file.type,
    fileSize: file.size,
    createdAt: Timestamp.now(),
    isShared: false,
    shareId,
  });
  
  return {
    id: docRef.id,
    userId,
    name: file.name,
    subject,
    folder,
    fileUrl: fileData,
    fileData,
    fileType: file.type,
    fileSize: file.size,
    createdAt: new Date(),
    isShared: false,
    shareId,
  };
}

export async function getDocuments(
  userId: string,
  subject?: string,
  folder?: string
): Promise<DocumentFile[]> {
  let q;
  
  if (subject && folder) {
    q = query(
      collection(db, "documents"),
      where("userId", "==", userId),
      where("subject", "==", subject),
      where("folder", "==", folder)
    );
  } else if (subject) {
    q = query(
      collection(db, "documents"),
      where("userId", "==", userId),
      where("subject", "==", subject)
    );
  } else {
    q = query(
      collection(db, "documents"),
      where("userId", "==", userId)
    );
  }
  
  const snapshot = await getDocs(q);
  const documents = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as DocumentFile[];
  
  // Sort client-side to avoid needing composite index
  return documents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function deleteDocument(documentId: string): Promise<void> {
  // Simply delete from Firestore (no Storage cleanup needed)
  await deleteDoc(doc(db, "documents", documentId));
}

export async function toggleShareDocument(documentId: string, isShared: boolean): Promise<void> {
  const docRef = doc(db, "documents", documentId);
  await updateDoc(docRef, { isShared });
}

export async function getSharedDocument(shareId: string): Promise<DocumentFile | null> {
  const q = query(
    collection(db, "documents"),
    where("shareId", "==", shareId),
    where("isShared", "==", true)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  } as DocumentFile;
}

// Helper function to generate share ID
function generateShareId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Helper function to get file icon based on type
export function getFileIcon(fileType: string): string {
  if (fileType.includes("pdf")) return "pdf";
  if (fileType.includes("image")) return "image";
  if (fileType.includes("word") || fileType.includes("document")) return "doc";
  if (fileType.includes("sheet") || fileType.includes("excel")) return "excel";
  if (fileType.includes("presentation") || fileType.includes("powerpoint")) return "ppt";
  if (fileType.includes("text")) return "text";
  return "file";
}
