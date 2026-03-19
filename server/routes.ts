import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  habits,
  insertHabitSchema, 
  insertHabitCompletionSchema,
  insertStudySessionSchema,
  insertStudySessionContentSchema,
  insertAppUsageSchema,
  habitCategories,
  studyTopics,
  studyContent
} from "@shared/schema";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handler for validation errors
  const handleValidationError = (error: unknown, res: Response) => {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.message });
    }
    return res.status(500).json({ error: "An unexpected error occurred" });
  };

  // Get reference data
  app.get("/api/reference/categories", (_req, res) => {
    res.json(habitCategories);
  });

  app.get("/api/reference/study-topics", (_req, res) => {
    res.json(studyTopics);
  });

  app.get("/api/reference/study-content", (_req, res) => {
    res.json(studyContent);
  });

  // Habits endpoints
  app.post("/api/habits", async (req, res) => {
    try {
      const habitData = insertHabitSchema.parse(req.body);
      const habit = await storage.createHabit(habitData);
      res.status(201).json(habit);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.get("/api/habits", async (req, res) => {
    // Using a fixed userId for now as we don't have auth yet
    const userId = 1;
    const habits = await storage.getHabitsByUserId(userId);
    res.json(habits);
  });

  app.get("/api/habits/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid habit ID" });
    }

    const habit = await storage.getHabit(id);
    if (!habit) {
      return res.status(404).json({ error: "Habit not found" });
    }

    res.json(habit);
  });

  app.put("/api/habits/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid habit ID" });
    }

    try {
      const habitData = insertHabitSchema.partial().parse(req.body);
      const updatedHabit = await storage.updateHabit(id, habitData);
      
      if (!updatedHabit) {
        return res.status(404).json({ error: "Habit not found" });
      }
      
      res.json(updatedHabit);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.delete("/api/habits/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid habit ID" });
    }

    const success = await storage.deleteHabit(id);
    if (!success) {
      return res.status(404).json({ error: "Habit not found" });
    }

    res.status(204).send();
  });

  // Habit Completion endpoints
  app.post("/api/habits/completion", async (req, res) => {
    try {
      const completionData = insertHabitCompletionSchema.parse(req.body);
      const completion = await storage.createHabitCompletion(completionData);
      res.status(201).json(completion);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.get("/api/habits/completions/today", async (req, res) => {
    // Using a fixed userId for now
    const userId = 1;
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const completions = await storage.getHabitCompletionsByDate(userId, today);
    res.json(completions);
  });

  app.get("/api/habits/completions/:habitId", async (req, res) => {
    const habitId = parseInt(req.params.habitId);
    if (isNaN(habitId)) {
      return res.status(400).json({ error: "Invalid habit ID" });
    }

    const startDateStr = req.query.startDate as string;
    const endDateStr = req.query.endDate as string;

    // Validate dates
    try {
      z.string().datetime().parse(startDateStr);
      z.string().datetime().parse(endDateStr);
    } catch (error) {
      return res.status(400).json({ error: "Invalid date format. Use ISO format (YYYY-MM-DD)." });
    }

    const completions = await storage.getHabitCompletions(habitId, startDateStr, endDateStr);
    res.json(completions);
  });

  app.put("/api/habits/completion/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid completion ID" });
    }

    try {
      const { completed } = z.object({ completed: z.boolean() }).parse(req.body);
      const updatedCompletion = await storage.updateHabitCompletion(id, completed);
      
      if (!updatedCompletion) {
        return res.status(404).json({ error: "Completion record not found" });
      }
      
      res.json(updatedCompletion);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  // Study Session endpoints
  app.post("/api/study-sessions", async (req, res) => {
    try {
      const sessionData = insertStudySessionSchema.parse(req.body);
      const session = await storage.createStudySession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.get("/api/study-sessions", async (req, res) => {
    // Using a fixed userId for now
    const userId = 1;
    const sessions = await storage.getStudySessionsByUserId(userId);
    res.json(sessions);
  });

  app.get("/api/study-sessions/today", async (req, res) => {
    // Using a fixed userId for now
    const userId = 1;
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const sessions = await storage.getStudySessionsByDate(userId, today);
    res.json(sessions);
  });

  app.put("/api/study-sessions/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid session ID" });
    }

    try {
      const sessionData = insertStudySessionSchema.partial().parse(req.body);
      const updatedSession = await storage.updateStudySession(id, sessionData);
      
      if (!updatedSession) {
        return res.status(404).json({ error: "Study session not found" });
      }
      
      res.json(updatedSession);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  // Study Session Content endpoints
  app.post("/api/study-session-content", async (req, res) => {
    try {
      const contentData = insertStudySessionContentSchema.parse(req.body);
      const content = await storage.createStudySessionContent(contentData);
      res.status(201).json(content);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.get("/api/study-session-content/:sessionId", async (req, res) => {
    const sessionId = parseInt(req.params.sessionId);
    if (isNaN(sessionId)) {
      return res.status(400).json({ error: "Invalid session ID" });
    }

    const contents = await storage.getStudySessionContentBySessionId(sessionId);
    res.json(contents);
  });

  app.put("/api/study-session-content/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid content ID" });
    }

    try {
      const { completed } = z.object({ completed: z.boolean() }).parse(req.body);
      const updatedContent = await storage.updateStudySessionContent(id, completed);
      
      if (!updatedContent) {
        return res.status(404).json({ error: "Study session content not found" });
      }
      
      res.json(updatedContent);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  // App Usage endpoints
  app.post("/api/app-usage", async (req, res) => {
    try {
      const usageData = insertAppUsageSchema.parse(req.body);
      const usage = await storage.createAppUsage(usageData);
      res.status(201).json(usage);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.get("/api/app-usage/today", async (req, res) => {
    // Using a fixed userId for now
    const userId = 1;
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const usage = await storage.getAppUsageByDate(userId, today);
    res.json(usage);
  });

  app.get("/api/app-usage/week", async (req, res) => {
    // Using a fixed userId for now
    const userId = 1;
    const today = new Date();
    const startDate = format(startOfWeek(today), 'yyyy-MM-dd');
    const endDate = format(endOfWeek(today), 'yyyy-MM-dd');
    
    const usage = await storage.getAppUsageByDateRange(userId, startDate, endDate);
    res.json(usage);
  });

  app.get("/api/app-usage/most-used", async (req, res) => {
    // Using a fixed userId for now
    const userId = 1;
    const startDateStr = req.query.startDate as string || format(startOfWeek(new Date()), 'yyyy-MM-dd');
    const endDateStr = req.query.endDate as string || format(endOfWeek(new Date()), 'yyyy-MM-dd');
    
    try {
      const mostUsedApp = await storage.getMostUsedApp(userId, startDateStr, endDateStr);
      res.json(mostUsedApp || { appName: "None", totalMinutes: 0 });
    } catch (error) {
      res.status(500).json({ error: "Failed to get most used app" });
    }
  });

  // Stats endpoints
  app.get("/api/stats/streaks", async (req, res) => {
    // Using a fixed userId for now
    const userId = 1;
    
    try {
      const streaks = await storage.getCurrentStreaks(userId);
      res.json(streaks);
    } catch (error) {
      res.status(500).json({ error: "Failed to get streaks" });
    }
  });

  app.get("/api/stats/completion-rate/:habitId", async (req, res) => {
    const habitId = parseInt(req.params.habitId);
    if (isNaN(habitId)) {
      return res.status(400).json({ error: "Invalid habit ID" });
    }

    const startDateStr = req.query.startDate as string || format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const endDateStr = req.query.endDate as string || format(endOfMonth(new Date()), 'yyyy-MM-dd');
    
    try {
      const completionRate = await storage.getCompletionRate(habitId, startDateStr, endDateStr);
      res.json(completionRate);
    } catch (error) {
      res.status(500).json({ error: "Failed to get completion rate" });
    }
  });

  app.get("/api/stats/overall", async (req, res) => {
    // Using a fixed userId for now
    const userId = 1;
    
    try {
      const today = new Date();
      const startOfMonthStr = format(startOfMonth(today), 'yyyy-MM-dd');
      const endOfMonthStr = format(endOfMonth(today), 'yyyy-MM-dd');
      
      // Get all habits
      const habits = await storage.getHabitsByUserId(userId);
      
      // Get streaks
      const streaks = await storage.getCurrentStreaks(userId);
      const longestStreak = streaks.length > 0 ? Math.max(...streaks.map(s => s.streak)) : 0;
      
      // Calculate overall completion rate for the month
      let totalCompleted = 0;
      let totalScheduled = 0;
      
      for (const habit of habits) {
        const { completed, total } = await storage.getCompletionRate(habit.id, startOfMonthStr, endOfMonthStr);
        totalCompleted += completed;
        totalScheduled += total;
      }
      
      const overallCompletionRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
      
      res.json({
        completionRate: overallCompletionRate,
        longestStreak,
        totalHabits: habits.length,
        habitsCompleted: totalCompleted
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get overall stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
