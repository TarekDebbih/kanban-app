// mockData.js — Seed data for Kanban mock
(function () {
  const d = (daysAgo) => new Date(Date.now() - daysAgo * 86400000).toISOString();

  window.MOCK_DATA = {
    users: [
      { id: 1, email: 'admin@kanban.app',    password: 'admin123', role: 'Admin'    },
      { id: 2, email: 'alice@example.com',   password: 'alice123', role: 'Standard' },
      { id: 3, email: 'bob@example.com',     password: 'bob123',   role: 'Standard' },
    ],
    columns: [
      // ── Alice (2) ──────────────────────────────────────────────
      { id: 10, name: 'À faire',    position: 1, userId: 2 },
      { id: 11, name: 'En cours',   position: 2, userId: 2 },
      { id: 12, name: 'Terminé',    position: 3, userId: 2 },
      // ── Bob (3) ────────────────────────────────────────────────
      { id: 20, name: 'Backlog',    position: 1, userId: 3 },
      { id: 21, name: 'In Progress',position: 2, userId: 3 },
      { id: 22, name: 'Done',       position: 3, userId: 3 },
      // ── Admin (1) ──────────────────────────────────────────────
      { id: 30, name: 'Todo',       position: 1, userId: 1 },
      { id: 31, name: 'Doing',      position: 2, userId: 1 },
      { id: 32, name: 'Review',     position: 3, userId: 1 },
    ],
    tickets: [
      // Alice — col 10 (À faire)
      { id: 101, title: 'Design homepage mockups',      description: 'Create wireframes and hi-fi mockups for the landing page — mobile & desktop variants.', timeSpentHours: 2.5,  createdAt: d(14), position: 1, kanbanColumnId: 10 },
      { id: 102, title: 'Set up CI/CD pipeline',        description: 'Configure GitHub Actions for automated testing and deployment to staging and production.', timeSpentHours: 3,    createdAt: d(12), position: 2, kanbanColumnId: 10 },
      { id: 103, title: 'Write API documentation',      description: 'Document all REST endpoints using Swagger/OpenAPI 3.0 spec with request & response examples.', timeSpentHours: 1.5,  createdAt: d(10), position: 3, kanbanColumnId: 10 },
      // Alice — col 11 (En cours)
      { id: 104, title: 'Fix authentication bug',       description: 'Users getting intermittent 401 errors. Investigate token refresh flow and session expiry logic.', timeSpentHours: 0.5,  createdAt: d(8),  position: 1, kanbanColumnId: 11 },
      { id: 105, title: 'Implement full-text search',   description: 'Add search functionality across all tickets and columns using Elasticsearch integration.', timeSpentHours: 4,    createdAt: d(7),  position: 2, kanbanColumnId: 11 },
      // Alice — col 12 (Terminé)
      { id: 106, title: 'Deploy to staging',            description: 'Push latest build to staging environment and run smoke tests before sign-off.', timeSpentHours: 1,    createdAt: d(5),  position: 1, kanbanColumnId: 12 },
      { id: 107, title: 'Onboarding flow redesign',     description: 'Redesigned the 3-step onboarding flow; shipped to 100% of new users.', timeSpentHours: 5,    createdAt: d(20), position: 2, kanbanColumnId: 12 },
      // Bob — col 20 (Backlog)
      { id: 201, title: 'Database migration to v16',    description: 'Migrate from PostgreSQL 14 to 16. Plan zero-downtime migration with rolling updates.', timeSpentHours: 5,    createdAt: d(20), position: 1, kanbanColumnId: 20 },
      { id: 202, title: 'Add dark mode support',        description: 'Implement system-wide dark mode using CSS custom properties and prefers-color-scheme.', timeSpentHours: 3,    createdAt: d(18), position: 2, kanbanColumnId: 20 },
      { id: 203, title: 'Performance audit',            description: 'Run Lighthouse audit and address all issues above threshold — target Perf score ≥ 90.', timeSpentHours: 2,    createdAt: d(16), position: 3, kanbanColumnId: 20 },
      { id: 204, title: 'Accessibility review',         description: 'Ensure WCAG AA compliance across all pages; fix contrast issues and add ARIA labels.', timeSpentHours: 1.5,  createdAt: d(14), position: 4, kanbanColumnId: 20 },
      // Bob — col 21 (In Progress)
      { id: 205, title: 'Optimize image loading',       description: 'Convert images to WebP format and implement lazy loading with IntersectionObserver.', timeSpentHours: 1.5,  createdAt: d(10), position: 1, kanbanColumnId: 21 },
      { id: 206, title: 'Update all dependencies',      description: 'Update npm packages to latest; handle breaking changes in major-version bumps carefully.', timeSpentHours: 2,    createdAt: d(8),  position: 2, kanbanColumnId: 21 },
      // Bob — col 22 (Done)
      { id: 207, title: 'Write unit tests',             description: 'Add Jest unit tests for core business logic — target 80% line coverage.', timeSpentHours: 4.5,  createdAt: d(6),  position: 1, kanbanColumnId: 22 },
      { id: 208, title: 'Code review session',          description: 'Review open PRs from team members and leave actionable, constructive feedback.', timeSpentHours: 1,    createdAt: d(4),  position: 2, kanbanColumnId: 22 },
      // Admin — col 30 (Todo)
      { id: 301, title: 'Review user feedback reports', description: 'Check and categorize incoming reports from the feedback portal; assign to right teams.', timeSpentHours: 1,    createdAt: d(5),  position: 1, kanbanColumnId: 30 },
      { id: 302, title: 'Plan Q3 roadmap',              description: 'Consolidate feature requests and define the Q3 product roadmap with stakeholders.', timeSpentHours: 2,    createdAt: d(4),  position: 2, kanbanColumnId: 30 },
      // Admin — col 31 (Doing)
      { id: 303, title: 'Security vulnerability scan',  description: 'Run security audit on all production services and patch any critical CVEs found.', timeSpentHours: 3,    createdAt: d(3),  position: 1, kanbanColumnId: 31 },
      // Admin — col 32 (Review)
      { id: 304, title: 'Set up automated backups',     description: 'Configure daily encrypted database backups with S3 storage and alerting on failure.', timeSpentHours: 2,    createdAt: d(1),  position: 1, kanbanColumnId: 32 },
    ],
  };
})();
