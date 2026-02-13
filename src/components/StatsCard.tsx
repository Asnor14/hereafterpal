'use client';

import type { ElementType } from 'react';

interface StatsCardProps {
    icon: ElementType;
    label: string;
    value: string | number;
    trend?: number;
}

export default function StatsCard({ icon: Icon, label, value, trend }: StatsCardProps) {
    return (
        <div className="stats-card">
            {/* Icon */}
            <div className="w-12 h-12 rounded-memorial-lg bg-memorial-accent/10 dark:bg-memorialDark-accent/10 flex items-center justify-center">
                <Icon size={24} className="text-memorial-accent dark:text-memorialDark-accent" />
            </div>

            {/* Content */}
            <div className="flex-1">
                <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary">
                    {label}
                </p>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-memorial-text dark:text-memorialDark-text">
                        {value}
                    </span>
                    {trend && (
                        <span className={`text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {trend > 0 ? '+' : ''}{trend}%
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
