'use client';

import Link from 'next/link';
import { CldImage } from 'next-cloudinary';
import { Eye, Pencil, Calendar } from 'lucide-react';

export default function MemorialCard({ memorial }) {
    const { id, name, date_of_birth, date_of_passing, image_url, service_type } = memorial;

    // Format dates
    const formatYear = (date) => {
        if (!date) return '';
        return new Date(date).getFullYear();
    };

    const birthYear = formatYear(date_of_birth);
    const passingYear = formatYear(date_of_passing);

    // Check if image_url is a Cloudinary public_id
    const isCloudinaryImage = image_url && !image_url.startsWith('http');

    return (
        <div className="memorial-card overflow-hidden group">
            {/* Image Section */}
            <div className="relative h-40 md:h-48 overflow-hidden bg-memorial-surfaceAlt dark:bg-memorialDark-surfaceAlt">
                {image_url ? (
                    isCloudinaryImage ? (
                        <CldImage
                            src={image_url}
                            alt={name || 'Memorial photo'}
                            fill
                            crop="fill"
                            gravity="face"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            style={{ filter: 'saturate(0.9)' }}
                        />
                    ) : (
                        <img
                            src={image_url}
                            alt={name || 'Memorial photo'}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            style={{ filter: 'saturate(0.9)' }}
                        />
                    )
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl font-serif text-memorial-textTertiary dark:text-memorialDark-textTertiary">
                            {name?.charAt(0) || '?'}
                        </span>
                    </div>
                )}

                {/* Type Badge */}
                <div className="absolute top-3 left-3">
                    <span className="badge-memorial">
                        {service_type === 'PAWS' ? '🐾 Pet' : '❤️ Human'}
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4">
                {/* Name */}
                <h3 className="text-lg font-serif text-memorial-text dark:text-memorialDark-text mb-1 truncate">
                    {name}
                </h3>

                {/* Dates */}
                {(birthYear || passingYear) && (
                    <p className="text-sm text-memorial-textSecondary dark:text-memorialDark-textSecondary flex items-center gap-1 mb-4">
                        <Calendar size={14} />
                        {birthYear} — {passingYear}
                    </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Link
                        href={`/memorial/${id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-memorial-accent dark:bg-memorialDark-accent text-white dark:text-memorialDark-bg rounded-memorial text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        <Eye size={16} />
                        View
                    </Link>
                    <Link
                        href={`/memorial/${id}/edit`}
                        className="flex items-center justify-center px-3 py-2 border border-memorial-border dark:border-memorialDark-border rounded-memorial text-sm font-medium text-memorial-textSecondary dark:text-memorialDark-textSecondary hover:border-memorial-accent dark:hover:border-memorialDark-accent hover:text-memorial-accent dark:hover:text-memorialDark-accent transition-colors"
                    >
                        <Pencil size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
