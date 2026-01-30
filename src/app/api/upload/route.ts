import { NextRequest, NextResponse } from "next/server";

// Check if Firebase Admin credentials are configured
const hasFirebaseAdmin = 
  process.env.FIREBASE_PROJECT_ID && 
  process.env.FIREBASE_CLIENT_EMAIL && 
  process.env.FIREBASE_PRIVATE_KEY;

let adminInitialized = false;

async function initializeFirebaseAdmin() {
  if (!hasFirebaseAdmin || adminInitialized) return;
  
  try {
    const { initializeApp, getApps, cert } = await import("firebase-admin/app");
    
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    }
    adminInitialized = true;
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
  }
}

export async function POST(request: NextRequest) {
  // Check if Firebase Admin is configured
  if (!hasFirebaseAdmin) {
    return NextResponse.json(
      { error: "File upload is not configured. Please use client-side upload." },
      { status: 503 }
    );
  }

  try {
    await initializeFirebaseAdmin();
    
    const { getStorage } = await import("firebase-admin/storage");
    
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const subject = formData.get("subject") as string;
    const folder = formData.get("folder") as string;

    if (!file || !userId || !subject || !folder) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `documents/${userId}/${subject}/${folder}/${timestamp}_${safeName}`;

    const bucket = getStorage().bucket();
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    const fileRef = bucket.file(filePath);
    await fileRef.save(fileBuffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // Make file publicly accessible and get URL
    await fileRef.makePublic();
    const fileUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    return NextResponse.json({
      success: true,
      fileUrl,
      filePath,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
