import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    todos: defineTable({
        text: v.string(),
        completed: v.boolean(),
        userId: v.string(), // Store the user's ID from Better Auth
    }).index("by_user", ["userId"]), // Index for efficient querying by user
});