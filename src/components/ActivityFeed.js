'use client';

import { Heart, MessageSquare, Image } from 'lucide-react';

function ActivityItem({ avatar, userName, action, target, timestamp }) {
    return (
        <div className="activity-item">
            <div className="activity-avatar">
                {avatar || userName?.charAt(0) || '?'}
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

export default function ActivityFeed({ activities = [] }) {
    // Default activities for demo
    const defaultActivities = [
        {
            id: 1,
            userName: 'Maria S.',
            action: 'left a message on',
            target: 'John Smith Memorial',
            timestamp: '2 hours ago',
        },
        {
            id: 2,
            userName: 'James T.',
            action: 'viewed',
            target: 'Pet Memorial',
            timestamp: '5 hours ago',
        },
        {
            id: 3,
            userName: 'You',
            action: 'added 3 photos to',
            target: 'Memory Lane',
            timestamp: 'Yesterday',
        },
    ];

    const displayActivities = activities.length > 0 ? activities : defaultActivities;

    if (displayActivities.length === 0) {
        return (
            <div className="activity-empty">
                <MessageSquare size={24} className="text-memorial-textTertiary dark:text-memorialDark-textTertiary" />
                <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                    No recent activity
                </p>
            </div>
        );
    }

    return (
        <div className="activity-feed">
            {displayActivities.map((activity) => (
                <ActivityItem key={activity.id} {...activity} />
            ))}
        </div>
    );
}
