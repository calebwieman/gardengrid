import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User accounts
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    createdAt: v.number(),
  }).index("email", ["email"]),

  // User gardens
  gardens: defineTable({
    userId: v.id("users"),
    name: v.string(),
    gridSize: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("userId", ["userId"]),

  // Plants placed in gardens
  placedPlants: defineTable({
    gardenId: v.id("gardens"),
    plantId: v.string(),
    x: v.number(),
    y: v.number(),
    plantedAt: v.optional(v.number()),
    stage: v.optional(v.union(v.literal("seedling"), v.literal("growing"), v.literal("ready"))),
  }).index("gardenId", ["gardenId"]),

  // Journal entries
  journalEntries: defineTable({
    gardenId: v.id("gardens"),
    text: v.string(),
    type: v.union(v.literal("observation"), v.literal("tip"), v.literal("harvest"), v.literal("problem")),
    createdAt: v.number(),
  }).index("gardenId", ["gardenId"]),

  // Reminders
  reminders: defineTable({
    gardenId: v.id("gardens"),
    title: v.string(),
    notes: v.optional(v.string()),
    dueDate: v.number(),
    completed: v.boolean(),
    recurringDays: v.optional(v.number()),
    createdAt: v.number(),
  }).index("gardenId", ["gardenId"]),

  // Seed vault / inventory
  seedVault: defineTable({
    userId: v.id("users"),
    plantId: v.string(),
    quantity: v.number(),
    expirationDate: v.optional(v.number()),
    purchasedDate: v.optional(v.number()),
  }).index("userId", ["userId"]),

  // Cost tracking
  expenses: defineTable({
    gardenId: v.id("gardens"),
    category: v.string(),
    description: v.string(),
    amount: v.number(),
    date: v.number(),
  }).index("gardenId", ["gardenId"]),
});
