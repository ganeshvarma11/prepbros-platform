import { Link } from "wouter";
export default function Explore() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-4">🚧</p>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Explore is coming soon</h1>
        <p className="text-sm text-gray-400 mb-6">Curated learning paths, daily challenges and more</p>
        <Link href="/practice">
          <button className="px-4 py-2 bg-orange-500 text-white text-sm rounded-xl hover:bg-orange-600">Go to Practice</button>
        </Link>
      </div>
    </div>
  );
}