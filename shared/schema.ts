import { pgTable, text, serial, integer, boolean, date, time } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

// Habit Categories
export const habitCategories = [
  { id: 1, name: "Saúde & Fitness", color: "#10B981" },
  { id: 2, name: "Produtividade", color: "#0891B2" },
  { id: 3, name: "Aprendizado", color: "#0D9488" },
  { id: 4, name: "Bem-estar", color: "#3B82F6" },
  { id: 5, name: "Outros", color: "#6B7280" },
];

// Habits Table
export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  categoryId: integer("category_id").notNull(),
  time: time("time"),
  duration: integer("duration"), // in minutes
  monday: boolean("monday").default(true),
  tuesday: boolean("tuesday").default(true),
  wednesday: boolean("wednesday").default(true),
  thursday: boolean("thursday").default(true),
  friday: boolean("friday").default(true),
  saturday: boolean("saturday").default(false),
  sunday: boolean("sunday").default(false),
  notes: text("notes"),
  userId: integer("user_id").notNull(),
});

export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
});

export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;

// Habit Completions Table
export const habitCompletions = pgTable("habit_completions", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull(),
  date: date("date").notNull(),
  completed: boolean("completed").default(false),
  userId: integer("user_id").notNull(),
});

export const insertHabitCompletionSchema = createInsertSchema(habitCompletions).omit({
  id: true,
});

export type InsertHabitCompletion = z.infer<typeof insertHabitCompletionSchema>;
export type HabitCompletion = typeof habitCompletions.$inferSelect;

// Study Topics
export const studyTopics = [
  { id: 1, name: "Roadmap Frontend", color: "#0D9488" },
  { id: 2, name: "Algoritmos", color: "#10B981" },
  { id: 3, name: "Lógica de Programação", color: "#F59E0B" },
];

// Study Content organized by topic
export const studyContent = {
  "Roadmap Frontend": [
    "Semântica HTML",
    "Fundamentos CSS",
    "Fundamentos JavaScript",
    "Design Responsivo",
    "Frameworks CSS",
    "Fundamentos React",
    "Gerenciamento de Estado",
    "Integração de APIs"
  ],
  "Algoritmos": [
    "Algoritmos de Ordenação",
    "Notação Big O",
    "Algoritmos de Busca",
    "Programação Dinâmica",
    "Recursão"
  ],
  "Lógica de Programação": [
    "Estruturas de Controle",
    "Funções",
    "Tipos de Dados",
    "Tratamento de Erros",
    "Programação Orientada a Objetos"
  ]
};

// Study Sessions Table
export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull(),
  date: date("date").notNull(),
  duration: integer("duration").default(60), // in minutes
  completed: boolean("completed").default(false),
  userId: integer("user_id").notNull(),
});

export const insertStudySessionSchema = createInsertSchema(studySessions).omit({
  id: true,
});

export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
export type StudySession = typeof studySessions.$inferSelect;

// Study Session Content - tracks which content items are included/completed in a session
export const studySessionContent = pgTable("study_session_content", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  content: text("content").notNull(),
  completed: boolean("completed").default(false),
});

export const insertStudySessionContentSchema = createInsertSchema(studySessionContent).omit({
  id: true,
});

export type InsertStudySessionContent = z.infer<typeof insertStudySessionContentSchema>;
export type StudySessionContent = typeof studySessionContent.$inferSelect;

// App Usage Records
export const appUsage = pgTable("app_usage", {
  id: serial("id").primaryKey(),
  appName: text("app_name").notNull(),
  date: date("date").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  userId: integer("user_id").notNull(),
});

export const insertAppUsageSchema = createInsertSchema(appUsage).omit({
  id: true,
});

export type InsertAppUsage = z.infer<typeof insertAppUsageSchema>;
export type AppUsage = typeof appUsage.$inferSelect;
