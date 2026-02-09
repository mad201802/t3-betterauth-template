import { TodoListButton } from "@/components/todo-list-button";
import { SMART_LISTS, PRIORITY_CONFIG } from "@/components/todo/types";
import { Separator, Skeleton } from "@/components/ui";
import { api } from "@/trpc/react";
import { IconTag, IconFlag } from "@tabler/icons-react";
import React from "react";

interface GroupPanelProps {
  activeList: string;
  setActiveList: (listId: string) => void;
}

function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-md px-3 py-2">
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="ml-auto h-4 w-6" />
    </div>
  );
}

export default function GroupPanel(props: GroupPanelProps) {

  const tagsQuery = api.todo.getTags.useQuery();
  const smartListCountsQuery = api.todo.getSmartListCounts.useQuery();

  const isSmartListsLoading = smartListCountsQuery.isLoading;
  const isTagsLoading = tagsQuery.isLoading;

  // Smart list counts (derived)
  const smartListCounts: Record<string, number> = {
    today: smartListCountsQuery.data?.today ?? 0,
    week: smartListCountsQuery.data?.week ?? 0,
    inbox: smartListCountsQuery.data?.inbox ?? 0,
  };

  return (
    <>
      <div className="flex h-full flex-col overflow-y-auto border-r p-4">
        {/* Smart Lists */}
        <div>
          {isSmartListsLoading ? (
            <div className="space-y-1">
              {SMART_LISTS.map((list) => (
                <ListItemSkeleton key={list.id} />
              ))}
            </div>
          ) : (
            SMART_LISTS.map((list) => {
              const Icon = list.icon;
              return (
                <TodoListButton
                  key={list.id}
                  icon={<Icon className="h-4 w-4" />}
                  text={list.name}
                  count={smartListCounts[list.id] ?? 0}
                  selected={props.activeList === list.id}
                  onClick={() => props.setActiveList(list.id)}
                />
              );
            })
          )}
        </div>

        <Separator className="my-5" />

        {/* Tags */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-muted-foreground text-xs font-semibold uppercase">
              Tags
            </h3>
          </div>
          <div className="space-y-1">
            {isTagsLoading ? (
              <>
                <ListItemSkeleton />
                <ListItemSkeleton />
                <ListItemSkeleton />
              </>
            ) : tagsQuery.data && tagsQuery.data.length > 0 ? (
              tagsQuery.data.map((tag) => (
                <TodoListButton
                  key={tag.id}
                  icon={<IconTag className="h-4 w-4" />}
                  text={tag.name}
                  count={tag._count.tasks}
                  dotColor={tag.color}
                  selected={props.activeList === `tag:${tag.id}`}
                  onClick={() => props.setActiveList(`tag:${tag.id}`)}
                />
              ))
            ) : (
              <p className="text-muted-foreground px-3 py-2 text-sm">
                No tags yet
              </p>
            )}
          </div>
        </div>

        <Separator className="my-5" />

        {/* Priorities */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-muted-foreground text-xs font-semibold uppercase">
              Priority
            </h3>
          </div>
          <div className="space-y-1">
            {([3, 2, 1, 0] as const).map((priorityLevel) => {
              const config = PRIORITY_CONFIG[priorityLevel];
              return (
                <TodoListButton
                  key={priorityLevel}
                  icon={<IconFlag className={`h-4 w-4 ${config.color}`} />}
                  text={config.label}
                  selected={props.activeList === `priority:${priorityLevel}`}
                  onClick={() => props.setActiveList(`priority:${priorityLevel}`)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

