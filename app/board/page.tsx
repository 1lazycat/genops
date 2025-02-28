"use client";

import { Header } from "@/components/layout/header";
import { KanbanView } from "@/components/views/kanban-view";

export default function BoardViewPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <KanbanView />
    </main>
  );
}