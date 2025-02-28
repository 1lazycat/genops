"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { TreeView } from "@/components/views/tree-view";
import { KanbanView } from "@/components/views/kanban-view";
import { ListView } from "@/components/views/list-view";
import { TimelineView } from "@/components/views/timeline-view";
import { ActivityView } from "@/components/views/activity-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [activeView, setActiveView] = useState("tree");
  
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <Tabs value={activeView} onValueChange={setActiveView} className="flex-1">
        <TabsContent value="tree" className="flex-1 data-[state=active]:flex flex-col">
          <TreeView />
        </TabsContent>
        <TabsContent value="board" className="flex-1 data-[state=active]:flex flex-col">
          <KanbanView />
        </TabsContent>
        <TabsContent value="list" className="flex-1 data-[state=active]:flex flex-col">
          <ListView />
        </TabsContent>
        <TabsContent value="timeline" className="flex-1 data-[state=active]:flex flex-col">
          <TimelineView />
        </TabsContent>
        <TabsContent value="activity" className="flex-1 data-[state=active]:flex flex-col">
          <ActivityView />
        </TabsContent>
      </Tabs>
    </main>
  );
}