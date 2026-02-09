import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";

// ===== Zod Schemas =====

const taskCreateSchema = z.object({
    title: z.string().min(1).max(255),
    body: z.string(),
    priority: z.number().int().min(0).max(3),
    dueDate: z.date().nullable().optional(),
    tagIds: z.array(z.string()).optional(),
});

const taskUpdateSchema = z.object({
    id: z.string(),
    title: z.string().min(1).max(255).optional(),
    body: z.string().optional(),
    priority: z.number().int().min(0).max(3).optional(),
    dueDate: z.date().nullable().optional(),
    completed: z.boolean().optional(),
    tagIds: z.array(z.string()).optional(),
});

const tagCreateSchema = z.object({
    name: z.string().min(1).max(50),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
});

const tagUpdateSchema = z.object({
    id: z.string(),
    name: z.string().min(1).max(50).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color").optional(),
});

export const todoRouter = createTRPCRouter({
    // ===== Task CRUD =====

    // Create Task
    createTask: protectedProcedure
        .input(taskCreateSchema)
        .mutation(async ({ ctx, input }) => {
            const task = await ctx.db.task.create({
                data: {
                    id: crypto.randomUUID(),
                    title: input.title,
                    body: input.body,
                    priority: input.priority,
                    dueDate: input.dueDate ?? null,
                    userId: ctx.session.user.id,
                    tags: input.tagIds ? {
                        connect: input.tagIds.map(id => ({ id })),
                    } : undefined,
                },
                include: { tags: true },
            });
            return task;
        }),

    // Read All Tasks (with smart list & tag filtering)
    getTasks: protectedProcedure
        .input(z.object({
            completed: z.boolean().optional(),
            priority: z.number().int().min(0).max(3).optional(),
            filter: z.string().optional(), // "today" | "week" | "inbox" | "tag:{tagId}"
        }).optional())
        .query(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;
            const filter = input?.filter;

            // Build date filter based on smart list
            let dateFilter: object | undefined;
            let tagFilter: object | undefined;

            if (filter === "today") {
                const now = new Date();
                const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const todayEnd = new Date(todayStart);
                todayEnd.setDate(todayEnd.getDate() + 1);
                todayEnd.setMilliseconds(-1);
                dateFilter = {
                    dueDate: {
                        gte: todayStart,
                        lte: todayEnd,
                    },
                };
            } else if (filter === "week") {
                const now = new Date();
                const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const weekEnd = new Date(todayStart);
                weekEnd.setDate(weekEnd.getDate() + 7);
                dateFilter = {
                    dueDate: {
                        gte: todayStart,
                        lt: weekEnd,
                    },
                };
            } else if (filter === "inbox") {
                dateFilter = {
                    dueDate: null,
                };
            } else if (filter?.startsWith("tag:")) {
                const tagId = filter.slice(4);
                tagFilter = {
                    tags: {
                        some: { id: tagId },
                    },
                };
            }

            // Handle priority filter (priority:0, priority:1, etc.)
            let priorityFilter: object | undefined;
            if (filter?.startsWith("priority:")) {
                const priorityValue = parseInt(filter.slice(9), 10);
                if (!isNaN(priorityValue) && priorityValue >= 0 && priorityValue <= 3) {
                    priorityFilter = { priority: priorityValue };
                }
            }

            const tasks = await ctx.db.task.findMany({
                where: {
                    userId,
                    ...(input?.completed !== undefined && { completed: input.completed }),
                    ...(input?.priority !== undefined && { priority: input.priority }),
                    ...dateFilter,
                    ...tagFilter,
                    ...priorityFilter,
                },
                include: { tags: true },
                orderBy: [
                    { createdAt: 'desc' },
                ],
            });
            return tasks;
        }),

    // Read Single Task
    getTask: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const task = await ctx.db.task.findFirst({
                where: {
                    id: input.id,
                    userId: ctx.session.user.id,
                },
                include: { tags: true },
            });

            if (!task) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Task not found",
                });
            }

            return task;
        }),

    // Update Task
    updateTask: protectedProcedure
        .input(taskUpdateSchema)
        .mutation(async ({ ctx, input }) => {
            const { id, tagIds, ...data } = input;

            // Verify ownership
            const existing = await ctx.db.task.findFirst({
                where: { id, userId: ctx.session.user.id },
            });

            if (!existing) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Task not found",
                });
            }

            const task = await ctx.db.task.update({
                where: { id },
                data: {
                    ...data,
                    ...(tagIds !== undefined && {
                        tags: { set: tagIds.map(tagId => ({ id: tagId })) },
                    }),
                },
                include: { tags: true },
            });

            return task;
        }),

    // Delete Task
    deleteTask: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Verify ownership
            const existing = await ctx.db.task.findFirst({
                where: { id: input.id, userId: ctx.session.user.id },
            });

            if (!existing) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Task not found",
                });
            }

            await ctx.db.task.delete({
                where: { id: input.id },
            });

            return { success: true };
        }),

    // Toggle Task Completion
    toggleTaskComplete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const existing = await ctx.db.task.findFirst({
                where: { id: input.id, userId: ctx.session.user.id },
            });

            if (!existing) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Task not found",
                });
            }

            const task = await ctx.db.task.update({
                where: { id: input.id },
                data: { completed: !existing.completed },
                include: { tags: true },
            });

            return task;
        }),

    // ===== Tag CRUD =====

    // Create Tag
    createTag: protectedProcedure
        .input(tagCreateSchema)
        .mutation(async ({ ctx, input }) => {
            const tag = await ctx.db.tag.create({
                data: {
                    id: crypto.randomUUID(),
                    name: input.name,
                    color: input.color,
                    userId: ctx.session.user.id,
                },
            });
            return tag;
        }),

    // Read All Tags
    getTags: protectedProcedure
        .query(async ({ ctx }) => {
            const tags = await ctx.db.tag.findMany({
                where: { userId: ctx.session.user.id },
                include: {
                    _count: { select: { tasks: true } },
                },
                orderBy: { name: 'asc' },
            });
            return tags;
        }),

    // Read Single Tag
    getTag: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const tag = await ctx.db.tag.findFirst({
                where: {
                    id: input.id,
                    userId: ctx.session.user.id,
                },
                include: {
                    tasks: true,
                    _count: { select: { tasks: true } },
                },
            });

            if (!tag) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Tag not found",
                });
            }

            return tag;
        }),

    // Update Tag
    updateTag: protectedProcedure
        .input(tagUpdateSchema)
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input;

            // Verify ownership
            const existing = await ctx.db.tag.findFirst({
                where: { id, userId: ctx.session.user.id },
            });

            if (!existing) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Tag not found",
                });
            }

            const tag = await ctx.db.tag.update({
                where: { id },
                data,
            });

            return tag;
        }),

    // Delete Tag
    deleteTag: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Verify ownership
            const existing = await ctx.db.tag.findFirst({
                where: { id: input.id, userId: ctx.session.user.id },
            });

            if (!existing) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Tag not found",
                });
            }

            await ctx.db.tag.delete({
                where: { id: input.id },
            });

            return { success: true };
        }),

    // ===== Smart Lists =====

    // Get Smart List Counts
    getSmartListCounts: protectedProcedure
        .query(async ({ ctx }) => {
            const userId = ctx.session.user.id;
            const now = new Date();

            // Start of today (midnight)
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            // End of today (23:59:59.999)
            const todayEnd = new Date(todayStart);
            todayEnd.setDate(todayEnd.getDate() + 1);
            todayEnd.setMilliseconds(-1);

            // End of next 7 days
            const weekEnd = new Date(todayStart);
            weekEnd.setDate(weekEnd.getDate() + 7);

            // Count tasks due today
            const todayCount = await ctx.db.task.count({
                where: {
                    userId,
                    completed: false,
                    dueDate: {
                        gte: todayStart,
                        lte: todayEnd,
                    },
                },
            });

            // Count tasks due within next 7 days
            const weekCount = await ctx.db.task.count({
                where: {
                    userId,
                    completed: false,
                    dueDate: {
                        gte: todayStart,
                        lt: weekEnd,
                    },
                },
            });

            // Count tasks with no due date (inbox)
            const inboxCount = await ctx.db.task.count({
                where: {
                    userId,
                    completed: false,
                    dueDate: null,
                },
            });

            // Count all uncompleted tasks
            const allCount = await ctx.db.task.count({
                where: {
                    userId,
                    completed: false,
                },
            });

            return {
                all: allCount,
                today: todayCount,
                week: weekCount,
                inbox: inboxCount,
            };
        }),
});