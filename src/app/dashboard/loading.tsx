export default function DashboardLoading() {
    return (
        <div className="max-w-dashboard mx-auto px-4 py-8 space-y-8 animate-fade-in">
            {/* Welcome Banner Skeleton */}
            <div className="w-full h-48 rounded-memorial-lg skeleton"></div>

            {/* Quick Actions Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="h-32 rounded-memorial-lg skeleton"></div>
                <div className="h-32 rounded-memorial-lg skeleton"></div>
                <div className="h-32 rounded-memorial-lg skeleton"></div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 rounded-memorial-lg skeleton"></div>
                ))}
            </div>

            {/* Recent Activity Skeleton */}
            <div className="space-y-4">
                <div className="h-8 w-48 rounded skeleton mb-4"></div>
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 w-full rounded-memorial skeleton"></div>
                ))}
            </div>
        </div>
    )
}
