// ui.jsx — Shared primitives: AppContext, Toast, Spinner, Badge, ConfirmDialog

window.AppContext = React.createContext(null);

// ─── Toast stack ────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium pointer-events-auto
            transition-all duration-300 animate-[slideIn_0.2s_ease-out]
            ${t.type === 'success'
              ? 'bg-emerald-500 text-white'
              : t.type === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-slate-700 text-slate-200'}`}
        >
          <span className="text-base leading-none">
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
          </span>
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => remove(t.id)}
            className="opacity-60 hover:opacity-100 transition-opacity ml-1 text-base leading-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Spinner ────────────────────────────────────────────────────────────────
function Spinner({ size = 'md', className = '' }) {
  const sz = size === 'sm' ? 'w-3.5 h-3.5 border' : size === 'lg' ? 'w-7 h-7 border-2' : 'w-5 h-5 border-2';
  return (
    <span
      className={`inline-block ${sz} border-current border-t-transparent rounded-full animate-spin opacity-60 ${className}`}
    />
  );
}

// ─── Badge ──────────────────────────────────────────────────────────────────
function Badge({ children, variant = 'default' }) {
  const map = {
    default:  'bg-slate-700/80 text-slate-400 dark:bg-slate-700/80 dark:text-slate-400',
    admin:    'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30',
    standard: 'bg-slate-700/50 text-slate-400',
    success:  'bg-emerald-600/20 text-emerald-400',
    hours:    'bg-slate-800 text-slate-500 border border-slate-700/60 font-mono',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium leading-tight ${map[variant] || map.default}`}>
      {children}
    </span>
  );
}

// ─── Modal backdrop ─────────────────────────────────────────────────────────
function ModalBackdrop({ onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {children}
    </div>
  );
}

// ─── Confirm dialog ─────────────────────────────────────────────────────────
function ConfirmDialog({ message, confirmLabel = 'Supprimer', onConfirm, onCancel, danger = true }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-80 shadow-2xl">
        <p className="text-slate-200 text-sm leading-relaxed mb-6">{message}</p>
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 text-sm rounded-xl font-medium text-white transition-colors ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-8 text-center">
      <div className="w-14 h-14 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center text-2xl">
        {icon}
      </div>
      <div>
        <p className="text-slate-300 font-medium text-sm">{title}</p>
        {subtitle && <p className="text-slate-600 text-xs mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

Object.assign(window, { Toast, Spinner, Badge, ModalBackdrop, ConfirmDialog, EmptyState });
