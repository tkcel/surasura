import { Link, useLocation } from "react-router-dom";
import { docsSections } from "../../pages/docs/config";

interface DocsSidebarProps {
  onNavigate?: () => void;
}

export function DocsSidebar({ onNavigate }: DocsSidebarProps) {
  const location = useLocation();

  const getCurrentSection = () => {
    const path = location.pathname;
    if (path === "/docs" || path === "/docs/") {
      return "getting-started";
    }
    const match = path.match(/^\/docs\/(.+)$/);
    return match ? match[1] : "getting-started";
  };

  const currentSection = getCurrentSection();

  return (
    <nav className="space-y-4">
      {docsSections.map((section) => {
        const Icon = section.icon;
        const isActive = section.id === currentSection;
        const href = section.id === "getting-started" ? "/docs" : `/docs/${section.id}`;

        return (
          <Link
            key={section.id}
            to={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-nm-surface shadow-nm-inset-sm text-primary-600"
                : "bg-nm-surface shadow-nm-raised-sm hover:shadow-nm-raised-md text-gray-600 hover:text-gray-900"
            }`}
          >
            <Icon size={18} className={isActive ? "text-primary-600" : "text-gray-400"} />
            <span className="font-medium">
              {section.title}
              {"subtitle" in section && section.subtitle && (
                <>
                  <br />
                  <span className="text-xs text-gray-400">{section.subtitle}</span>
                </>
              )}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
