import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  MoreVertical,
  Video,
  Image as ImageIcon,
  Mic,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Trash2,
  FileText,
  Eye,
  Download,
} from 'lucide-react';
import { CaseReport, ViewMode } from '../types';

interface HistoryViewProps {
  cases: CaseReport[];
  onSelectCase: (caseItem: CaseReport, view?: ViewMode) => void;
  onDeleteCase?: (id: string) => void;
}

const CASES_PER_PAGE = 10;

export const HistoryView: React.FC<HistoryViewProps> = ({
  cases,
  onSelectCase,
  onDeleteCase,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaFilter, setMediaFilter] = useState<
    'All' | 'video' | 'image' | 'audio'
  >('All');

  const [riskFilter, setRiskFilter] = useState<
    'All' | 'Likely Deepfake' | 'Authentic' | 'Suspicious'
  >('All');

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !query ||
        c.caseNumber.toLowerCase().includes(query) ||
        c.fileName.toLowerCase().includes(query);

      const matchesMedia =
        mediaFilter === 'All' || c.mediaType === mediaFilter;

      const matchesRisk =
        riskFilter === 'All' || c.riskLevel === riskFilter;

      return matchesSearch && matchesMedia && matchesRisk;
    });
  }, [cases, searchQuery, mediaFilter, riskFilter]);

  // Calculate real number of pages
  const totalPages = Math.max(
    1,
    Math.ceil(filteredCases.length / CASES_PER_PAGE)
  );

  // Reset page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, mediaFilter, riskFilter]);

  // Keep page valid if records are deleted
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Records shown on current page
  const paginatedCases = useMemo(() => {
    const startIndex = (currentPage - 1) * CASES_PER_PAGE;
    const endIndex = startIndex + CASES_PER_PAGE;

    return filteredCases.slice(startIndex, endIndex);
  }, [filteredCases, currentPage]);

  // Visible range
  const showingFrom =
    filteredCases.length === 0
      ? 0
      : (currentPage - 1) * CASES_PER_PAGE + 1;

  const showingTo = Math.min(
    currentPage * CASES_PER_PAGE,
    filteredCases.length
  );

  // Page numbers
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Analysis History
        </h1>

        <p className="text-slate-600 text-sm mt-1">
          Review and manage past verification logs and forensic reports.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Case ID or file..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-mono placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 text-xs font-mono">

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Media:</span>

          <select
            value={mediaFilter}
            onChange={(e) =>
              setMediaFilter(
                e.target.value as
                  | 'All'
                  | 'video'
                  | 'image'
                  | 'audio'
              )
            }
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 focus:outline-hidden"
          >
            <option value="All">All</option>
            <option value="video">Video</option>
            <option value="image">Image</option>
            <option value="audio">Audio</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Risk:</span>

          <select
            value={riskFilter}
            onChange={(e) =>
              setRiskFilter(
                e.target.value as
                  | 'All'
                  | 'Likely Deepfake'
                  | 'Authentic'
                  | 'Suspicious'
              )
            }
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 focus:outline-hidden"
          >
            <option value="All">All</option>
            <option value="Likely Deepfake">Deepfake</option>
            <option value="Suspicious">Suspicious</option>
            <option value="Authentic">Authentic</option>
          </select>
        </div>
      </div>

      {/* Cases */}
      <div className="space-y-3.5">

        {paginatedCases.map((c) => {
          const isDeepfake =
            c.riskLevel === 'Likely Deepfake' ||
            c.riskScore > 60;

          return (
            <div
              key={c.id}
              className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs relative hover:border-blue-300 transition-all"
            >

              {/* Top */}
              <div className="flex items-start justify-between">

                <div>
                  <span className="font-mono text-xs font-bold text-slate-500">
                    {c.caseNumber}
                  </span>

                  <h3
                    onClick={() =>
                      onSelectCase(c, 'case-detail')
                    }
                    className="font-mono text-sm sm:text-base font-bold text-slate-900 mt-0.5 hover:text-blue-600 cursor-pointer truncate max-w-[200px] sm:max-w-md"
                  >
                    {c.fileName}
                  </h3>

                  <div className="flex items-center gap-2 mt-2 text-xs font-mono text-slate-400">

                    {c.mediaType === 'video' ? (
                      <Video className="w-3.5 h-3.5" />
                    ) : c.mediaType === 'audio' ? (
                      <Mic className="w-3.5 h-3.5" />
                    ) : (
                      <ImageIcon className="w-3.5 h-3.5" />
                    )}

                    <span className="capitalize">
                      {c.mediaType}
                    </span>

                    <span>•</span>

                    <Calendar className="w-3.5 h-3.5" />

                    <span>{c.scannedAt}</span>
                  </div>
                </div>

                {/* Menu */}
                <div className="relative">

                  <button
                    onClick={() =>
                      setActiveMenuId(
                        activeMenuId === c.id
                          ? null
                          : c.id
                      )
                    }
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {activeMenuId === c.id && (
                    <div className="absolute right-0 top-8 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-20 font-mono text-xs animate-in fade-in duration-100">

                      <button
                        onClick={() => {
                          onSelectCase(c, 'case-detail');
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>Case Overview</span>
                      </button>

                      <button
                        onClick={() => {
                          onSelectCase(c, 'forensic-detail');
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl"
                      >
                        <FileText className="w-3.5 h-3.5 text-purple-600" />
                        <span>Forensic Report</span>
                      </button>

                      <button
                        onClick={() => {
                          onSelectCase(c, 'evidence-report');
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Download Dossier</span>
                      </button>

                      {onDeleteCase && (
                        <button
                          onClick={() => {
                            onDeleteCase(c.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl pt-1.5 border-t border-slate-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Log</span>
                        </button>
                      )}

                    </div>
                  )}
                </div>
              </div>

              {/* Risk */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">

                {isDeepfake ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold font-mono">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Likely Deepfake</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Authentic</span>
                  </div>
                )}

                <span
                  className={`font-mono text-xs font-bold ${
                    isDeepfake
                      ? 'text-rose-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {c.riskScore}%
                </span>

              </div>
            </div>
          );
        })}

        {/* Empty */}
        {filteredCases.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8">

            <p className="text-sm font-bold text-slate-700">
              No cases matched your filter.
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Try searching with a different keyword or resetting filters.
            </p>

          </div>
        )}

      </div>

      {/* Dynamic Pagination */}
      {filteredCases.length > 0 && (
        <div className="pt-4 flex flex-col items-center gap-3">

          <span className="text-xs font-mono text-slate-500">
            Showing {showingFrom}-{showingTo} of {filteredCases.length} cases
          </span>

          {/* Only show pagination if there is more than one page */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5 text-xs font-mono">

              {/* Previous */}
              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.max(prev - 1, 1)
                  )
                }
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
              >
                Previous
              </button>

              {/* Page Numbers */}
              {pageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next */}
              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, totalPages)
                  )
                }
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
              >
                Next
              </button>

            </div>
          )}

        </div>
      )}

    </div>
  );
};