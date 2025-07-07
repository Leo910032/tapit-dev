// app/dashboard/(dashboard pages)/account/components/team/SkeletonLoader.jsx

export const SkeletonLoader = () => (
    <div className="bg-white rounded-xl shadow-sm border p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-10 bg-gray-200 rounded w-1/4 mt-4"></div>
    </div>
);