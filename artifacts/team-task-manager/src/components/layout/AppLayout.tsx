import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Tasks", href: "/tasks" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col py-6 px-4">
        <div className="mb-8">
          <span className="text-lg font-bold text-blue-600">TaskFlow</span>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${
                location === item.href
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="text-xs text-gray-500 mb-1 truncate">{user?.name}</div>
          <div className="text-xs text-gray-400 capitalize mb-3">{user?.role}</div>
          <button
            onClick={logout}
            className="w-full text-left text-xs text-red-500 hover:text-red-700 font-medium"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
