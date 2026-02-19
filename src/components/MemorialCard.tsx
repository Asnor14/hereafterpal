'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CldImage } from 'next-cloudinary';
import { Eye, Pencil, Calendar, Trash2, X } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

export default function MemorialCard({ memorial, onDelete }) {
    const { id, name, date_of_birth, date_of_passing, image_url, service_type } = memorial;
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    // Format dates
    const formatYear = (date) => {
        if (!date) return '';
        return new Date(date).getFullYear();
    };

    const birthYear = formatYear(date_of_birth);
    const passingYear = formatYear(date_of_passing);

    // Check if image_url is a Cloudinary public_id
    const isCloudinaryImage = image_url && !image_url.startsWith('http');

    const handleDelete = async () => {
        setIsDeleting(true);
        const toastId = toast.loading('Deleting memorial...');

        try {
            const { error } = await supabase
                .from('memorials')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.dismiss(toastId);
            toast.success('Memorial deleted successfully');
            setShowDeleteModal(false);

            // Trigger refresh or callback
            if (onDelete) {
                onDelete(id);
            } else {
                router.refresh();
            }
        } catch (error) {
            toast.dismiss(toastId);
            toast.error('Failed to delete memorial');
            console.error('Delete error:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
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
                        {!memorial.isShared && (
                            <>
                                <Link
                                    href={`/memorial/${id}/edit`}
                                    className="flex items-center justify-center px-3 py-2 border border-memorial-border dark:border-memorialDark-border rounded-memorial text-sm font-medium text-memorial-textSecondary dark:text-memorialDark-textSecondary hover:border-memorial-accent dark:hover:border-memorialDark-accent hover:text-memorial-accent dark:hover:border-memorialDark-accent transition-colors"
                                >
                                    <Pencil size={16} />
                                </Link>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="flex items-center justify-center px-3 py-2 border border-memorial-border dark:border-memorialDark-border rounded-memorial text-sm font-medium text-memorial-textSecondary dark:text-memorialDark-textSecondary hover:border-red-500 hover:text-red-500 dark:hover:border-red-400 dark:hover:text-red-400 transition-colors"
                                    aria-label="Delete memorial"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </>
                        )}
                        {memorial.isShared && (
                            <div className="flex items-center justify-center px-3 py-2 bg-memorial-accent/5 dark:bg-memorialDark-accent/5 rounded-memorial text-[10px] font-bold uppercase tracking-wider text-memorial-accent/60 dark:text-memorialDark-accent/60 border border-memorial-accent/10">
                                {memorial.access_role}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-memorial-surface dark:bg-memorialDark-surface rounded-memorial-lg p-6 max-w-md w-full shadow-memorial-xl border border-memorial-borderLight dark:border-memorialDark-border">
                        {/* Close button */}
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="absolute top-4 right-4 text-memorial-textTertiary hover:text-memorial-text dark:text-memorialDark-textTertiary dark:hover:text-memorialDark-text"
                        >
                            <X size={20} />
                        </button>

                        {/* Modal content */}
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                                <Trash2 size={24} className="text-red-500" />
                            </div>
                            <h3 className="text-lg font-serif text-memorial-text dark:text-memorialDark-text mb-2">
                                Delete Memorial?
                            </h3>
                            <p className="text-memorial-textSecondary dark:text-memorialDark-textSecondary mb-6">
                                Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 btn-ghost"
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-memorial font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

