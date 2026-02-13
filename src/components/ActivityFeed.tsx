'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

// Format relative time
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) {
        const mins = Math.floor(diffInSeconds / 60);
        return `${mins} minute${mins > 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        if (days === 1) return 'Yesterday';
        return `${days} days ago`;
    }
    if (diffInSeconds < 2592000) {
        const weeks = Math.floor(diffInSeconds / 604800);
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    return date.toLocaleDateString();
}

function ActivityItem({ avatar, userName, action, target, timestamp }) {
    return (
        <div className="activity-item">
            <div className="activity-avatar">
                {avatar || userName?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="activity-content">
                <p className="activity-text">
                    <span className="activity-user">{userName}</span>
                    {' '}{action}{' '}
                    {target && <span className="activity-target">{target}</span>}
                </p>
                <p className="activity-time">{timestamp}</p>
            </div>
        </div>
    );
}

// Activity Modal Component
function ActivityModal({ isOpen, onClose, activities }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="w-full max-w-lg max-h-[80vh] overflow-hidden memorial-card p-0 flex flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 md:p-6 border-b border-memorial-divider dark:border-memorialDark-divider">
                                <div className="flex items-center gap-3">
                                    <MessageSquare size={24} className="text-memorial-accent dark:text-memorialDark-accent" />
                                    <h3 className="text-lg md:text-xl font-serif text-memorial-text dark:text-memorialDark-text">
                                        All Activity
                                    </h3>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-memorial-surfaceAlt dark:hover:bg-memorialDark-surfaceAlt transition-colors"
                                >
                                    <X size={20} className="text-memorial-textSecondary" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                                <div className="activity-feed">
                                    {activities.map((activity, index) => (
                                        <motion.div
                                            key={activity.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                        >
                                            <ActivityItem {...activity} />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default function ActivityFeed({ memorialIds = [] }) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const supabase = createClient();

    // Number of items to show in preview
    const PREVIEW_COUNT = 3;
    const displayedActivities = activities.slice(0, PREVIEW_COUNT);
    const hasMore = activities.length > PREVIEW_COUNT;

    useEffect(() => {
        async function fetchActivities() {
            if (memorialIds.length === 0) {
                setLoading(false);
                return;
            }

            try {
                // Fetch guestbook entries for user's memorials
                const { data, error } = await supabase
                    .from('guestbook_entries')
                    .select(`
                        id,
                        created_at,
                        author_name,
                        message,
                        role,
                        memorial_id,
                        memorials (
                            id,
                            name
                        )
                    `)
                    .in('memorial_id', memorialIds)
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (error) throw error;

                // Transform data into activity format
                const formattedActivities = (data || []).map(entry => ({
                    id: entry.id,
                    userName: entry.author_name || 'Someone',
                    action: 'left a message on',
                    target: ((Array.isArray(entry.memorials) ? entry.memorials[0] : entry.memorials) as { name?: string } | null)?.name || 'a memorial',
                    timestamp: formatRelativeTime(entry.created_at),
                    avatar: entry.author_name?.charAt(0)?.toUpperCase() || '?'
                }));

                setActivities(formattedActivities);
            } catch (error) {
                console.error('Error fetching activities:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchActivities();
    }, [memorialIds]);

    if (loading) {
        return (
            <div className="activity-empty">
                <div className="w-6 h-6 border-2 border-memorial-accent/30 border-t-memorial-accent rounded-full animate-spin" />
                <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                    Loading activity...
                </p>
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="activity-empty">
                <MessageSquare size={24} className="text-memorial-textTertiary dark:text-memorialDark-textTertiary" />
                <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                    No recent activity
                </p>
                <p className="text-xs text-memorial-textTertiary dark:text-memorialDark-textTertiary mt-1">
                    Messages left on your memorials will appear here
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="activity-feed">
                {displayedActivities.map((activity) => (
                    <ActivityItem key={activity.id} {...activity} />
                ))}
            </div>

            {/* View All Button */}
            {hasMore && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-memorial-accent dark:text-memorialDark-accent border border-memorial-accent dark:border-memorialDark-accent rounded-full hover:bg-memorial-accent hover:text-white dark:hover:bg-memorialDark-accent dark:hover:text-memorialDark-bg transition-all duration-200"
                    >
                        View All ({activities.length})
                    </button>
                </div>
            )}

            {/* Activity Modal */}
            <ActivityModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                activities={activities}
            />
        </>
    );
}
