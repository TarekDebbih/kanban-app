// services.js — Fake API layer (same signatures as real HTTP endpoints)
(function () {
  const delay = (ms = 280) => new Promise((r) => setTimeout(r, ms));

  // ─── Auth storage helpers ───────────────────────────────────────────────────
  function getStoredAuth() {
    try {
      const raw = localStorage.getItem('kanban_token') || sessionStorage.getItem('kanban_token');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
  function clearAuth() {
    localStorage.removeItem('kanban_token');
    sessionStorage.removeItem('kanban_token');
  }

  window.Services = {
    getStoredAuth,

    // POST /api/Auth/login
    async login({ email, password, rememberMe }) {
      await delay();
      const user = MOCK_DATA.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      if (!user) throw new Error('Email ou mot de passe invalide');
      const token = btoa(JSON.stringify({ userId: user.id, exp: Date.now() + 86400000 }));
      const auth = {
        token,
        expiration: new Date(Date.now() + 86400000).toISOString(),
        email: user.email,
        role: user.role,
        userId: user.id,
      };
      const store = rememberMe ? localStorage : sessionStorage;
      store.setItem('kanban_token', JSON.stringify(auth));
      return auth; // AuthResponse
    },

    // POST /api/Auth/register
    async register({ email, password }) {
      await delay();
      if (MOCK_DATA.users.find((u) => u.email.toLowerCase() === email.toLowerCase()))
        throw new Error('Cet email est déjà utilisé');
      const id = Math.max(...MOCK_DATA.users.map((u) => u.id)) + 1;
      MOCK_DATA.users.push({ id, email, password, role: 'Standard' });
      return { success: true };
    },

    // (client-side)
    logout: clearAuth,

    // GET /api/KanbanColumns?userId={userId}
    async listColumns(userId) {
      await delay(150);
      return MOCK_DATA.columns
        .filter((c) => c.userId === userId)
        .sort((a, b) => a.position - b.position)
        .map((c) => ({ ...c }));
    },

    // POST /api/KanbanColumns
    async createColumn({ name, userId }) {
      await delay();
      const existing = MOCK_DATA.columns.filter((c) => c.userId === userId);
      const maxPos = existing.length ? Math.max(...existing.map((c) => c.position)) : 0;
      const col = { id: Date.now(), name, position: maxPos + 1, userId };
      MOCK_DATA.columns.push(col);
      return { ...col };
    },

    // PUT /api/KanbanColumns/{id}
    async updateColumn(id, data) {
      await delay();
      const col = MOCK_DATA.columns.find((c) => c.id === id);
      if (!col) throw new Error('Colonne introuvable');
      Object.assign(col, data);
      return { ...col };
    },

    // DELETE /api/KanbanColumns/{id}
    async deleteColumn(id) {
      await delay();
      MOCK_DATA.columns = MOCK_DATA.columns.filter((c) => c.id !== id);
      MOCK_DATA.tickets = MOCK_DATA.tickets.filter((t) => t.kanbanColumnId !== id);
    },

    // GET /api/Tickets?columnId={columnId}
    async listTickets(columnId) {
      await delay(150);
      return MOCK_DATA.tickets
        .filter((t) => t.kanbanColumnId === columnId)
        .sort((a, b) => a.position - b.position)
        .map((t) => ({ ...t }));
    },

    // POST /api/Tickets
    async createTicket(data) {
      await delay();
      const { kanbanColumnId } = data;
      const colTickets = MOCK_DATA.tickets.filter((t) => t.kanbanColumnId === kanbanColumnId);
      const maxPos = colTickets.length ? Math.max(...colTickets.map((t) => t.position)) : 0;
      const ticket = {
        timeSpentHours: 0,
        description: '',
        ...data,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        position: maxPos + 1,
      };
      MOCK_DATA.tickets.push(ticket);
      return { ...ticket };
    },

    // PUT /api/Tickets/{id}
    async updateTicket(id, data) {
      await delay();
      const ticket = MOCK_DATA.tickets.find((t) => t.id === id);
      if (!ticket) throw new Error('Ticket introuvable');
      Object.assign(ticket, data);
      return { ...ticket };
    },

    // DELETE /api/Tickets/{id}
    async deleteTicket(id) {
      await delay();
      MOCK_DATA.tickets = MOCK_DATA.tickets.filter((t) => t.id !== id);
    },

    // GET /api/Users/{email}
    async getUserByEmail(email) {
      await delay();
      const user = MOCK_DATA.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (!user) throw new Error('Utilisateur non trouvé');
      const { password: _pw, ...safe } = user;
      return safe;
    },

    // GET /api/Users
    async listUsers() {
      await delay(150);
      return MOCK_DATA.users.map(({ password: _pw, ...u }) => u);
    },
  };
})();
