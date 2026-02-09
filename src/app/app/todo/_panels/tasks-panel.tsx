import {
  TaskInput,
  TodoItem,
} from "@/components/todo";
import type { ParsedTaskInput, TaskData, TaskInputDefaults } from "@/components/todo/types";
import { Button, Skeleton } from "@/components/ui";
import { api } from "@/trpc/react";
import {
  IconChevronDown,
  IconChevronRight,
  IconDots,
  IconFilter,
  IconSortDescending,
} from "@tabler/icons-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface TasksPanelProps {
  activeList: string;
  selectedTask?: TaskData;
  onSelectTask: (task: TaskData) => void;
}

function formatPanelHeader(activeList: string) {
  switch (activeList) {
    case "all":
      return "All Tasks";
    case "today":
      return "Today";
    case "week":
      return "Next 7 Days";
    case "inbox":
      return "Inbox";
    default:
      return "Tasks";
  }
}

function TaskItemSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <Skeleton className="h-5 w-5 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

export default function TasksPanel(props: TasksPanelProps) {
  const { selectedTask, onSelectTask, activeList } = props;
  const utils = api.useUtils();
  const tasksQuery = api.todo.getTasks.useQuery({ filter: activeList });
  api.todo.getTags.useQuery();

  // Sync selectedTask with query data to reflect updates (e.g., toggle complete)
  useEffect(() => {
    if (selectedTask && tasksQuery.data) {
      const updatedTask = tasksQuery.data.find(t => t.id === selectedTask?.id);
      if (updatedTask && updatedTask !== selectedTask) {
        onSelectTask(updatedTask);
      }
    }
  }, [tasksQuery.data, selectedTask, onSelectTask]);

  // Compute defaults for TaskInput based on active list
  const taskInputDefaults = useMemo<TaskInputDefaults>(() => {
    if (activeList === "today") {
      return { dueDate: new Date() };
    }
    if (activeList.startsWith("tag:")) {
      const tagId = activeList.slice(4);
      return { tagIds: [tagId] };
    }
    if (activeList.startsWith("priority:")) {
      const priorityValue = parseInt(activeList.slice(9), 10);
      if (!isNaN(priorityValue) && priorityValue >= 0 && priorityValue <= 3) {
        return { priority: priorityValue as 0 | 1 | 2 | 3 };
      }
    }
    // week and inbox: no defaults
    return {};
  }, [activeList]);

  const createTaskMutation = api.todo.createTask.useMutation({
    onMutate: async (newTask) => {
      // Cancel outgoing refetches
      await utils.todo.getTasks.cancel();

      // Snapshot the previous value
      const previousTasks = utils.todo.getTasks.getData({ filter: activeList });

      // Get available tags from cache to build optimistic tag data
      const cachedTags = utils.todo.getTags.getData() ?? [];
      const optimisticTags = (newTask.tagIds ?? [])
        .map((tagId) => cachedTags.find((t) => t.id === tagId))
        .filter((tag): tag is NonNullable<typeof tag> => tag !== undefined);

      // Optimistically add the new task
      utils.todo.getTasks.setData({ filter: activeList }, (old) => {
        if (!old) return old;
        const optimisticTask: TaskData = {
          id: `temp-${Date.now()}`,
          title: newTask.title,
          body: newTask.body,
          priority: newTask.priority,
          dueDate: newTask.dueDate ?? null,
          completed: false,
          createdAt: new Date(),
          userId: "",
          tags: optimisticTags
        };
        return [optimisticTask, ...old];
      });

      return { previousTasks };
    },
    onError: (_err, _newTask, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        utils.todo.getTasks.setData({ filter: activeList }, context.previousTasks);
      }

      toast.error(`Failed to create task: ${_err.message}`);
    },
    onSettled: () => {
      // Always refetch to sync with server
      void utils.todo.getTasks.invalidate();
      void utils.todo.getSmartListCounts.invalidate();
      void utils.todo.getTags.invalidate();
    },

    onSuccess: () => {
      toast.success("Task created successfully");
    }
  });

  const toggleTaskMutation = api.todo.toggleTaskComplete.useMutation({
    onMutate: async ({ id }) => {
      // Cancel outgoing refetches
      await utils.todo.getTasks.cancel();

      // Snapshot the previous value
      const previousTasks = utils.todo.getTasks.getData({ filter: activeList });

      // Optimistically toggle the task
      utils.todo.getTasks.setData({ filter: activeList }, (old) => {
        if (!old) return old;
        return old.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        );
      });

      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        utils.todo.getTasks.setData({ filter: activeList }, context.previousTasks);
      }
    },
    onSettled: () => {
      // Always refetch to sync with server
      void utils.todo.getTasks.invalidate();
      void utils.todo.getSmartListCounts.invalidate();
    },
  });

  const handleAddTask = useCallback((parsed: ParsedTaskInput) => {
    createTaskMutation.mutate({
      title: parsed.title,
      priority: parsed.priority,
      dueDate: parsed.dueDate,
      body: "",
      tagIds: parsed.tagIds,
    });
  }, [createTaskMutation]);

  const handleToggleComplete = useCallback((taskId: string) => {
    toggleTaskMutation.mutate({ id: taskId });
  }, [toggleTaskMutation]);

  return (
    <>
      <div className="flex h-full flex-col overflow-y-auto border-r">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{formatPanelHeader(activeList)}</h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <IconFilter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <IconSortDescending className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <IconDots className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Add Input */}
        <div className="p-4">
          <TaskInput onAddTask={handleAddTask} defaults={taskInputDefaults} />
        </div>

        {/* Task Sections */}
        <div className="flex-1 overflow-y-auto p-4">
          {tasksQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <TaskItemSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              <TaskSection
                label="Open"
                tasks={(tasksQuery.data ?? []).filter((task) => !task.completed)}
                selectedTask={selectedTask}
                onSelectTask={onSelectTask}
                onToggleComplete={handleToggleComplete}
              />
              <TaskSection
                label="Completed"
                tasks={(tasksQuery.data ?? []).filter((task) => task.completed)}
                selectedTask={selectedTask}
                onSelectTask={onSelectTask}
                onToggleComplete={handleToggleComplete}
                labelClass="text-muted-foreground"
                defaultCollapsed
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}

interface TaskSectionProps {
  label: string;
  tasks: TaskData[];
  selectedTask?: TaskData;
  onSelectTask: (task: TaskData) => void;
  onToggleComplete: (taskId: string) => void;
  labelClass?: string;
  defaultCollapsed?: boolean;
}

function TaskSection({
  label,
  tasks,
  selectedTask,
  onSelectTask,
  onToggleComplete,
  labelClass,
  defaultCollapsed = false,
}: TaskSectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  if (tasks.length === 0) return null;

  return (
    <div className="mb-4">
      <button
        type="button"
        className="mb-2 flex w-full items-center gap-2 text-left"
        onClick={() => setCollapsed((prev) => !prev)}
      >
        {collapsed ? (
          <IconChevronRight className="text-muted-foreground h-4 w-4" />
        ) : (
          <IconChevronDown className="text-muted-foreground h-4 w-4" />
        )}
        <h3 className={`text-sm font-semibold ${labelClass ?? ""}`}>
          {label}
        </h3>
        <span className="text-muted-foreground text-xs">
          {tasks.length}
        </span>
      </button>
      {!collapsed && (
        <div className="space-y-1.5">
          {tasks.map((task) => (
            <TodoItem
              key={task.id}
              task={task}
              selected={task.id === selectedTask?.id}
              onToggleComplete={onToggleComplete}
              onSelect={onSelectTask}
            />
          ))}
        </div>
      )}
    </div>
  );
}