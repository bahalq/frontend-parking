import { useTranslation } from "react-i18next";

export default function Pagination({ currentPage, lastPage, onPageChange }) {
  const { t } = useTranslation();

  if (lastPage <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6 px-2">
      <p className="text-sm text-zinc-400">
        {t("pagination.page", "Page")} {currentPage} {t("pagination.of", "of")} {lastPage}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-700 hover:border-zinc-600 disabled:hover:bg-zinc-800 disabled:hover:border-zinc-700"
        >
          {t("pagination.previous", "Previous")}
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
          className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-700 hover:border-zinc-600 disabled:hover:bg-zinc-800 disabled:hover:border-zinc-700"
        >
          {t("pagination.next", "Next")}
        </button>
      </div>
    </div>
  );
}
