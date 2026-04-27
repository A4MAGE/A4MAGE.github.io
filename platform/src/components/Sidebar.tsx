import { NavLink } from "react-router-dom";
// @ts-ignore
import MageLogo from "@homepage/assets/favicon.svg";
import "./Sidebar.css";

const tabs = [
  { path: "/profile", label: "Profile", icon: "◈" },
  { path: "/explore", label: "Explore", icon: "◎" },
  { path: "/player", label: "Player", icon: "▶" },
  { path: "/my-presets", label: "My Presets", icon: "♫" },
  { path: "/broadcast", label: "Broadcast", icon: "◉" },
  { path: "/create", label: "Create", icon: "+"},
];

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  return (
    <nav className={collapsed ? "sidebar sidebar--collapsed" : "sidebar"}>
      <div className="sidebar-header">
        <img src={MageLogo} alt="MAGE" className="sidebar-logo-img" />
      </div>

      {!collapsed && (
        <ul className="sidebar-tabs">
          {tabs.map((tab) => (
            <li key={tab.path}>
              <NavLink
                to={tab.path}
                className={({ isActive }) =>
                  "sidebar-tab" + (isActive ? " sidebar-tab--active" : "")
                }
              >
                <span className="sidebar-tab-icon">{tab.icon}</span>
                <span className="sidebar-tab-label">{tab.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      )}

      <button className="sidebar-toggle" onClick={onToggle} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
        <span className="sidebar-toggle__icon">
          {collapsed ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          )}
        </span>
      </button>
    </nav>
  );
};

export default Sidebar;
