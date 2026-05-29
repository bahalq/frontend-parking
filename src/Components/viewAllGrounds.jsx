import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ImageCarousel from "./ImageCarousel";
import Pagination from "./Pagination";
import { api } from "../services/api";
import Swal from "../utils/swal";
import AdminLayout from "./Layouts/AdminLayout";
import GlassButton from "../UI/GlassButton";
import { FaMapMarkerAlt, FaSyncAlt, FaTrash, FaCog } from "react-icons/fa";

export default function ViewGrounds() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchGrounds = useCallback((pageNumber) => {
    setLoading(true);
    api.getAllGrounds(pageNumber)
      .then((data) => {
        if (data.success) {
          const paginator = data.grounds;
          if (paginator && paginator.data) {
            setGrounds(paginator.data);
            setLastPage(paginator.last_page || 1);
            setPage(paginator.current_page || 1);
          } else if (Array.isArray(paginator)) {
            setGrounds(paginator);
            setLastPage(1);
            setPage(1);
          } else {
            setGrounds([]);
            setLastPage(1);
            setPage(1);
          }
          setError(null);
        } else if (data.status === 403) {
          setError(data.message);
        } else if (data.status === 429) {
          setError(data.message);
        } else {
          setError(t(`errors.${data.error}`) || t("errors.server_error"));
        }
      })
      .catch(() => {
        setError(t("errors.server_error"));
      })
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    fetchGrounds(1);
  }, [fetchGrounds]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= lastPage) {
      fetchGrounds(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: t("confirm.deleteGround"),
      text: t("confirm.deleteMessage"),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t("confirm.yes"),
      cancelButtonText: t("confirm.cancel"),
      background: '#09090b',
      color: '#fff',
    });

    if (!result.isConfirmed) return;

    try {
      const data = await api.deleteGround(id);
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: t("success.deleted"),
          text: t("success.ground_deleted"),
          background: '#09090b',
          color: '#fff',
          confirmButtonColor: '#10b981',
        });
        setGrounds((prev) => prev.filter((g) => g.id !== id));
      }
    } catch (err) {
      // handled
    }
  };

  if (loading) return (
    <AdminLayout>
      <div className="flex justify-center items-center h-[60vh] bg-transparent">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan shadow-glass-cyan"></div>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div className="text-start">
            <h1 className="text-3xl font-black bg-gradient-to-r from-brand-cyan to-brand-violet bg-clip-text text-transparent uppercase tracking-wider">
              {t("viewGrounds")}
            </h1>
            <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest font-mono font-semibold">
              {t("admin.view_grounds_subtitle", "Manage your network of parking facilities")}
            </p>
          </div>
          <GlassButton 
            variant="cyan"
            onClick={() => fetchGrounds(1)}
            className="px-4 py-2 font-bold uppercase text-xs tracking-wider"
          >
            <FaSyncAlt className="w-3 h-3" />
            {t("refresh")}
          </GlassButton>
        </div>

        {grounds.length === 0 ? (
          <div className="glass-panel rounded-3xl p-20 text-center border border-white/5">
            <p className="text-zinc-500 font-mono uppercase tracking-widest">{t("noGrounds")}</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {grounds.map((g) => (
              <div
                key={g.id}
                className="overflow-hidden rounded-3xl border border-white/5 bg-zinc-950/40 backdrop-blur-md shadow-2xl transition-all duration-300 hover:border-white/10 group"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-[360px] md:flex-shrink-0 relative overflow-hidden">
                    {g.images && g.images.length > 0 ? (
                      <ImageCarousel images={g.images} />
                    ) : (
                      <div className="flex h-64 items-center justify-center bg-zinc-900 text-[10px] font-mono uppercase font-bold text-zinc-500">
                        {t("no_images")}
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-zinc-950/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-mono font-bold text-white z-10">
                      ID: #{g.id}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-6 p-6 sm:p-8 text-start">
                    <div className="space-y-3">
                      <h2 className="break-words text-2xl font-black text-white leading-tight group-hover:text-brand-cyan transition-colors">{g.name}</h2>
                      <div className="flex items-center gap-2 text-zinc-400">
                        <FaMapMarkerAlt className="text-brand-violet text-sm" />
                        <span className="text-sm font-medium tracking-wide">{g.city}</span>
                      </div>

                      {g.latitude && g.longitude && (
                        <a
                          href={`https://www.google.com/maps?q=${g.latitude},${g.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-cyan hover:text-white transition-all underline-offset-4 hover:underline"
                        >
                          {t("viewOnMap")}
                        </a>
                      )}
                    </div>

                    <div className="mt-auto flex flex-wrap gap-4 pt-6 border-t border-white/5">
                      <button
                        onClick={() => navigate(`/admin/grounds/${g.id}/terrains`)}
                        className="flex-1 min-h-12 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 hover:bg-brand-cyan hover:text-white hover:shadow-glass-cyan transition-all duration-300 text-brand-cyan text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                        <FaCog />
                        {t("booking.manage_terrains.title")}
                      </button>

                      <button
                        onClick={() => handleDelete(g.id)}
                        className="px-6 min-h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white transition-all duration-300 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                        <FaTrash />
                        {t("delete")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination currentPage={page} lastPage={lastPage} onPageChange={handlePageChange} />
      </div>
    </AdminLayout>
  );
}
