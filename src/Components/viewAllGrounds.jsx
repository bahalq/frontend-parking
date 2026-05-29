import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ImageCarousel from "./ImageCarousel";
import Pagination from "./Pagination";
import { api } from "../services/api";
import Swal from "../utils/swal";
import AdminLayout from "./Layouts/AdminLayout";

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
      text: t("confirm.deleteMessage") || "Are you sure you want to delete this ground?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t("confirm.yes"),
      cancelButtonText: t("confirm.cancel"),
      background: '#18181b',
      color: '#fff',
    });

    if (!result.isConfirmed) return;

    try {
      const data = await api.deleteGround(id);
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: t("success.deleted") || 'Deleted',
          text: t("success.ground_deleted") || 'Ground deleted successfully',
          background: '#18181b',
          color: '#fff',
          confirmButtonColor: '#16a34a',
        });
        setGrounds((prev) => prev.filter((g) => g.id !== id));
      } else if (data.status === 403) {
        Swal.fire({
          icon: 'error',
          title: 'Access Denied',
          text: data.message || 'You do not have permission.',
          background: '#18181b',
          color: '#fff',
          confirmButtonColor: '#dc2626',
        });
      } else if (data.status === 429) {
        Swal.fire({
          icon: 'warning',
          title: 'Too Many Requests',
          text: data.message,
          background: '#18181b',
          color: '#fff',
          confirmButtonColor: '#f59e0b',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: t(`errors.${data.error}`) || data.error || "Failed to delete ground",
          background: '#18181b',
          color: '#fff',
          confirmButtonColor: '#dc2626',
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: t("errors.server_error") || "Server error, please try again later",
        background: '#18181b',
        color: '#fff',
        confirmButtonColor: '#dc2626',
      });
    }
  };

  if (loading) return (
    <AdminLayout>
      <p className="p-4 text-white text-center">{t("loading")}</p>
    </AdminLayout>
  );

  if (error) return (
    <AdminLayout>
      <p className="p-4 text-red-500 text-center">{error}</p>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-6xl px-3 py-4 text-white sm:px-6">
        <h1 className="mb-6 text-2xl font-bold sm:text-3xl text-start">{t("viewGrounds")}</h1>

        {grounds.length === 0 && <p className="text-center text-zinc-500">{t("noGrounds")}</p>}

        <div className="grid gap-4 sm:gap-5">
          {grounds.map((g) => (
            <div
              key={g.id}
              className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 shadow-lg"
            >
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-[320px] md:flex-shrink-0">
                  {g.images && g.images.length > 0 ? (
                    <ImageCarousel images={g.images} />
                  ) : (
                    <div className="flex h-52 items-center justify-center bg-zinc-900 text-sm text-zinc-400">
                      {t("no_images")}
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-4 p-3 sm:p-5">
                  <div className="space-y-2">
                    <h2 className="break-words text-lg font-semibold leading-tight sm:text-xl text-start">{g.name}</h2>
                    <p className="break-words text-sm text-zinc-300 sm:text-base text-start">{g.city}</p>

                    {g.latitude && g.longitude && (
                      <div className="flex text-start">
                        <a
                          href={`https://www.google.com/maps?q=${g.latitude},${g.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-fit text-sm text-blue-400 underline underline-offset-2 hover:text-blue-300"
                        >
                          {t("viewOnMap")}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto grid grid-cols-1 gap-3 sm:flex sm:flex-row sm:flex-wrap">
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="min-h-11 w-full rounded-lg border border-red-900 bg-red-950 px-4 py-2 text-sm font-medium text-white transition hover:translate-y-0.5 sm:w-auto"
                    >
                      {t("delete")}
                    </button>

                    <button
                      onClick={() => navigate(`/admin/grounds/${g.id}/terrains`)}
                      className="min-h-11 w-full rounded-lg border border-green-900 bg-green-950 px-4 py-2 text-sm font-medium text-white transition hover:translate-y-0.5 sm:w-auto"
                    >
                      {t("booking.manage_terrains.title")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Pagination currentPage={page} lastPage={lastPage} onPageChange={handlePageChange} />
      </div>
    </AdminLayout>
  );
}
