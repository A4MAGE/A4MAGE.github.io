import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./Sidebar.css";

const SidebarLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="sidebar-layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={collapsed ? "sidebar-content sidebar-content--collapsed" : "sidebar-content"}>
        <Outlet />
      </div>
    </div>
  );
};

export default SidebarLayout;
