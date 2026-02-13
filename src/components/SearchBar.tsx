'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';

export default function SearchBar({ onSearch }: { onSearch?: (query: string) => void } = {}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [query, setQuery] = useState('');
    const [recentSearches] = useState([
        'John Smith Memorial',
        'Anniversary photos',
    ]);
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    // Handle keyboard shortcut (Cmd/Ctrl + K)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsExpanded(true);
                setTimeout(() => inputRef.current?.focus(), 100);
            }
            if (e.key === 'Escape' && isExpanded) {
                setIsExpanded(false);
                setQuery('');
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isExpanded]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsExpanded(false);
            }
        };

        if (isExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isExpanded]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim() && onSearch) {
            onSearch(query);
        }
    };

    return (
        <div ref={containerRef} className="search-bar-container relative">
            <form onSubmit={handleSubmit} className="search-bar-form">
                <div className={`search-bar ${isExpanded ? 'search-bar-expanded' : ''}`}>
                    <Search size={18} className="search-icon" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search memorials..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsExpanded(true)}
                        className="search-input"
                    />
                    {query ? (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="search-clear"
                        >
                            <X size={16} />
                        </button>
                    ) : (
                        <kbd className="search-shortcut hidden md:flex">⌘K</kbd>
                    )}
                </div>
            </form>

            {/* Recent Searches Dropdown */}
            {isExpanded && recentSearches.length > 0 && !query && (
                <div className="search-dropdown">
                    <div className="search-dropdown-header">
                        <span className="text-xs font-medium text-memorial-textTertiary dark:text-memorialDark-textTertiary uppercase tracking-wide">
                            Recent Searches
                        </span>
                    </div>
                    <ul className="search-dropdown-list">
                        {recentSearches.map((search, index) => (
                            <li key={index}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setQuery(search);
                                        if (onSearch) onSearch(search);
                                    }}
                                    className="search-dropdown-item"
                                >
                                    <Search size={14} />
                                    <span>{search}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
