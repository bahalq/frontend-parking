import { useEffect, useState, useCallback } from "react";
import { api } from "../../services/api";
import Pagination from "../Pagination";
import { useTranslation } from "react-i18next";
import AdminLayout from "../Layouts/AdminLayout";
import GlassButton from "../../UI/GlassButton";

export default function ViewClients() {
  const { t } = useTranslation();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchClients = useCallback((pageNumber) => {
    setLoading(true);
    api.getAllClients(pageNumber)
      .then((data) => {
        if (data.success) {
          const paginator = data.clients;
          if (paginator && paginator.data) {
            setClients(paginator.data);
            setLastPage(paginator.last_page || 1);
            setPage(paginator.current_page || 1);
          } else if (Array.isArray(paginator)) {
            setClients(paginator);
            setLastPage(1);
            setPage(1);
          } else {
            setClients([]);
            setLastPage(1);
            setPage(1);
          }
        } else if (data.status === 403) {
          setError(data.message);
        } else if (data.status === 429) {
          setError(data.message);
        } else {
          setError(t("errors.fetchClients"));
        }
      })
      .catch((err) => {
        setError(t("errors.fetchClients"));
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchClients(1);
  }, [fetchClients]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= lastPage) {
      fetchClients(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[60vh] bg-transparent">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan shadow-glass-cyan"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div className="text-start">
            <h1 className="text-3xl font-black bg-gradient-to-r from-brand-cyan to-brand-violet bg-clip-text text-transparent uppercase tracking-wider">
              {t("allClients", "Driver Registry")}
            </h1>
            <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest font-mono font-semibold">
              {t("admin.clients_subtitle", "Verified system users and traffic participants")}
            </p>
          </div>
          <GlassButton 
            variant="cyan"
            onClick={() => fetchClients(1)}
            className="px-4 py-2 font-bold uppercase text-xs tracking-wider"
          >
            {t("refresh")}
          </GlassButton>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-2xl mb-6">
            {error}
          </div>
        )}

        <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-950/40 text-zinc-500 uppercase tracking-wider font-mono">
                  <th className="px-6 py-4 font-bold text-start">{t("name")}</th>
                  <th className="px-6 py-4 font-bold text-start">{t("email")}</th>
                  <th className="px-6 py-4 font-bold text-start">{t("phone")}</th>
                  <th className="px-6 py-4 font-bold text-start">{t("booking.placeholders.cin")}</th>
                  <th className="px-6 py-4 font-bold text-start">Join Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-zinc-500 font-mono">
                      {t("noClients")}
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr key={client.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 text-start">
                        <div className="font-bold text-white text-sm">{`${client.first_name} ${client.last_name}`}</div>
                        <div className="text-[10px] text-zinc-500 font-mono uppercase">ID: #{client.id}</div>
                      </td>
                      <td className="px-6 py-4 text-zinc-300 font-mono">
                        {client.email}
                      </td>
                      <td className="px-6 py-4 text-zinc-300 font-mono">
                        {client.phone}
                      </td>
                      <td className="px-6 py-4 text-brand-cyan font-bold font-mono uppercase">
                        {client.cin || t("n_a")}
                      </td>
                      <td className="px-6 py-4 text-zinc-500 font-mono">
                        {new Date(client.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination currentPage={page} lastPage={lastPage} onPageChange={handlePageChange} />
      </div>
    </AdminLayout>
  );
}
