"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import React, { useState } from "react";
import GroupPanel from "./_panels/group-panel";
import TasksPanel from "./_panels/tasks-panel";
import TaskDetailPanel from "./_panels/task-detail-panel";
import type { TaskData } from "@/components/todo";

export default function ToDoPage() {
  const [activeList, setActiveList] = useState<string>("today");
  const [selectedTask, setSelectedTask] = useState<TaskData | undefined>(undefined);

  return (
    <ResizablePanelGroup orientation="horizontal">
      {/* ─── Left Panel - Lists & Projects ─── */}
      <ResizablePanel defaultSize="20%" minSize="15%" maxSize="25%">
        <GroupPanel activeList={activeList} setActiveList={setActiveList} />
      </ResizablePanel>
      <ResizableHandle />
      {/* ─── Middle Panel - Tasks ─── */}
      <ResizablePanel defaultSize="45%">
        <TasksPanel activeList={activeList} selectedTask={selectedTask} onSelectTask={setSelectedTask} />
      </ResizablePanel>
      <ResizableHandle />
      {/* ─── Right Panel - Task Details ─── */}
      <ResizablePanel defaultSize="35%">
        <TaskDetailPanel task={selectedTask} onClearTask={() => setSelectedTask(undefined)} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
