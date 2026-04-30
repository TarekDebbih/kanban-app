// components/board.jsx — TicketCard, Column, Board (with HTML5 drag-and-drop)

const { useState: useBState, useContext: useBCtx, useRef: useBRef } = React;

// ─── helpers ─────────────────────────────────────────────────────────────────
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

// ─── TicketCard ───────────────────────────────────────────────────────────────
function TicketCard({ ticket, ghost, dropAbove, onDragStart, onDragEnd, onDragOver, onDrop, onClick }) {
  return (
    <div
      draggable
      onDragStart={(e) => { e.stopPropagation(); onDragStart(e, ticket.id); }}
      onDragEnd={onDragEnd}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); onDragOver(ticket.id); }}
      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDrop('ticket', ticket.id); }}
      onClick={onClick}
      className={`group relative select-none cursor-pointer rounded-xl border p-3 transition-all duration-150
        ${ghost ? 'opacity-30 scale-[0.97]' : 'bg-slate-800/90 hover:bg-slate-800'}
        ${dropAbove ? 'border-t-2 border-t-indigo-500 border-slate-700' : 'border-slate-700/80 hover:border-slate-600'}
        hover:shadow-lg hover:shadow-black/30`}
    >
      <p className="text-[13px] font-medium text-slate-200 leading-snug mb-2 line-clamp-2">{ticket.title}</p>
      {ticket.description && (
        <p className="text-[11px] text-slate-500 line-clamp-2 mb-2 leading-relaxed">{ticket.description}</p>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-600">{fmtDate(ticket.createdAt)}</span>
        {ticket.timeSpentHours > 0 && (
          <Badge variant="hours">{ticket.timeSpentHours}h</Badge>
        )}
      </div>
    </div>
  );
}

// ─── InlineAddTicket ──────────────────────────────────────────────────────────
function InlineAddTicket({ onAdd, onCancel }) {
  const [title, setTitle] = useBState('');
  const [busy, setBusy]   = useBState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    await onAdd(title.trim());
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 px-0.5">
      <textarea
        autoFocus rows={2} value={title} onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre du ticket…"
        onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}
        className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-200
          placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
      />
      <div className="flex gap-2">
        <button type="submit" disabled={busy || !title.trim()}
          className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5">
          {busy && <Spinner size="sm" />}Ajouter
        </button>
        <button type="button" onClick={onCancel}
          className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-400 text-xs rounded-lg transition-colors">
          Annuler
        </button>
      </div>
    </form>
  );
}

// ─── Column ───────────────────────────────────────────────────────────────────
function Column({
  column, tickets,
  dnd,
  onColDragStart, onColDragEnd, onColDragOver, onColDrop,
  onTicketDragStart, onTicketDragEnd, onTicketDragOver, onTicketDrop,
  onTicketClick, onAddTicket, onUpdateColumn, onDeleteColumn,
}) {
  const [editName, setEditName]   = useBState(false);
  const [nameVal, setNameVal]     = useBState(column.name);
  const [showMenu, setShowMenu]   = useBState(false);
  const [adding, setAdding]       = useBState(false);

  const isGhost    = dnd.type === 'column' && dnd.id === column.id;
  const isColOver  = dnd.type === 'column' && dnd.overColId === column.id && dnd.id !== column.id;
  const isTickDrop = dnd.type === 'ticket' && dnd.overColId === column.id;

  const saveName = async () => {
    const trimmed = nameVal.trim();
    if (trimmed && trimmed !== column.name) await onUpdateColumn(column.id, { name: trimmed });
    else setNameVal(column.name);
    setEditName(false);
  };

  // Close menu on outside click
  const menuRef = useBRef(null);
  React.useEffect(() => {
    if (!showMenu) return;
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  return (
    <div
      draggable={!editName && !adding}
      onDragStart={(e) => { if (!editName && !adding) { e.stopPropagation(); onColDragStart(e, column.id); }}}
      onDragEnd={onColDragEnd}
      onDragOver={(e) => { e.preventDefault(); onColDragOver(column.id); }}
      onDrop={(e) => { e.preventDefault(); onColDrop(column.id); }}
      className={`flex-shrink-0 w-[272px] flex flex-col rounded-2xl border transition-all duration-150 select-none
        ${isGhost   ? 'opacity-30'                      : ''}
        ${isColOver ? 'border-indigo-500 shadow-lg shadow-indigo-500/10' : 'border-slate-800'}
        bg-slate-900/60`}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-3">
        {editName ? (
          <input autoFocus value={nameVal} onChange={(e) => setNameVal(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setNameVal(column.name); setEditName(false); }}}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-transparent border-b border-indigo-500 text-sm font-semibold text-slate-200 focus:outline-none"
          />
        ) : (
          <h3 onDoubleClick={() => setEditName(true)}
            className="flex-1 text-[13px] font-semibold text-slate-300 cursor-default truncate">
            {column.name}
          </h3>
        )}
        <span className="text-[11px] text-slate-600 font-medium tabular-nums">{tickets.length}</span>

        {/* ··· Menu */}
        <div className="relative" ref={menuRef}>
          <button onClick={(e) => { e.stopPropagation(); setShowMenu((v) => !v); }}
            className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-400 hover:bg-slate-700/60 transition-colors text-sm leading-none">
            ···
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 z-30 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-36 py-1 overflow-hidden">
              <button onClick={() => { setEditName(true); setShowMenu(false); }}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 transition-colors">
                Renommer
              </button>
              <button onClick={() => { onDeleteColumn(column.id); setShowMenu(false); }}
                className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-slate-700 transition-colors">
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Ticket list ──────────────────────────────────────────────────── */}
      <div
        className={`flex-1 flex flex-col gap-2 px-2 pb-2 overflow-y-auto max-h-[calc(100vh-230px)]
          min-h-[60px] transition-colors rounded-b-xl
          ${isTickDrop && tickets.length === 0 ? 'bg-indigo-500/5' : ''}`}
        onDragOver={(e) => { e.preventDefault(); if (dnd.type === 'ticket') onTicketDragOver(null, column.id); }}
        onDrop={(e) => { e.preventDefault(); if (dnd.type === 'ticket') onTicketDrop('column', column.id); }}
      >
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            ghost={dnd.type === 'ticket' && dnd.id === ticket.id}
            dropAbove={dnd.type === 'ticket' && dnd.overTicketId === ticket.id && dnd.id !== ticket.id}
            onDragStart={onTicketDragStart}
            onDragEnd={onTicketDragEnd}
            onDragOver={(tid) => onTicketDragOver(tid, column.id)}
            onDrop={onTicketDrop}
            onClick={() => onTicketClick(ticket)}
          />
        ))}

        {tickets.length === 0 && !adding && (
          <div className={`flex items-center justify-center text-[11px] rounded-xl border-2 border-dashed min-h-[60px] transition-colors
            ${isTickDrop ? 'border-indigo-500/50 text-indigo-600' : 'border-slate-800 text-slate-700'}`}>
            Déposer ici
          </div>
        )}

        {adding && (
          <InlineAddTicket
            onAdd={async (title) => {
              await onAddTicket({ title, kanbanColumnId: column.id });
              setAdding(false);
            }}
            onCancel={() => setAdding(false)}
          />
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      {!adding && (
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-3 py-2.5 text-[12px] text-slate-600 hover:text-slate-400
            hover:bg-slate-800/40 border-t border-slate-800/60 transition-colors rounded-b-2xl">
          <span className="text-base leading-none font-light">+</span>
          Ajouter un ticket
        </button>
      )}
    </div>
  );
}

// ─── Board ────────────────────────────────────────────────────────────────────
function Board({ boardUserId }) {
  const { columns, setColumns, tickets, setTickets, addToast } = useBCtx(window.AppContext);
  const [selectedTicket, setSelectedTicket] = useBState(null);
  const [confirmData, setConfirmData]       = useBState(null);
  const [dnd, setDnd] = useBState({
    type: null,          // 'ticket' | 'column'
    id: null,
    fromColId: null,
    overColId: null,
    overTicketId: null,
  });

  const userCols = columns
    .filter((c) => c.userId === boardUserId)
    .sort((a, b) => a.position - b.position);
  const colIds = new Set(userCols.map((c) => c.id));
  const userTickets = tickets.filter((t) => colIds.has(t.kanbanColumnId));
  const colTickets = (colId) =>
    userTickets.filter((t) => t.kanbanColumnId === colId).sort((a, b) => a.position - b.position);

  // ── Column actions ─────────────────────────────────────────────────────────
  const addColumn = async () => {
    try {
      const col = await Services.createColumn({ name: 'Nouvelle colonne', userId: boardUserId });
      setColumns((prev) => [...prev, col]);
    } catch (e) { addToast(e.message, 'error'); }
  };

  const updateColumn = async (id, data) => {
    try {
      await Services.updateColumn(id, data);
      setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    } catch (e) { addToast(e.message, 'error'); }
  };

  const deleteColumn = (id) => {
    setConfirmData({
      message: 'Supprimer cette colonne et tous ses tickets ?',
      onConfirm: async () => {
        try {
          await Services.deleteColumn(id);
          setColumns((prev) => prev.filter((c) => c.id !== id));
          setTickets((prev) => prev.filter((t) => t.kanbanColumnId !== id));
          setConfirmData(null);
          addToast('Colonne supprimée', 'success');
        } catch (e) { addToast(e.message, 'error'); }
      },
    });
  };

  // ── Ticket actions ─────────────────────────────────────────────────────────
  const addTicket = async (data) => {
    try {
      const t = await Services.createTicket(data);
      setTickets((prev) => [...prev, t]);
      addToast('Ticket créé', 'success');
    } catch (e) { addToast(e.message, 'error'); }
  };

  const updateTicket = async (id, data) => {
    try {
      const updated = await Services.updateTicket(id, data);
      setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setSelectedTicket(updated);
      addToast('Ticket mis à jour', 'success');
    } catch (e) { addToast(e.message, 'error'); }
  };

  const deleteTicket = async (id) => {
    try {
      await Services.deleteTicket(id);
      setTickets((prev) => prev.filter((t) => t.id !== id));
      setSelectedTicket(null);
      addToast('Ticket supprimé', 'success');
    } catch (e) { addToast(e.message, 'error'); }
  };

  // ── DnD handlers ──────────────────────────────────────────────────────────
  const ticketDragStart = (e, ticketId) => {
    const t = tickets.find((x) => x.id === ticketId);
    setDnd({ type: 'ticket', id: ticketId, fromColId: t.kanbanColumnId, overColId: t.kanbanColumnId, overTicketId: null });
    e.dataTransfer.effectAllowed = 'move';
  };
  const ticketDragEnd = () => setDnd({ type: null, id: null, fromColId: null, overColId: null, overTicketId: null });

  const colDragStart = (e, colId) => {
    setDnd({ type: 'column', id: colId, fromColId: null, overColId: colId, overTicketId: null });
    e.dataTransfer.effectAllowed = 'move';
  };
  const colDragEnd = () => setDnd({ type: null, id: null, fromColId: null, overColId: null, overTicketId: null });

  const ticketDragOver = (ticketId, colId) => {
    setDnd((prev) => ({ ...prev, overTicketId: ticketId, overColId: colId }));
  };
  const colDragOver = (colId) => {
    setDnd((prev) => ({ ...prev, overColId: colId, overTicketId: null }));
  };

  // drop type: 'ticket' | 'column', id: ticketId or columnId
  const ticketDrop = (dropOn, targetId) => {
    if (dnd.type !== 'ticket') return;
    const targetColId = dropOn === 'column' ? targetId : tickets.find((t) => t.id === targetId)?.kanbanColumnId;
    const beforeTicketId = dropOn === 'ticket' ? targetId : null;
    moveTicket(dnd.id, targetColId, beforeTicketId);
    ticketDragEnd();
  };

  const colDrop = (targetColId) => {
    if (dnd.type === 'column' && dnd.id !== targetColId) reorderCols(dnd.id, targetColId);
    if (dnd.type === 'ticket') ticketDrop('column', targetColId);
    colDragEnd();
  };

  // ── Move ticket ────────────────────────────────────────────────────────────
  const moveTicket = (ticketId, targetColId, beforeTicketId) => {
    setTickets((prev) => {
      let colTs = prev
        .filter((t) => t.kanbanColumnId === targetColId && t.id !== ticketId)
        .sort((a, b) => a.position - b.position);

      const movedTicket = { ...prev.find((t) => t.id === ticketId), kanbanColumnId: targetColId };

      if (beforeTicketId) {
        const idx = colTs.findIndex((t) => t.id === beforeTicketId);
        colTs.splice(idx >= 0 ? idx : colTs.length, 0, movedTicket);
      } else {
        colTs.push(movedTicket);
      }

      const reindexed = colTs.map((t, i) => ({ ...t, position: i + 1 }));
      // sync mock data
      reindexed.forEach((t) => {
        const m = MOCK_DATA.tickets.find((x) => x.id === t.id);
        if (m) { m.position = t.position; m.kanbanColumnId = t.kanbanColumnId; }
      });

      return prev.map((t) => {
        const r = reindexed.find((x) => x.id === t.id);
        return r || t;
      });
    });
  };

  // ── Reorder columns ────────────────────────────────────────────────────────
  const reorderCols = (draggedId, targetId) => {
    setColumns((prev) => {
      const mine = [...prev.filter((c) => c.userId === boardUserId)].sort((a, b) => a.position - b.position);
      const others = prev.filter((c) => c.userId !== boardUserId);
      const di = mine.findIndex((c) => c.id === draggedId);
      const ti = mine.findIndex((c) => c.id === targetId);
      if (di < 0 || ti < 0) return prev;
      const [dragged] = mine.splice(di, 1);
      mine.splice(ti, 0, dragged);
      const reindexed = mine.map((c, i) => ({ ...c, position: i + 1 }));
      reindexed.forEach((c) => { const m = MOCK_DATA.columns.find((x) => x.id === c.id); if (m) m.position = c.position; });
      return [...others, ...reindexed];
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (userCols.length === 0) {
    return (
      <EmptyState
        icon="📋"
        title="Aucune colonne"
        subtitle="Créez votre première colonne pour commencer à organiser vos tickets."
        action={
          <button onClick={addColumn}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl font-medium transition-colors">
            + Créer une colonne
          </button>
        }
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="flex-1 flex items-start gap-4 p-5 overflow-x-auto overflow-y-hidden"
        onDragOver={(e) => e.preventDefault()}>
        {userCols.map((col) => (
          <Column
            key={col.id}
            column={col}
            tickets={colTickets(col.id)}
            dnd={dnd}
            onColDragStart={colDragStart}
            onColDragEnd={colDragEnd}
            onColDragOver={colDragOver}
            onColDrop={colDrop}
            onTicketDragStart={ticketDragStart}
            onTicketDragEnd={ticketDragEnd}
            onTicketDragOver={ticketDragOver}
            onTicketDrop={ticketDrop}
            onTicketClick={(t) => setSelectedTicket({ ...t })}
            onAddTicket={addTicket}
            onUpdateColumn={updateColumn}
            onDeleteColumn={deleteColumn}
          />
        ))}

        {/* Add column */}
        <button onClick={addColumn}
          className="flex-shrink-0 w-[272px] h-14 flex items-center justify-center gap-2
            border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl
            text-sm text-slate-600 hover:text-slate-400 transition-colors">
          + Nouvelle colonne
        </button>
      </div>

      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          columns={userCols}
          onUpdate={updateTicket}
          onDelete={deleteTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}

      {confirmData && (
        <ConfirmDialog
          message={confirmData.message}
          onConfirm={confirmData.onConfirm}
          onCancel={() => setConfirmData(null)}
        />
      )}
    </div>
  );
}

Object.assign(window, { TicketCard, Column, Board });
