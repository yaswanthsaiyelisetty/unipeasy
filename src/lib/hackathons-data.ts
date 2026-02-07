// Hackathon data types and utilities for the verified hackathons feature

export interface Hackathon {
    id: string;
    name: string;           // Hackathon name
    details: string;        // Markdown-supported description
    link: string;           // Registration URL
    category: HackathonCategory;
    deadline?: string;      // Optional deadline (ISO date string)
    location?: string;      // Optional location (e.g., "Online", "Bangalore")
    prizePool?: string;     // Optional prize info (e.g., "₹1,00,000")
    teamSize?: string;      // Optional team size (e.g., "2-4 members")
    createdAt: string;
    updatedAt: string;
}

export type HackathonCategory = 'tech' | 'non-tech' | 'design' | 'ai-ml' | 'blockchain' | 'other';

export const categoryLabels: Record<HackathonCategory, string> = {
    tech: 'Tech',
    'non-tech': 'Non-Tech',
    design: 'Design',
    'ai-ml': 'AI/ML',
    blockchain: 'Blockchain',
    other: 'Other',
};

export const categoryColors: Record<HackathonCategory, string> = {
    tech: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
    'non-tech': 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
    design: 'bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-500/30',
    'ai-ml': 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30',
    blockchain: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    other: 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30',
};

// Check if deadline is approaching (within 7 days)
export function isDeadlineApproaching(deadline?: string): boolean {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
}

// Check if deadline has passed
export function isDeadlinePassed(deadline?: string): boolean {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    return deadlineDate < new Date();
}

// Format deadline for display
export function formatDeadline(deadline?: string): string {
    if (!deadline) return '';
    const date = new Date(deadline);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}
