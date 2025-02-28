"use client";

import { Header } from "@/components/layout/header";
import { ActivityView } from "@/components/views/activity-view";

export default function ActivityViewPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <ActivityView />
    </main>
  );
}