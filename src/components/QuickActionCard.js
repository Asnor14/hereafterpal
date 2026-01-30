'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function QuickActionCard({ icon: Icon, title, description, href, variant = 'default' }) {
    const content = (
        <>
            <div className={`quick-action-icon ${variant === 'primary' ? 'quick-action-icon-primary' : ''}`}>
                <Icon size={28} />
            </div>
            <div className="quick-action-content">
                <h3 className="quick-action-title">{title}</h3>
                <p className="quick-action-description">{description}</p>
            </div>
            <ArrowRight size={18} className="quick-action-arrow" />
        </>
    );

    const className = `quick-action-card ${variant === 'primary' ? 'quick-action-card-primary' : ''}`;

    if (href) {
        return (
            <Link href={href} className={className}>
                {content}
            </Link>
        );
    }

    return (
        <button className={className}>
            {content}
        </button>
    );
}
