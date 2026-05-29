import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import Logout from "./Logout";
import { api } from "../services/api";
const logo1 = new URL("/favicon.svg", import.meta.url).href;

function readStaffUser() {
  try {
    const raw = localStorage.getItem("staff_user");
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export default function Header({ role, isLogin, setIslogin, setRole }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const authToken = localStorage.getItem("auth_token");
  const staffUser = role === "Staff" ? readStaffUser() : null;
  const groundName = staffUser?.ground_name || "My Ground";
  const staffName =
    `${staffUser?.first_name || ""} ${staffUser?.last_name || ""}`.trim();
  const handleStaffLogout = async () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("staff_user");
    try {
      await api.logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
    setRole("");
    setIslogin(false);
    navigate("/staff/login");
  };

  const defaultLinks = [
    { name: t("home"), path: "/", end: true },
    { name: t("viewAllGrounds"), path: "/grounds", end: true },
  ];

  const adminLinks = [
    {
      name: t("admin.dashboard_title"),
      shortName: t("dashboard"),
      path: "/admin/dashboard",
      end: true,
    },
    {
      name: t("addGround"),
      shortName: t("addGroundShort"),
      path: "/admin/grounds/add",
      end: true,
    },
    {
      name: t("viewAllGrounds"),
      shortName: t("viewAllGroundsShort"),
      path: "/admin/grounds",
      end: true,
    },
    {
      name: t("viewAllClients"),
      shortName: t("viewAllClientsShort"),
      path: "/admin/clients",
      end: true,
    },
    {
      name: t("viewAllBookings"),
      shortName: t("viewAllBookingsShort"),
      path: "/admin/bookings",
      end: true,
    },
    {
      name: t("booking.verify_ticket"),
      shortName: t("verifyTicketShort"),
      path: "/admin/verify-ticket",
      end: true,
    },
    {
      name: "Manage Staff",
      shortName: "Staff",
      path: "/admin/manage-staff",
      end: true,
    },
  ];

  const staffLinks = [
    { name: t("staff.dashboard"), path: "/staff/dashboard", end: true },
    { name: t("staff.scan_qr_nav"), path: "/staff/verify", end: true },
  ];

  const links =
    role === "Staff"
      ? staffLinks
      : role === "Admin"
        ? adminLinks
        : defaultLinks;
  const location = useLocation();

  return (
    <header className="h-[10vh] flex items-center justify-between px-6 text-gray-200 w-full sticky top-0 z-50 border-b border-cyan-500/10 backdrop-blur-sm backdrop-brightness-75 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
      {/* Logo + Staff Info */}
      <div className="flex items-center gap-4">
        <img
          src={logo1}
          alt="Logo"
          className="h-10 cursor-pointer drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]"
          onClick={() => navigate(role === "Staff" ? "/staff/dashboard" : "/")}
        />
        {role === "Staff" && (
          <div className="hidden sm:block min-w-0">
            <p className="text-sm font-bold text-cyan-400 truncate">
              {groundName}
            </p>
            <p className="text-xs text-slate-400 truncate">{staffName}</p>
          </div>
        )}
      </div>

      {/* Desktop Links */}
      <nav
        className={`hidden ${role === "Admin" ? "nav-sm:flex" : "md:flex"} items-center gap-8 font-medium`}
      >
        {links.map((link, i) => {
          const isActive = location.pathname === link.path;
          return (
            <div key={i} className="relative group">
              <NavLink
                end={link.end}
                to={link.path}
                className={`relative py-1 px-1 group transition-colors duration-300 ${
                  isActive
                    ? "text-cyan-400"
                    : "text-gray-300 hover:text-gray-100"
                }`}
              >
                <span>{link.name}</span>
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-cyan-400 transition-all duration-300 ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </NavLink>
            </div>
          );
        })}
      </nav>

      {/* Right side: Language Switcher + Logout */}
      <div className="hidden md:flex gap-2">
        <LanguageSwitcher />
        {role === "Staff" ? (
          <button
            onClick={handleStaffLogout}
            className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 text-sm font-medium"
          >
            {t("staff.logout")}
          </button>
        ) : (
          isLogin && (
            <Logout
              setIslogin={setIslogin}
              setRole={setRole}
              menuOpen={menuOpen}
            />
          )
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        className={`${role === "Admin" ? "nav-sm:hidden" : "md:hidden"} text-2xl`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? (
          <HiX className="cursor-pointer" />
        ) : (
          <HiMenu className="cursor-pointer" />
        )}
      </button>

      {/* Mobile Menu */}
      <div
        className={`absolute top-[10vh] left-0 w-full bg-gray-900/80 flex duration-500 ${
          !menuOpen ? "h-0 overflow-hidden" : "h-auto py-4"
        } flex-col items-center gap-4 md:hidden`}
      >
        {role === "Staff" && (
          <div className="px-4 text-center mb-2">
            <p className="text-sm font-medium text-emerald-400 truncate">
              {groundName}
            </p>
            <p className="text-xs text-gray-400 truncate">{staffName}</p>
          </div>
        )}
        {links.map((link, i) => (
          <NavLink
            key={i}
            end={link.end}
            to={link.path}
            className={({ isActive }) =>
              `w-full text-center py-3 text-lg font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? "text-cyan-400 bg-cyan-500/10"
                  : "text-gray-300 hover:text-gray-100 hover:bg-white/5"
              }`
            }
            onClick={() => setMenuOpen(false)}
          >
            {link.name}
          </NavLink>
        ))}
        <LanguageSwitcher />
        {role === "Staff" ? (
          <button
            onClick={() => {
              handleStaffLogout();
              setMenuOpen(false);
            }}
            className="w-full text-center py-3 text-lg font-medium rounded-lg text-red-500 bg-red-500/10"
          >
            {t("staff.logout")}
          </button>
        ) : (
          isLogin && (
            <Logout
              setIslogin={setIslogin}
              setRole={setRole}
              menuOpen={menuOpen}
            />
          )
        )}
      </div>
    </header>
  );
}
