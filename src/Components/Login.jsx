import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LuEyeClosed, LuEye } from "react-icons/lu";
import { api } from "../services/api";
import Swal from "../utils/swal";
const logo1 = new URL("/favicon.svg", import.meta.url).href;

export default function Login({ setIslogin, setRole }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
      Swal.fire({
        icon: "error",
        title: t("error"),
        text: t("emailRequired") + " / " + t("passwordRequired"),
        background: "#18181b",
        color: "#fff",
        confirmButtonColor: "#dc2626",
        didOpen: (popup) => {
          const content = popup.querySelector("#swal2-html-container");
          if (content) content.setAttribute("dir", "auto");
        },
      });
      return;
    }

    setLoading(true);

    try {
      const data = await api.adminLogin({ email, password });

      if (data.success && data.user) {
        if (data.redirect_hint !== "admin") {
          localStorage.removeItem("auth_token");
          Swal.fire({
            icon: "error",
            title: t("loginFailed"),
            text: t("invalidLogin"),
            background: "#18181b",
            color: "#fff",
            confirmButtonColor: "#dc2626",
            didOpen: (popup) => {
              const content = popup.querySelector("#swal2-html-container");
              if (content) content.setAttribute("dir", "auto");
            },
          });
          setLoading(false);
          return;
        }

        localStorage.removeItem("staff_user");
        setIslogin(true);
        setRole(data.user.role);
        navigate("/admin/grounds");
      } else if (data.status === 429) {
        Swal.fire({
          icon: "warning",
          title: t("tooManyRequests"),
          text: data.message || t("too_many_requests"),
          background: "#18181b",
          color: "#fff",
          confirmButtonColor: "#f59e0b",
          didOpen: (popup) => {
            const content = popup.querySelector("#swal2-html-container");
            if (content) content.setAttribute("dir", "auto");
          },
        });
      } else if (data.status === 403) {
        Swal.fire({
          icon: "error",
          title: t("accessDenied"),
          text: data.message || t("forbidden"),
          background: "#18181b",
          color: "#fff",
          confirmButtonColor: "#dc2626",
          didOpen: (popup) => {
            const content = popup.querySelector("#swal2-html-container");
            if (content) content.setAttribute("dir", "auto");
          },
        });
      } else {
        Swal.fire({
          icon: "error",
          title: t("loginFailed"),
          text: data.message || t("invalidLogin"),
          background: "#18181b",
          color: "#fff",
          confirmButtonColor: "#dc2626",
          didOpen: (popup) => {
            const content = popup.querySelector("#swal2-html-container");
            if (content) content.setAttribute("dir", "auto");
          },
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("error"),
        text: t("genericError"),
        background: "#18181b",
        color: "#fff",
        confirmButtonColor: "#dc2626",
        didOpen: (popup) => {
          const content = popup.querySelector("#swal2-html-container");
          if (content) content.setAttribute("dir", "auto");
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center flex flex-col items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <img
              src={logo1}
              alt="Logo"
              className="h-15 cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>
          <p className="text-gray-400">{t("welcome_back", "Welcome back")}</p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900/80 backdrop-blur-lg border border-zinc-800 text-gray-200 p-8 rounded-2xl shadow-2xl flex flex-col gap-5"
        >
          {/* Email Input */}
          <div className="relative">
            <input
              autoComplete="email"
              className="w-full bg-zinc-800 border border-zinc-700 hover:border-green-500/50 focus:border-green-500 focus:ring-1 focus:ring-green-500 px-4 py-3 rounded-lg placeholder-gray-500 text-white transition-all duration-200"
              type="email"
              placeholder={t("email")}
              name="email"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              autoComplete="current-password"
              className="w-full bg-zinc-800 border border-zinc-700 hover:border-green-500/50 focus:border-green-500 focus:ring-1 focus:ring-green-500 px-4 py-3 pe-10 rounded-lg placeholder-gray-500 text-white transition-all duration-200"
              type={showPassword ? "text" : "password"}
              placeholder={t("password")}
              name="password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-400 transition-colors"
            >
              {showPassword ? <LuEyeClosed size={20} /> : <LuEye size={20} />}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-green-500/20"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                {t("logging_in", "Logging in...")}
              </span>
            ) : (
              t("login")
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
