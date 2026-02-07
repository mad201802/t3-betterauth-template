import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconCalendar,
  IconInbox,
  IconCalendarWeek,
  IconTag,
  IconPlus,
  IconChevronDown,
  IconChevronRight,
  IconDots,
  IconFlag,
  IconCalendarEvent,
} from "@tabler/icons-react";
import React from "react";
import { Separator } from "@/components/ui";
import { TodoListButton } from "@/components/todo-list-button";

const lists = [
  { id: 1, name: "Today", icon: IconCalendar, count: 5 },
  { id: 2, name: "Next 7 Days", icon: IconCalendarWeek, count: 8 },
  { id: 3, name: "Inbox", icon: IconInbox, count: 3 },
];

const projects = [
  { id: 1, name: "AgilesProjectmanagement", color: "bg-purple-500", count: 2 },
  { id: 2, name: "Personal", color: "bg-red-500", count: 4 },
  { id: 3, name: "Master", color: "bg-amber-500", count: 6 },
];

const tags = [
  { id: 1, name: "Personal", color: "bg-red-500", count: 3 },
  { id: 2, name: "SystemEngineering", color: "bg-orange-500", count: 2 },
  { id: 3, name: "AgilesProjectmanagement", color: "bg-purple-500", count: 2 },
];

const tasks = {
  overdue: [
    {
      id: 1,
      title: "Videos zu den Themen angucken",
      project: "AgilesProjectmanagement",
      projectColor: "bg-purple-500",
      priority: 3,
      dueDate: "Yesterday",
    },
    {
      id: 2,
      title: "Folien kürzen",
      project: "AgilesProjectmanagement",
      projectColor: "bg-purple-500",
      priority: 1,
      dueDate: "Yesterday",
    },
  ],
  today: [
    {
      id: 3,
      title: "Mobility Training",
      project: "Personal",
      projectColor: "bg-red-500",
      priority: 2,
      dueDate: "Today",
      recurring: true,
    },
  ],
  completed: [
    {
      id: 4,
      title: "Anki Karten verbessern",
      project: "AgilesProjectmanagement",
      projectColor: "bg-purple-500",
      completed: true,
    },
    {
      id: 5,
      title: "Mindmap generieren lassen",
      project: "AgilesProjectmanagement",
      projectColor: "bg-purple-500",
      completed: true,
    },
  ],
};

export default function ToDoPage() {
  return (
    <ResizablePanelGroup orientation="horizontal">
      {/* Left Panel - Lists & Projects */}
      <ResizablePanel minSize="15%" defaultSize="20%" maxSize="25%">
        <div className="flex h-full flex-col overflow-y-auto border-r p-4">
          {/* Lists Section */}
          <div>
            {lists.map((list) => {
              const Icon = list.icon;
              return (
                <TodoListButton
                  key={list.id}
                  icon={<Icon className="h-4 w-4" />}
                  text={list.name}
                  count={list.count}
                />
              );
            })}
          </div>

          <Separator className="my-5" />

          {/* Projects Section */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-muted-foreground text-xs font-semibold uppercase">
                Projects
              </h3>
              <Button variant="ghost" size="icon" className="h-5 w-5">
                <IconPlus className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-1">
              {projects.map((project) => (
                <TodoListButton
                  key={project.id}
                  icon={<div className={`h-2 w-2 rounded-full ${project.color}`} />}
                  text={project.name}
                  count={project.count}
                />
              ))}
            </div>
          </div>

          {/* Tags Section */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-muted-foreground text-xs font-semibold uppercase">
                Tags
              </h3>
            </div>
            <div className="space-y-1">
              {tags.map((tag) => (
                <TodoListButton
                  key={tag.id}
                  icon={<IconTag className="h-4 w-4" />}
                  text={tag.name}
                  count={tag.count}
                  dotColor={tag.color.replace("bg-", "").replace("-500", "")}
                />
              ))}
            </div>
          </div>
        </div>
      </ResizablePanel>

      <ResizableHandle />

      {/* Middle Panel - Tasks */}
      <ResizablePanel>
        <div className="flex h-full flex-col overflow-y-auto border-r">
          {/* Header */}
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Today</h2>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <IconDots className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Tasks Content */}
          <div className="flex-1 p-4">
            {/* Overdue Section */}
            {tasks.overdue.length > 0 && (
              <div className="mb-6">
                <div className="mb-3 flex items-center gap-2">
                  <IconChevronDown className="text-muted-foreground h-4 w-4" />
                  <h3 className="text-sm font-semibold text-red-500">
                    Overdue
                  </h3>
                  <span className="text-muted-foreground text-xs">
                    {tasks.overdue.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {tasks.overdue.map((task) => (
                    <div
                      key={task.id}
                      className="group hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3"
                    >
                      <Checkbox className="mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{task.title}</span>
                          {task.priority > 0 && (
                            <IconFlag
                              className={`h-3 w-3 ${
                                task.priority === 3
                                  ? "text-red-500"
                                  : task.priority === 2
                                    ? "text-orange-500"
                                    : "text-blue-500"
                              }`}
                            />
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            <div
                              className={`h-1.5 w-1.5 rounded-full ${task.projectColor}`}
                            />
                            {task.project}
                          </Badge>
                          <span className="text-xs text-red-500">
                            {task.dueDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Today Section */}
            {tasks.today.length > 0 && (
              <div className="mb-6">
                <div className="mb-3 flex items-center gap-2">
                  <IconChevronDown className="text-muted-foreground h-4 w-4" />
                  <h3 className="text-sm font-semibold">Today</h3>
                  <span className="text-muted-foreground text-xs">
                    {tasks.today.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {tasks.today.map((task) => (
                    <div
                      key={task.id}
                      className="group hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3"
                    >
                      <Checkbox className="mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{task.title}</span>
                          {task.recurring && (
                            <IconCalendarEvent className="text-muted-foreground h-3 w-3" />
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            <div
                              className={`h-1.5 w-1.5 rounded-full ${task.projectColor}`}
                            />
                            {task.project}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Section */}
            {tasks.completed.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <IconChevronRight className="text-muted-foreground h-4 w-4" />
                  <h3 className="text-muted-foreground text-sm font-semibold">
                    Completed
                  </h3>
                  <span className="text-muted-foreground text-xs">
                    {tasks.completed.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {tasks.completed.map((task) => (
                    <div
                      key={task.id}
                      className="group hover:bg-accent/50 flex items-start gap-3 rounded-lg p-3 opacity-50"
                    >
                      <Checkbox checked className="mt-0.5" />
                      <div className="flex-1">
                        <span className="text-sm line-through">
                          {task.title}
                        </span>
                        <div className="mt-1">
                          <Badge variant="secondary" className="text-xs">
                            <div
                              className={`h-1.5 w-1.5 rounded-full ${task.projectColor}`}
                            />
                            {task.project}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </ResizablePanel>

      <ResizableHandle />

      {/* Right Panel - Task Details */}
      <ResizablePanel>
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
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
