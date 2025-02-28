"use client";

import { Header } from "@/components/layout/header";
import { TimelineView } from "@/components/views/timeline-view";

export default function TimelineViewPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <TimelineView />
    </main>
  );
}