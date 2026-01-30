// Analytics types and helper functions
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  increment,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";

// Types
export interface SkillProgress {
  skillSlug: string;
  skillTitle: string;
  branch: string;
  completedLevels: number[];
  totalLevels: number;
  lastLevelCompleted: number;
  lastActiveDate: string;
  startedDate: string;
}

export interface UserAnalytics {
  userId: string;
  email: string;
  displayName: string;
  totalTopicsLearned: number;
  totalMaterialsAccessed: number;
  totalStudyMinutes: number;
  totalQuizzesTaken: number;
  averageQuizScore: number;
  totalSkillLevelsCompleted: number;
  streak: number;
  lastActiveDate: string;
  joinedDate: string;
  topicsHistory: TopicEntry[];
  materialsHistory: MaterialEntry[];
  skillsProgress: Record<string, SkillProgress>;
}

export interface TopicEntry {
  topic: string;
  timestamp: string;
  category?: string;
}

export interface MaterialEntry {
  subjectId: string;
  subjectTitle: string;
  unitNumber: number;
  unitTitle: string;
  branch: string;
  year: string;
  timestamp: string;
}

export interface PlatformAnalytics {
  totalUsers: number;
  totalTopicsSearched: number;
  totalMaterialsAccessed: number;
  activeUsersToday: number;
  activeUsersWeek: number;
  popularSubjects: { subjectId: string; title: string; count: number }[];
  popularTopics: { topic: string; count: number }[];
  usersByBranch: { branch: string; count: number }[];
}

// Initialize user analytics document
export async function initializeUserAnalytics(
  userId: string,
  email: string,
  displayName: string
) {
  const userAnalyticsRef = doc(db, "userAnalytics", userId);
  const existing = await getDoc(userAnalyticsRef);

  if (!existing.exists()) {
    const newAnalytics: Omit<UserAnalytics, "topicsHistory" | "materialsHistory" | "skillsProgress"> = {
      userId,
      email,
      displayName,
      totalTopicsLearned: 0,
      totalMaterialsAccessed: 0,
      totalStudyMinutes: 0,
      totalQuizzesTaken: 0,
      averageQuizScore: 0,
      totalSkillLevelsCompleted: 0,
      streak: 0,
      lastActiveDate: new Date().toISOString().split("T")[0],
      joinedDate: new Date().toISOString().split("T")[0],
    };

    await setDoc(userAnalyticsRef, {
      ...newAnalytics,
      topicsHistory: [],
      materialsHistory: [],
      skillsProgress: {},
    });
  }

  return userAnalyticsRef;
}

// Track topic search/learn
export async function trackTopicLearned(
  userId: string,
  topic: string,
  category?: string
) {
  try {
    const userAnalyticsRef = doc(db, "userAnalytics", userId);
    const today = new Date().toISOString().split("T")[0];

    const entry: TopicEntry = {
      topic,
      timestamp: new Date().toISOString(),
      category,
    };

    // Update user analytics
    const userDoc = await getDoc(userAnalyticsRef);
    if (userDoc.exists()) {
      const data = userDoc.data();
      const history: TopicEntry[] = data.topicsHistory || [];
      
      // Check if this topic was already searched recently (avoid duplicates)
      const recentSameTopic = history.length > 0 && 
        history[0].topic.toLowerCase() === topic.toLowerCase();
      
      if (recentSameTopic) {
        // Just update the timestamp of the most recent entry
        history[0].timestamp = new Date().toISOString();
        await updateDoc(userAnalyticsRef, {
          lastActiveDate: today,
          topicsHistory: history,
        });
      } else {
        // Add new entry and keep last 50
        const updatedHistory = [entry, ...history].slice(0, 50);

        await updateDoc(userAnalyticsRef, {
          totalTopicsLearned: increment(1),
          lastActiveDate: today,
          topicsHistory: updatedHistory,
        });
        
        // Update platform analytics only for new topics
        await updatePlatformTopicCount(topic);
      }
    }
  } catch (error) {
    console.error("Error tracking topic:", error);
  }
}

// Track material access
export async function trackMaterialAccessed(
  userId: string,
  material: Omit<MaterialEntry, "timestamp">
) {
  try {
    const userAnalyticsRef = doc(db, "userAnalytics", userId);
    const today = new Date().toISOString().split("T")[0];

    const entry: MaterialEntry = {
      ...material,
      timestamp: new Date().toISOString(),
    };

    // Update user analytics
    const userDoc = await getDoc(userAnalyticsRef);
    if (userDoc.exists()) {
      const data = userDoc.data();
      const history = data.materialsHistory || [];
      
      // Keep last 50 entries
      const updatedHistory = [entry, ...history].slice(0, 50);

      await updateDoc(userAnalyticsRef, {
        totalMaterialsAccessed: increment(1),
        lastActiveDate: today,
        materialsHistory: updatedHistory,
      });
    }

    // Update platform analytics
    await updatePlatformMaterialCount(material.subjectId, material.subjectTitle);
  } catch (error) {
    console.error("Error tracking material:", error);
  }
}

// Update platform topic count
async function updatePlatformTopicCount(topic: string) {
  try {
    const topicRef = doc(db, "platformAnalytics", "topicCounts");
    const topicDoc = await getDoc(topicRef);

    if (topicDoc.exists()) {
      const data = topicDoc.data();
      const topics = data.topics || {};
      topics[topic] = (topics[topic] || 0) + 1;
      await updateDoc(topicRef, { topics, totalSearches: increment(1) });
    } else {
      await setDoc(topicRef, {
        topics: { [topic]: 1 },
        totalSearches: 1,
      });
    }
  } catch (error) {
    console.error("Error updating platform topic count:", error);
  }
}

// Update platform material count
async function updatePlatformMaterialCount(subjectId: string, title: string) {
  try {
    const materialRef = doc(db, "platformAnalytics", "materialCounts");
    const materialDoc = await getDoc(materialRef);

    if (materialDoc.exists()) {
      const data = materialDoc.data();
      const materials = data.materials || {};
      materials[subjectId] = {
        title,
        count: (materials[subjectId]?.count || 0) + 1,
      };
      await updateDoc(materialRef, { materials, totalAccesses: increment(1) });
    } else {
      await setDoc(materialRef, {
        materials: { [subjectId]: { title, count: 1 } },
        totalAccesses: 1,
      });
    }
  } catch (error) {
    console.error("Error updating platform material count:", error);
  }
}

// Get user analytics
export async function getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
  try {
    const userAnalyticsRef = doc(db, "userAnalytics", userId);
    const userDoc = await getDoc(userAnalyticsRef);

    if (userDoc.exists()) {
      return userDoc.data() as UserAnalytics;
    }
    return null;
  } catch (error) {
    console.error("Error getting user analytics:", error);
    return null;
  }
}

// Track skill level completion
export async function trackSkillLevelCompleted(
  userId: string,
  skillSlug: string,
  skillTitle: string,
  branch: string,
  level: number,
  totalLevels: number = 30
) {
  try {
    const userAnalyticsRef = doc(db, "userAnalytics", userId);
    const today = new Date().toISOString().split("T")[0];

    const userDoc = await getDoc(userAnalyticsRef);
    if (userDoc.exists()) {
      const data = userDoc.data();
      const skillsProgress = data.skillsProgress || {};
      
      // Get existing progress or create new
      const existingProgress = skillsProgress[skillSlug] || {
        skillSlug,
        skillTitle,
        branch,
        completedLevels: [],
        totalLevels,
        lastLevelCompleted: 0,
        lastActiveDate: today,
        startedDate: today,
      };

      // Add level if not already completed
      if (!existingProgress.completedLevels.includes(level)) {
        existingProgress.completedLevels.push(level);
        existingProgress.completedLevels.sort((a: number, b: number) => a - b);
      }
      
      existingProgress.lastLevelCompleted = level;
      existingProgress.lastActiveDate = today;

      skillsProgress[skillSlug] = existingProgress;

      await updateDoc(userAnalyticsRef, {
        skillsProgress,
        totalSkillLevelsCompleted: increment(1),
        lastActiveDate: today,
      });
    }

    // Update platform skill analytics
    await updatePlatformSkillCount(skillSlug, skillTitle, branch);
  } catch (error) {
    console.error("Error tracking skill level:", error);
  }
}

// Update platform skill count
async function updatePlatformSkillCount(skillSlug: string, skillTitle: string, branch: string) {
  try {
    const skillRef = doc(db, "platformAnalytics", "skillCounts");
    const skillDoc = await getDoc(skillRef);

    if (skillDoc.exists()) {
      const data = skillDoc.data();
      const skills = data.skills || {};
      skills[skillSlug] = {
        title: skillTitle,
        branch,
        completions: (skills[skillSlug]?.completions || 0) + 1,
      };
      await updateDoc(skillRef, { skills, totalCompletions: increment(1) });
    } else {
      await setDoc(skillRef, {
        skills: { [skillSlug]: { title: skillTitle, branch, completions: 1 } },
        totalCompletions: 1,
      });
    }
  } catch (error) {
    console.error("Error updating platform skill count:", error);
  }
}

// Get user's skill progress for a specific skill
export async function getUserSkillProgress(
  userId: string,
  skillSlug: string
): Promise<SkillProgress | null> {
  try {
    const userAnalytics = await getUserAnalytics(userId);
    if (userAnalytics?.skillsProgress?.[skillSlug]) {
      return userAnalytics.skillsProgress[skillSlug];
    }
    return null;
  } catch (error) {
    console.error("Error getting user skill progress:", error);
    return null;
  }
}

// Get all skills progress for a user
export async function getAllUserSkillsProgress(
  userId: string
): Promise<Record<string, SkillProgress>> {
  try {
    const userAnalytics = await getUserAnalytics(userId);
    return userAnalytics?.skillsProgress || {};
  } catch (error) {
    console.error("Error getting all user skills progress:", error);
    return {};
  }
}

// Get platform analytics for admin
export async function getPlatformAnalytics(): Promise<PlatformAnalytics> {
  try {
    // Get total users
    const usersSnapshot = await getDocs(collection(db, "userAnalytics"));
    const totalUsers = usersSnapshot.size;

    // Get today's date
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    let activeUsersToday = 0;
    let activeUsersWeek = 0;

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.lastActiveDate === today) activeUsersToday++;
      if (data.lastActiveDate >= weekAgo) activeUsersWeek++;
    });

    // Get topic counts
    const topicRef = doc(db, "platformAnalytics", "topicCounts");
    const topicDoc = await getDoc(topicRef);
    let totalTopicsSearched = 0;
    let popularTopics: { topic: string; count: number }[] = [];

    if (topicDoc.exists()) {
      const data = topicDoc.data();
      totalTopicsSearched = data.totalSearches || 0;
      const topics = data.topics || {};
      popularTopics = Object.entries(topics)
        .map(([topic, count]) => ({ topic, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    }

    // Get material counts
    const materialRef = doc(db, "platformAnalytics", "materialCounts");
    const materialDoc = await getDoc(materialRef);
    let totalMaterialsAccessed = 0;
    let popularSubjects: { subjectId: string; title: string; count: number }[] = [];

    if (materialDoc.exists()) {
      const data = materialDoc.data();
      totalMaterialsAccessed = data.totalAccesses || 0;
      const materials = data.materials || {};
      popularSubjects = Object.entries(materials)
        .map(([subjectId, info]: [string, any]) => ({
          subjectId,
          title: info.title,
          count: info.count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    }

    return {
      totalUsers,
      totalTopicsSearched,
      totalMaterialsAccessed,
      activeUsersToday,
      activeUsersWeek,
      popularSubjects,
      popularTopics,
      usersByBranch: [], // Can be expanded later
    };
  } catch (error) {
    console.error("Error getting platform analytics:", error);
    return {
      totalUsers: 0,
      totalTopicsSearched: 0,
      totalMaterialsAccessed: 0,
      activeUsersToday: 0,
      activeUsersWeek: 0,
      popularSubjects: [],
      popularTopics: [],
      usersByBranch: [],
    };
  }
}

// User info for skill analytics
export interface SkillUserInfo {
  userId: string;
  displayName: string;
  email: string;
  completedLevels: number[];
  totalLevels: number;
  lastActiveDate: string;
}

export interface SkillAnalyticsWithUsers {
  slug: string;
  title: string;
  branch: string;
  totalCompletions: number;
  usersStarted: number;
  users: SkillUserInfo[];
}

// Get skills analytics - aggregated from all users with user details
export async function getSkillsAnalytics(): Promise<SkillAnalyticsWithUsers[]> {
  try {
    const usersRef = collection(db, "userAnalytics");
    const usersSnapshot = await getDocs(usersRef);
    
    const skillStats: Record<string, SkillAnalyticsWithUsers> = {};

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      const skillsProgress = data.skillsProgress || {};
      
      Object.values(skillsProgress).forEach((progress: any) => {
        const slug = progress.skillSlug;
        if (!skillStats[slug]) {
          skillStats[slug] = {
            slug,
            title: progress.skillTitle || slug,
            branch: progress.branch || 'General',
            totalCompletions: 0,
            usersStarted: 0,
            users: [],
          };
        }
        skillStats[slug].usersStarted += 1;
        skillStats[slug].totalCompletions += (progress.completedLevels?.length || 0);
        
        // Add user info
        skillStats[slug].users.push({
          userId: data.userId || doc.id,
          displayName: data.displayName || 'Unknown User',
          email: data.email || '',
          completedLevels: progress.completedLevels || [],
          totalLevels: progress.totalLevels || 30,
          lastActiveDate: progress.lastActiveDate || '',
        });
      });
    });

    return Object.values(skillStats).sort((a, b) => b.totalCompletions - a.totalCompletions);
  } catch (error) {
    console.error("Error getting skills analytics:", error);
    return [];
  }
}
