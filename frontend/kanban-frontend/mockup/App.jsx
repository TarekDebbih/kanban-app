// App.jsx — Root app: state, context, routing, layout

const { useState: useAppState, useEffect: useAppEffect, useContext: useAppCtx } = React;

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ route, navigate, currentUser, darkMode, setDarkMode, onLogout }) {
  const navItem = (id, label, icon) => (
    <button
      onClick={() => navigate(id)}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all duration-100
        ${route === id
          ? 'bg-slate-800 text-slate-100 font-medium'
          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
    >
      <span className="text-base leading-none w-4 text-center">{icon}</span>
      {label}
    </button>
  );

  return (
    <aside className="w-[200px] flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col py-4 gap-1">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 mb-5">
        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-600/30 flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
            <rect x="1" y="1" width="6" height="14" rx="1.5"/>
            <rect x="9" y="1" width="6" height="9"  rx="1.5"/>
          </svg>
        </div>
        <span className="text-white font-bold text-[15px] tracking-tight">Kanban</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5">
        {navItem('board', 'Mon Board', '▦')}
        {currentUser?.role === 'Admin' && navItem('admin', 'Admin', '⊙')}
      </nav>

      {/* Bottom actions */}
      <div className="px-2 space-y-0.5 mt-2">
        <button
          onClick={() => setDarkMode((v) => !v)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors"
        >
          <span className="text-base leading-none w-4 text-center">{darkMode ? '☀' : '🌙'}</span>
          {darkMode ? 'Mode clair' : 'Mode sombre'}
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <span className="text-base leading-none w-4 text-center">→</span>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────
function TopBar({ currentUser, route }) {
  const labels = { board: 'Mon Board', admin: 'Administration' };
  return (
    <header className="h-12 flex items-center px-5 border-b border-slate-800 bg-slate-900/70 backdrop-blur-sm flex-shrink-0 gap-4">
      <h2 className="text-[13px] font-semibold text-slate-300 flex-1">{labels[route] || ''}</h2>
      <div className="flex items-center gap-2.5">
        <Badge variant={currentUser.role === 'Admin' ? 'admin' : 'standard'}>
          {currentUser.role}
        </Badge>
        <span className="text-[13px] text-slate-400 max-w-[180px] truncate">{currentUser.email}</span>
        <div className="w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
          {currentUser.email[0].toUpperCase()}
        </div>
      </div>
    </header>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
function App() {
  const [currentUser, setCurrentUser]               = useAppState(null);
  const [route, setRoute]                           = useAppState('login');
  const [darkMode, setDarkMode]                     = useAppState(true);
  const [columns, setColumns]                       = useAppState(() => MOCK_DATA.columns.map((c) => ({ ...c })));
  const [tickets, setTickets]                       = useAppState(() => MOCK_DATA.tickets.map((t) => ({ ...t })));
  const [users]                                     = useAppState(() => MOCK_DATA.users.map(({ password: _pw, ...u }) => u));
  const [toasts, setToasts]                         = useAppState([]);
  const [adminSelectedUserId, setAdminSelectedUserId] = useAppState(null);

  // Apply dark class to <html>
  useAppEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Restore session on mount
  useAppEffect(() => {
    const stored = Services.getStoredAuth();
    if (stored) {
      const user = MOCK_DATA.users.find((u) => u.id === stored.userId);
      if (user) {
        setCurrentUser({ id: user.id, email: user.email, role: user.role });
        setRoute('board');
      }
    }
  }, []);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const navigate = (newRoute) => {
    if (!currentUser && !['login', 'register'].includes(newRoute)) { setRoute('login'); return; }
    if (newRoute === 'admin' && currentUser?.role !== 'Admin') return;
    setRoute(newRoute);
  };

  const handleLogout = () => {
    Services.logout();
    setCurrentUser(null);
    setRoute('login');
    addToast('Vous êtes déconnecté.', 'info');
  };

  const ctx = {
    currentUser, setCurrentUser,
    route, navigate,
    darkMode, setDarkMode,
    columns, setColumns,
    tickets, setTickets,
    users,
    addToast,
    adminSelectedUserId, setAdminSelectedUserId,
  };

  const isAuth = Boolean(currentUser);

  return (
    <window.AppContext.Provider value={ctx}>
      {/* Theme wrapper — bg and text base */}
      <div className={`${darkMode ? 'dark' : ''} min-h-screen flex flex-col bg-slate-950 text-slate-200`}>
        {!isAuth ? (
          route === 'register' ? <RegisterPage /> : <LoginPage />
        ) : (
          <div className="flex h-screen overflow-hidden">
            <Sidebar
              route={route}
              navigate={navigate}
              currentUser={currentUser}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              onLogout={handleLogout}
            />
            <div className="flex-1 flex flex-col min-h-0 min-w-0">
              <TopBar currentUser={currentUser} route={route} />
              <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {route === 'board' && <Board boardUserId={currentUser.id} />}
                {route === 'admin' && currentUser.role === 'Admin' && <AdminView />}
              </main>
            </div>
          </div>
        )}

        <Toast toasts={toasts} remove={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
      </div>
    </window.AppContext.Provider>
  );
}

// ─── Mount ────────────────────────────────────────────────────────────────────
const rootEl = document.getElementById('root');
ReactDOM.createRoot(rootEl).render(<App />);
