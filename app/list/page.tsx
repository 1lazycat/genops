"use client";

import { Header } from "@/components/layout/header";
import { ListView } from "@/components/views/list-view";

export default function ListViewPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <ListView />
    </main>
  );
}