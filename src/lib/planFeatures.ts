// Centralized plan feature access definitions
// Used across the app to gate features based on user's subscription plan

export type PlanKey = 'free' | 'eternal_echo' | 'paws';

export type Feature =
    | 'memory_lane'
    | 'letters_of_love'
    | 'pick_a_mood'
    | 'unlimited_photos'
    | 'publish_public'
    | 'priority_support';

// Feature access matrix
const featureAccess: Record<PlanKey, Set<Feature>> = {
    free: new Set([]),
    eternal_echo: new Set([
        'memory_lane',
        'letters_of_love',
        'pick_a_mood',
        'unlimited_photos',
        'publish_public',
        'priority_support',
    ]),
    paws: new Set([
        'memory_lane',
        'letters_of_love',
        'pick_a_mood',
        'unlimited_photos',
        'publish_public',
    ]),
};

// Photo upload limits per plan
const photoLimits: Record<PlanKey, number> = {
    free: 3,
    eternal_echo: Infinity,
    paws: Infinity,
};

// Memorial creation limits per plan
const memorialLimits: Record<PlanKey, number> = {
    free: 1,
    eternal_echo: Infinity,
    paws: Infinity,
};

/**
 * Check if a plan has access to a specific feature.
 * Accepts a single plan or an array (if user has multiple subscriptions).
 */
export function canAccess(plan: string | string[] | null | undefined, feature: Feature): boolean {
    if (!plan) return false;

    const plans = Array.isArray(plan) ? plan : [plan];
    return plans.some((p) => {
        const key = p as PlanKey;
        return featureAccess[key]?.has(feature) ?? false;
    });
}

/**
 * Get the photo upload limit for a plan.
 * If user has multiple plans, returns the highest limit.
 */
export function getPhotoLimit(plan: string | string[] | null | undefined): number {
    if (!plan) return photoLimits.free;

    const plans = Array.isArray(plan) ? plan : [plan];
    return Math.max(...plans.map((p) => photoLimits[p as PlanKey] ?? photoLimits.free));
}

/**
 * Get the memorial creation limit for a plan.
 */
export function getMemorialLimit(plan: string | string[] | null | undefined): number {
    if (!plan) return memorialLimits.free;

    const plans = Array.isArray(plan) ? plan : [plan];
    return Math.max(...plans.map((p) => memorialLimits[p as PlanKey] ?? memorialLimits.free));
}

/**
 * Check if user has any active paid plan.
 */
export function isPaidPlan(plan: string | string[] | null | undefined): boolean {
    if (!plan) return false;
    const plans = Array.isArray(plan) ? plan : [plan];
    return plans.some((p) => p !== 'free' && p !== null && p !== undefined);
}
