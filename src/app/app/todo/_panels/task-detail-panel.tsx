"use client";

import { TaskDetail, type TaskData } from "@/components/todo";
import { generateRandomTagColor } from "@/components/todo/types";
import React, { useCallback } from "react";
import { IconInbox } from "@tabler/icons-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface TaskDetailPanelProps {
  task?: TaskData;
  onClearTask: () => void;
}

export default function TaskDetailPanel(props: TaskDetailPanelProps) {
  const utils = api.useUtils();
  const tagsQuery = api.todo.getTags.useQuery();

  const updateTaskMutation = api.todo.updateTask.useMutation({
    onMutate: async ({ id, ...updates }) => {
      await utils.todo.getTasks.cancel();
      utils.todo.getTasks.setData(undefined, (old) => {
        if (!old) return old;
        return old.map((task) =>
          task.id === id ? { ...task, ...updates } : task
        );
      });
    },
    onError: (err) => {
      toast.error(`Failed to update task: ${err.message}`);
    },
    onSettled: () => {
      void utils.todo.getTasks.invalidate();
      void utils.todo.getSmartListCounts.invalidate();
      void utils.todo.getTags.invalidate();
    },
  });

  const deleteTaskMutation = api.todo.deleteTask.useMutation({
    onMutate: async ({ id }) => {
      await utils.todo.getTasks.cancel();
      const previousTasks = utils.todo.getTasks.getData();
      utils.todo.getTasks.setData(undefined, (old) => {
        if (!old) return old;
        return old.filter((task) => task.id !== id);
      });
      return { previousTasks };
    },
    onError: (err, _variables, context) => {
      if (context?.previousTasks) {
        utils.todo.getTasks.setData(undefined, context.previousTasks);
      }
      toast.error(`Failed to delete task: ${err.message}`);
    },
    onSuccess: () => {
      toast.success("Task deleted");
      props.onClearTask();
    },
    onSettled: () => {
      void utils.todo.getTasks.invalidate();
      void utils.todo.getSmartListCounts.invalidate();
      void utils.todo.getTags.invalidate();
    },
  });

  const createTagMutation = api.todo.createTag.useMutation({
    onSuccess: (newTag) => {
      // After creating the tag, add it to the current task
      if (props.task) {
        const newTags = [...props.task.tags, newTag];
        updateTaskMutation.mutate({
          id: props.task.id,
          tagIds: newTags.map((t) => t.id),
        });
      }
      void utils.todo.getTags.invalidate();
    },
    onError: (err) => {
      toast.error(`Failed to create tag: ${err.message}`);
    },
  });

  const handleUpdateTask = useCallback(
    (taskId: string, updates: Partial<TaskData>) => {
      const apiUpdates: Parameters<typeof updateTaskMutation.mutate>[0] = {
        id: taskId,
        title: updates.title,
        body: updates.body,
        priority: updates.priority,
        dueDate: updates.dueDate,
        completed: updates.completed,
        tagIds: updates.tags?.map((t) => t.id),
      };

      // Remove undefined values
      Object.keys(apiUpdates).forEach((key) => {
        if (apiUpdates[key as keyof typeof apiUpdates] === undefined) {
          delete apiUpdates[key as keyof typeof apiUpdates];
        }
      });

      updateTaskMutation.mutate(apiUpdates);
    },
    [updateTaskMutation]
  );

  const handleDeleteTask = useCallback(
    (taskId: string) => {
      deleteTaskMutation.mutate({ id: taskId });
    },
    [deleteTaskMutation]
  );

  const handleCreateTag = useCallback(
    (name: string) => {
      createTagMutation.mutate({
        name,
        color: generateRandomTagColor(),
      });
    },
    [createTagMutation]
  );

  // Create subtask mutation
  const createSubtaskMutation = api.todo.createTask.useMutation({
    onSuccess: () => {
      void utils.todo.getTasks.invalidate();
    },
    onError: (err) => {
      toast.error(`Failed to create subtask: ${err.message}`);
    },
  });

  // Toggle subtask completion
  const toggleSubtaskMutation = api.todo.toggleTaskComplete.useMutation({
    onSuccess: () => {
      void utils.todo.getTasks.invalidate();
    },
    onError: (err) => {
      toast.error(`Failed to toggle subtask: ${err.message}`);
    },
  });

  const handleAddSubtask = useCallback(
    (parentId: string, title: string) => {
      createSubtaskMutation.mutate({
        parentId,
        title,
        body: "",
        priority: 0,
        dueDate: null,
      });
    },
    [createSubtaskMutation]
  );

  const handleToggleSubtask = useCallback(
    (taskId: string) => {
      toggleSubtaskMutation.mutate({ id: taskId });
    },
    [toggleSubtaskMutation]
  );

  // Convert tags query data to the format expected by TaskDetail
  const availableTags = tagsQuery.data?.map((tag) => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
  })) ?? [];

  return (
    <>
      {props.task ? (
        <TaskDetail
          task={props.task}
          availableTags={availableTags}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onClose={props.onClearTask}
          onCreateTag={handleCreateTag}
          onAddSubtask={handleAddSubtask}
          onToggleSubtask={handleToggleSubtask}
        />
      ) : (
        <div className="flex h-full flex-col overflow-y-auto p-6">
          <div className="flex h-full items-center justify-center text-center">
            <div className="space-y-2">
              <IconInbox className="text-muted-foreground/50 mx-auto h-16 w-16" />
              <h3 className="text-lg font-semibold">Select a task</h3>
              <p className="text-muted-foreground text-sm">
                Choose a task from the list to view its details
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
