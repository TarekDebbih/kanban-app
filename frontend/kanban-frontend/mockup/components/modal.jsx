// components/modal.jsx — TicketModal

const { useState: useMState, useEffect: useMEffect } = React;

function TicketModal({ ticket, columns, onUpdate, onDelete, onClose }) {
  const [title, setTitle]           = useMState(ticket.title);
  const [desc, setDesc]             = useMState(ticket.description || '');
  const [hours, setHours]           = useMState(String(ticket.timeSpentHours ?? 0));
  const [colId, setColId]           = useMState(ticket.kanbanColumnId);
  const [saving, setSaving]         = useMState(false);
  const [deleting, setDeleting]     = useMState(false);
  const [confirmDel, setConfirmDel] = useMState(false);
  const [dirty, setDirty]           = useMState(false);

  // track unsaved changes
  useMEffect(() => {
    const changed =
      title !== ticket.title ||
      desc !== (ticket.description || '') ||
      parseFloat(hours) !== ticket.timeSpentHours ||
      colId !== ticket.kanbanColumnId;
    setDirty(changed);
  }, [title, desc, hours, colId]);

  // ESC to close
  useMEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const fmtCreated = (iso) =>
    new Date(iso).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' });

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onUpdate(ticket.id, {
      title: title.trim(),
      description: desc,
      timeSpentHours: parseFloat(hours) || 0,
      kanbanColumnId: Number(colId),
    });
    setSaving(false);
    setDirty(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(ticket.id);
    setDeleting(false);
  };

  const labelCls = 'block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5';
  const fieldCls =
    'w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 ' +
    'placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all';

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[88vh]">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-slate-600 text-xs font-mono">#{ticket.id}</span>
            <span className="text-slate-700 text-xs">·</span>
            <span className="text-slate-500 text-xs">{fmtCreated(ticket.createdAt)}</span>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors text-xl leading-none">
            ×
          </button>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Title */}
          <div>
            <label className={labelCls}>Titre</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              className={fieldCls} placeholder="Titre du ticket" />
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)}
              rows={5} placeholder="Ajouter une description…"
              className={`${fieldCls} resize-none leading-relaxed`} />
          </div>

          {/* Time + Column row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Temps passé (h)</label>
              <input type="number" step="0.25" min="0" value={hours}
                onChange={(e) => setHours(e.target.value)} className={fieldCls} />
            </div>
            <div>
              <label className={labelCls}>Colonne</label>
              <select value={colId} onChange={(e) => setColId(Number(e.target.value))}
                className={`${fieldCls} bg-slate-800`}>
                {columns.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-slate-800 flex-shrink-0">
          {confirmDel ? (
            <>
              <span className="text-xs text-red-400 flex-1">Confirmer la suppression ?</span>
              <button onClick={handleDelete} disabled={deleting}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg font-medium transition-colors flex items-center gap-1.5">
                {deleting && <Spinner size="sm" />}Supprimer
              </button>
              <button onClick={() => setConfirmDel(false)}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-400 text-xs rounded-lg transition-colors">
                Annuler
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setConfirmDel(true)}
                className="px-3 py-1.5 text-red-400 hover:text-red-300 text-xs rounded-lg hover:bg-red-500/10 transition-colors">
                Supprimer
              </button>
              <div className="flex-1" />
              <button onClick={onClose}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs rounded-lg transition-colors">
                Fermer
              </button>
              <button onClick={handleSave} disabled={saving || !title.trim() || !dirty}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-medium
                  rounded-lg transition-colors flex items-center gap-1.5">
                {saving && <Spinner size="sm" />}
                {dirty ? 'Sauvegarder' : 'Sauvegardé'}
              </button>
            </>
          )}
        </div>
      </div>
    </ModalBackdrop>
  );
}

Object.assign(window, { TicketModal });
