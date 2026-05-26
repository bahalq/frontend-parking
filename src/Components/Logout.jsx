import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../services/api";

export default function Logout({ setIslogin, setRole, menuOpen, className }) {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
    localStorage.removeItem("auth_token");
    localStorage.removeItem("staff_user");
    setRole("");
    setIslogin(false);
    navigate("/login");
  };
  const { t } = useTranslation();

  return (
    <>
      <button
        onClick={handleLogout}
        className={
          className ||
          "px-5 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 text-sm font-medium cursor-pointer"
        }
      >
        {t("logout")}
      </button>
    </>
  );
}
