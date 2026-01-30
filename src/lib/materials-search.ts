import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { Subject } from "./materials-data";

export interface MaterialRecommendation {
  subject: Subject;
  matchedUnits: {
    unit_number: number;
    unit_title: string;
    drive_link: string;
  }[];
  relevanceScore: number;
}

/**
 * Search materials based on a topic/query
 * Returns matching subjects and units
 */
export async function searchMaterials(searchQuery: string): Promise<MaterialRecommendation[]> {
  try {
    const subjectsRef = collection(db, "subjects");
    const querySnapshot = await getDocs(subjectsRef);
    
    const recommendations: MaterialRecommendation[] = [];
    const searchTerms = searchQuery.toLowerCase().split(/\s+/);

    querySnapshot.forEach((doc) => {
      const subject = { id: doc.id, ...doc.data() } as Subject;
      let relevanceScore = 0;
      const matchedUnits: Subject["units"] = [];

      // Check subject title match (handle undefined)
      const titleLower = (subject.title || '').toLowerCase();
      for (const term of searchTerms) {
        if (titleLower.includes(term)) {
          relevanceScore += 10;
        }
      }

      // Check unit titles match (handle undefined units array)
      for (const unit of (subject.units || [])) {
        const unitTitleLower = (unit.unit_title || '').toLowerCase();
        let unitMatches = false;
        
        for (const term of searchTerms) {
          if (unitTitleLower.includes(term)) {
            relevanceScore += 5;
            unitMatches = true;
          }
        }
        
        if (unitMatches) {
          matchedUnits.push(unit);
        }
      }

      // Only include if there's some relevance
      if (relevanceScore > 0) {
        recommendations.push({
          subject,
          matchedUnits: matchedUnits.length > 0 ? matchedUnits : (subject.units || []).slice(0, 2),
          relevanceScore,
        });
      }
    });

    // Sort by relevance score
    return recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 3);
  } catch (error) {
    console.error("Error searching materials:", error);
    return [];
  }
}

/**
 * Get all subjects for a specific topic keyword
 */
export async function getMaterialsByKeywords(keywords: string[]): Promise<Subject[]> {
  try {
    const subjectsRef = collection(db, "subjects");
    const querySnapshot = await getDocs(subjectsRef);
    
    const subjects: Subject[] = [];
    const keywordsLower = keywords.map(k => k.toLowerCase());

    querySnapshot.forEach((doc) => {
      const subject = { id: doc.id, ...doc.data() } as Subject;
      const titleLower = (subject.title || '').toLowerCase();
      
      // Check if any keyword matches
      const matches = keywordsLower.some(keyword => 
        titleLower.includes(keyword) ||
        (subject.units || []).some(u => (u.unit_title || '').toLowerCase().includes(keyword))
      );
      
      if (matches) {
        subjects.push(subject);
      }
    });

    return subjects;
  } catch (error) {
    console.error("Error getting materials:", error);
    return [];
  }
}
