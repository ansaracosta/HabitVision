import { Link } from "wouter";

interface NavigationTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function NavigationTabs({ activeTab, setActiveTab }: NavigationTabsProps) {
  const tabs = [
    { name: "Dashboard", displayName: "Painel", path: "/" },
    { name: "Habits", displayName: "Hábitos", path: "/habits" },
    { name: "Study", displayName: "Estudos", path: "/study" },
    { name: "Stats", displayName: "Estatísticas", path: "/stats" },
    { name: "Profile", displayName: "Perfil", path: "/profile" }
  ];

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8" aria-label="Abas">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.path}
              onClick={() => setActiveTab(tab.name)}
            >
              <button
                className={`${
                  activeTab === tab.name
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } px-1 py-4 text-sm font-medium border-b-2`}
              >
                {tab.displayName}
              </button>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
