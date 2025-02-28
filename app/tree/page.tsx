"use client";

import { Header } from "@/components/layout/header";
import { TreeView } from "@/components/views/tree-view";

export default function TreeViewPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <TreeView />
    </main>
  );
}