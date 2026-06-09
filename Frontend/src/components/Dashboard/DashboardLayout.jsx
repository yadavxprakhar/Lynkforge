import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useStoreContext } from "../../contextApi/ContextApi";
import { LayoutDashboard, PlusCircle, LogOut, Menu, X, ArrowLeft } from "lucide-react";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken } = useStoreContext();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const onLogOut = () => {
    setToken(null);
    localStorage.removeItem("JWT_TOKEN");
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, exact: true },
    { label: "Create Link", path: "/dashboard/create", icon: PlusCircle, exact: false },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden h-16 border-b border-[rgba(255,255,255,0.06)] bg-[#0A0A0A] px-6 flex items-center justify-between z-30">
        <Link to="/" className="flex items-center gap-2 font-display font-extrabold text-[16px] text-white">
          <svg className="w-4 h-4 text-[#4DFFB4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" />
          </svg>
          <span>LYNKFORGE</span>
        </Link>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 text-[#A0A0A0] hover:text-white"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Overlay Sidebar Menu */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-[#0A0A0A] z-40 flex flex-col p-6 gap-6 border-b border-[rgba(255,255,255,0.06)]">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const active = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`nav-item ${active ? "active" : ""}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="h-[1px] bg-[rgba(255,255,255,0.06)]" />
          <button
            onClick={onLogOut}
            className="flex items-center gap-3 px-4 py-3 text-[14px] text-[#FF4D4D] hover:bg-red-500/10 rounded-lg transition-colors duration-150 text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col w-52 lg:w-60 bg-[#0A0A0A] border-r border-[rgba(255,255,255,0.06)] min-h-screen shrink-0 p-6 justify-between">
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-white font-display font-extrabold text-[18px] tracking-tight group"
          >
            <svg
              className="w-4 h-4 text-[#4DFFB4] transition-transform duration-300 group-hover:scale-110"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" />
            </svg>
            <span>LYNKFORGE</span>
          </Link>

          {/* Navigation */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const active = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${active ? "active" : ""}`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Area: User details + Log Out */}
        <div className="flex flex-col gap-4">
          <div className="h-[1px] bg-[rgba(255,255,255,0.06)]" />
          <button
            onClick={onLogOut}
            className="flex items-center gap-3 px-4 py-2 text-[14px] text-[#A0A0A0] hover:text-[#FF4D4D] rounded-lg transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Right Scrollable Content Area */}
      <main className="flex-1 min-w-0 bg-[#080808] p-6 lg:p-12 overflow-y-auto">
        {location.pathname !== "/dashboard" && (
          <button
            onClick={() => navigate(-1)}
            className="mb-8 flex items-center gap-2 text-[13px] text-[#A0A0A0] hover:text-white transition-colors duration-150 focus:outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        )}
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
