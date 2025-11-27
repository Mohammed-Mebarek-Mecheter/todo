import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
    handler: async (ctx) => {
        // Get the authenticated user's identity
        const identity = await ctx.auth.getUserIdentity();

        // If not authenticated, return empty array
        if (identity === null) {
            return [];
        }

        // Return only todos belonging to this user
        return await ctx.db
            .query("todos")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .collect();
    },
});

export const create = mutation({
    args: {
        text: v.string(),
    },
    handler: async (ctx, args) => {
        // Get the authenticated user's identity
        const identity = await ctx.auth.getUserIdentity();

        // Require authentication to create todos
        if (identity === null) {
            throw new Error("Not authenticated");
        }

        const newTodoId = await ctx.db.insert("todos", {
            text: args.text,
            completed: false,
            userId: identity.subject, // Associate todo with user
        });
        return await ctx.db.get(newTodoId);
    },
});

export const toggle = mutation({
    args: {
        id: v.id("todos"),
        completed: v.boolean(),
    },
    handler: async (ctx, args) => {
        // Get the authenticated user's identity
        const identity = await ctx.auth.getUserIdentity();

        if (identity === null) {
            throw new Error("Not authenticated");
        }

        // Get the todo to verify ownership
        const todo = await ctx.db.get(args.id);

        if (!todo) {
            throw new Error("Todo not found");
        }

        // Verify the todo belongs to the current user
        if (todo.userId !== identity.subject) {
            throw new Error("Not authorized to modify this todo");
        }

        await ctx.db.patch(args.id, { completed: args.completed });
        return { success: true };
    },
});

export const deleteTodo = mutation({
    args: {
        id: v.id("todos"),
    },
    handler: async (ctx, args) => {
        // Get the authenticated user's identity
        const identity = await ctx.auth.getUserIdentity();

        if (identity === null) {
            throw new Error("Not authenticated");
        }

        // Get the todo to verify ownership
        const todo = await ctx.db.get(args.id);

        if (!todo) {
            throw new Error("Todo not found");
        }

        // Verify the todo belongs to the current user
        if (todo.userId !== identity.subject) {
            throw new Error("Not authorized to delete this todo");
        }

        await ctx.db.delete(args.id);
        return { success: true };
    },
});