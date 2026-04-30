// components/auth.jsx — LoginPage & RegisterPage

const { useState: useAuthState, useContext: useAuthCtx } = React;

// ─── Shared field wrapper ────────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-xs font-medium text-slate-400">{label}</label>
        {hint && <span className="text-[11px] text-slate-600">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputCls =
  'w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 ' +
  'placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all';

// ─── Logo mark ──────────────────────────────────────────────────────────────
function KanbanLogo() {
  return (
    <div className="flex items-center gap-2.5 justify-center mb-8">
      <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
          <rect x="2" y="2" width="7" height="16" rx="2"/>
          <rect x="11" y="2" width="7" height="10" rx="2"/>
        </svg>
      </div>
      <span className="text-white font-bold text-lg tracking-tight">Kanban</span>
    </div>
  );
}

// ─── Demo credentials hint ───────────────────────────────────────────────────
function DemoHint({ onFill }) {
  const accounts = [
    { label: 'Admin', email: 'admin@kanban.app', password: 'admin123' },
    { label: 'Alice', email: 'alice@example.com', password: 'alice123' },
    { label: 'Bob',   email: 'bob@example.com',  password: 'bob123'   },
  ];
  return (
    <div className="mt-4 pt-4 border-t border-slate-800">
      <p className="text-[11px] text-slate-600 text-center mb-2">Comptes de démo</p>
      <div className="flex gap-1.5 justify-center">
        {accounts.map((a) => (
          <button
            key={a.email}
            type="button"
            onClick={() => onFill(a.email, a.password)}
            className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-400 transition-colors"
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── LoginPage ───────────────────────────────────────────────────────────────
function LoginPage() {
  const { navigate, addToast, setCurrentUser } = useAuthCtx(window.AppContext);
  const [email, setEmail]       = useAuthState('');
  const [password, setPassword] = useAuthState('');
  const [remember, setRemember] = useAuthState(false);
  const [error, setError]       = useAuthState('');
  const [loading, setLoading]   = useAuthState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const auth = await Services.login({ email, password, rememberMe: remember });
      const user = MOCK_DATA.users.find((u) => u.id === auth.userId);
      setCurrentUser({ id: user.id, email: user.email, role: user.role });
      addToast(`Bienvenue, ${auth.email.split('@')[0]} !`, 'success');
      navigate('board');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <KanbanLogo />
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <h1 className="text-lg font-semibold text-white mb-1">Connexion</h1>
          <p className="text-slate-500 text-sm mb-5">Entrez vos identifiants pour continuer.</p>

          {error && (
            <div className="mb-4 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <Field label="Email">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required placeholder="vous@exemple.com" className={inputCls} />
            </Field>
            <Field label="Mot de passe">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                required placeholder="••••••••" className={inputCls} />
            </Field>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-700 border-slate-600 accent-indigo-500" />
              <span className="text-sm text-slate-400">Se souvenir de moi</span>
            </label>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl py-2.5 text-sm transition-colors">
              {loading && <Spinner size="sm" />}
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            Pas encore de compte ?{' '}
            <button onClick={() => navigate('register')}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              S'inscrire
            </button>
          </p>

          <DemoHint onFill={(e, p) => { setEmail(e); setPassword(p); }} />
        </div>
      </div>
    </div>
  );
}

// ─── RegisterPage ─────────────────────────────────────────────────────────────
function RegisterPage() {
  const { navigate, addToast } = useAuthCtx(window.AppContext);
  const [email, setEmail]       = useAuthState('');
  const [password, setPassword] = useAuthState('');
  const [confirm, setConfirm]   = useAuthState('');
  const [error, setError]       = useAuthState('');
  const [loading, setLoading]   = useAuthState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Le mot de passe doit comporter au moins 6 caractères.'); return; }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    setLoading(true);
    try {
      await Services.register({ email, password });
      addToast('Compte créé ! Vous pouvez vous connecter.', 'success');
      navigate('login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <KanbanLogo />
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <h1 className="text-lg font-semibold text-white mb-1">Créer un compte</h1>
          <p className="text-slate-500 text-sm mb-5">Commencez gratuitement — aucune carte requise.</p>

          {error && (
            <div className="mb-4 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <Field label="Email">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required placeholder="vous@exemple.com" className={inputCls} />
            </Field>
            <Field label="Mot de passe" hint="min. 6 caractères">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                required placeholder="••••••••" className={inputCls} />
            </Field>
            <Field label="Confirmer le mot de passe">
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                required placeholder="••••••••" className={inputCls} />
            </Field>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl py-2.5 text-sm transition-colors">
              {loading && <Spinner size="sm" />}
              {loading ? 'Création…' : 'Créer le compte'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            J'ai déjà un compte.{' '}
            <button onClick={() => navigate('login')}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginPage, RegisterPage });
