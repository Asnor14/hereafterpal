'use client';

import Link from 'next/link';

export default function WelcomeBanner({ user, memorialCount = 0 }) {
    const userName = user?.email?.split('@')[0] || 'there';

    return (
        <div className="welcome-banner">
            <div className="welcome-content">
                <h1 className="welcome-title">
                    Welcome back, {userName} 👋
                </h1>
                <p className="welcome-subtitle">
                    {memorialCount > 0
                        ? `You have ${memorialCount} memorial${memorialCount > 1 ? 's' : ''} preserving precious memories.`
                        : 'Start preserving precious memories by creating your first memorial.'}
                </p>
            </div>
            <div className="welcome-actions">
                {memorialCount > 0 && (
                    <Link href="/memorials" className="btn-ghost">
                        View All
                    </Link>
                )}
            </div>
        </div>
    );
}
