// components/admin.jsx — AdminView

const { useState: useAdmState, useContext: useAdmCtx, useEffect: useAdmEffect } = React;

function AdminView() {
  const { users, adminSelectedUserId, setAdminSelectedUserId, currentUser } = useAdmCtx(window.AppContext);
  const [searchEmail, setSearchEmail]   = useAdmState('');
  const [searchResult, setSearchResult] = useAdmState(null);
  const [searchError, setSearchError]   = useAdmState('');
  const [searching, setSearching]       = useAdmState(false);

  // default: show admin's own board
  useAdmEffect(() => {
    if (!adminSelectedUserId && currentUser) setAdminSelectedUserId(currentUser.id);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;
    setSearching(true);
    setSearchError('');
    setSearchResult(null);
    try {
      const u = await Services.getUserByEmail(searchEmail.trim());
      setSearchResult(u);
      setAdminSelectedUserId(u.id);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const selected = users.find((u) => u.id === adminSelectedUserId);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

      {/* ── Admin banner ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-6 py-2.5 bg-indigo-600/10 border-b border-indigo-600/20 flex-shrink-0">
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse flex-shrink-0" />
        <span className="text-sm font-medium text-indigo-400">
          Mode Admin — accès complet à tous les boards
        </span>
        {selected && (
          <>
            <span className="text-indigo-700 text-xs">·</span>
            <span className="text-xs text-indigo-500">
              Consultation : <strong className="text-indigo-300">{selected.email}</strong>
            </span>
          </>
        )}
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Sidebar: user list + search ──────────────────────────────── */}
        <div className="w-60 flex-shrink-0 border-r border-slate-800 flex flex-col overflow-y-auto bg-slate-900/40">
          <div className="p-4 flex-1">
            <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-3">
              Utilisateurs
            </p>

            <div className="space-y-1">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => { setAdminSelectedUserId(u.id); setSearchResult(null); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2.5
                    ${adminSelectedUserId === u.id
                      ? 'bg-indigo-600/20 border border-indigo-600/30 text-indigo-300'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300 border border-transparent'}`}
                >
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${u.role === 'Admin' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    {u.email[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium truncate">{u.email.split('@')[0]}</p>
                    <p className="text-[10px] text-slate-600 truncate">{u.email.split('@')[1]}</p>
                  </div>
                  {u.role === 'Admin' && (
                    <span className="ml-auto text-[10px] bg-indigo-600/20 text-indigo-400 px-1.5 py-0.5 rounded-md font-medium flex-shrink-0">
                      Admin
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── Email search (GET /api/Users/{email}) ─────────────────── */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-2">
                Recherche par email
              </p>
              <form onSubmit={handleSearch} className="flex flex-col gap-2">
                <input
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="email@exemple.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs
                    text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button type="submit" disabled={searching || !searchEmail.trim()}
                  className="py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs
                    font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5">
                  {searching && <Spinner size="sm" />}
                  {searching ? 'Recherche…' : 'Rechercher'}
                </button>
              </form>

              {searchError && (
                <p className="mt-2 text-[11px] text-red-400">{searchError}</p>
              )}

              {searchResult && (
                <div className="mt-2 p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 space-y-0.5">
                  <p className="font-semibold text-slate-200">{searchResult.email}</p>
                  <p className="text-slate-500">
                    {searchResult.role} · ID {searchResult.id}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Board panel ──────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {adminSelectedUserId ? (
            <Board boardUserId={adminSelectedUserId} />
          ) : (
            <EmptyState
              icon="👤"
              title="Aucun utilisateur sélectionné"
              subtitle="Choisissez un utilisateur dans la liste pour consulter son board."
            />
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AdminView });
