import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFound({ isLogin }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [count, setCount] = useState(3);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLogin) {
        navigate("/page");
      } else {
        navigate("/");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isLogin, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => prev - 1);
    }, 990);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen backdrop-brightness-50 w-screen flex flex-col justify-center items-center text-white">
      <h1 className="text-6xl font-bold mb-4">{t("booking.not_found.title")}</h1>
      <p className="text-2xl mb-4">{t("booking.not_found.sub_title")}</p>
      <p className="text-gray-400">
        {isLogin 
          ? t("booking.not_found.redirecting_dashboard", { count })
          : t("booking.not_found.redirecting_home", { count })
        }
      </p>
    </div>
  );
}
