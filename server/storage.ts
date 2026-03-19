import { 
  habits, type Habit, type InsertHabit,
  habitCompletions, type HabitCompletion, type InsertHabitCompletion,
  studySessions, type StudySession, type InsertStudySession,
  studySessionContent, type StudySessionContent, type InsertStudySessionContent,
  appUsage, type AppUsage, type InsertAppUsage,
  habitCategories, studyTopics, studyContent
} from "@shared/schema";
import { format, addDays, isAfter, isBefore, isSameDay, parseISO, subDays } from "date-fns";

type User = { id: number; username: string; password: string };
type InsertUser = { username: string; password: string };

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Habits
  createHabit(habit: InsertHabit): Promise<Habit>;
  getHabit(id: number): Promise<Habit | undefined>;
  getHabitsByUserId(userId: number): Promise<Habit[]>;
  updateHabit(id: number, habit: Partial<Habit>): Promise<Habit | undefined>;
  deleteHabit(id: number): Promise<boolean>;
  
  // Habit Completions
  createHabitCompletion(completion: InsertHabitCompletion): Promise<HabitCompletion>;
  getHabitCompletions(habitId: number, startDate: string, endDate: string): Promise<HabitCompletion[]>;
  getHabitCompletionsByDate(userId: number, date: string): Promise<HabitCompletion[]>;
  updateHabitCompletion(id: number, completed: boolean): Promise<HabitCompletion | undefined>;
  
  // Study Sessions
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  getStudySessionsByUserId(userId: number): Promise<StudySession[]>;
  getStudySessionsByDate(userId: number, date: string): Promise<StudySession[]>;
  updateStudySession(id: number, session: Partial<StudySession>): Promise<StudySession | undefined>;
  deleteStudySession(id: number): Promise<boolean>;
  
  // Study Session Content
  createStudySessionContent(content: InsertStudySessionContent): Promise<StudySessionContent>;
  getStudySessionContentBySessionId(sessionId: number): Promise<StudySessionContent[]>;
  updateStudySessionContent(id: number, completed: boolean): Promise<StudySessionContent | undefined>;
  
  // App Usage
  createAppUsage(usage: InsertAppUsage): Promise<AppUsage>;
  getAppUsageByDate(userId: number, date: string): Promise<AppUsage[]>;
  getAppUsageByDateRange(userId: number, startDate: string, endDate: string): Promise<AppUsage[]>;
  getMostUsedApp(userId: number, startDate: string, endDate: string): Promise<{ appName: string, totalMinutes: number } | undefined>;
  
  // Helper Methods
  getCurrentStreaks(userId: number): Promise<{ habitId: number, habitName: string, streak: number }[]>;
  getCompletionRate(habitId: number, startDate: string, endDate: string): Promise<{ completed: number, total: number, rate: number }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private habits: Map<number, Habit>;
  private habitCompletions: Map<number, HabitCompletion>;
  private studySessions: Map<number, StudySession>;
  private studySessionContents: Map<number, StudySessionContent>;
  private appUsages: Map<number, AppUsage>;

  private usersCurrentId: number;
  private habitsCurrentId: number;
  private habitCompletionsCurrentId: number;
  private studySessionsCurrentId: number;
  private studySessionContentsCurrentId: number;
  private appUsagesCurrentId: number;

  constructor() {
    this.users = new Map();
    this.habits = new Map();
    this.habitCompletions = new Map();
    this.studySessions = new Map();
    this.studySessionContents = new Map();
    this.appUsages = new Map();

    this.usersCurrentId = 1;
    this.habitsCurrentId = 1;
    this.habitCompletionsCurrentId = 1;
    this.studySessionsCurrentId = 1;
    this.studySessionContentsCurrentId = 1;
    this.appUsagesCurrentId = 1;
    
    // Create a default user
    this.createUser({ username: "demo", password: "password" });
    
    // Create some initial habits for the default user
    const initialHabits = [
      {
        name: "Meditação Matinal",
        categoryId: 4,
        time: "08:00:00",
        duration: 15,
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
        notes: "Comece com 5 minutos de exercícios de respiração",
        userId: 1
      },
      {
        name: "Leitura",
        categoryId: 3,
        time: "21:30:00",
        duration: 30,
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
        notes: "Lendo livros e artigos técnicos",
        userId: 1
      },
      {
        name: "Exercício",
        categoryId: 1,
        time: "17:30:00",
        duration: 45,
        monday: true,
        tuesday: false,
        wednesday: true,
        thursday: false,
        friday: true,
        saturday: false,
        sunday: true,
        notes: "Alternar entre cardio e musculação",
        userId: 1
      }
    ];
    
    initialHabits.forEach(habit => this.createHabit(habit as InsertHabit));
    
    // Create some initial study sessions
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    
    const initialStudySessions = [
      {
        topicId: 1, // Frontend Roadmap
        date: todayStr,
        duration: 60,
        completed: false,
        userId: 1
      },
      {
        topicId: 2, // Algorithms
        date: todayStr,
        duration: 60,
        completed: false,
        userId: 1
      },
      {
        topicId: 3, // Programming Logic
        date: todayStr,
        duration: 60,
        completed: true,
        userId: 1
      }
    ];
    
    // Create study sessions and their content
    initialStudySessions.forEach(async (session) => {
      const createdSession = await this.createStudySession(session as InsertStudySession);
      
      // Determine topic name
      const topicName = studyTopics.find(t => t.id === session.topicId)?.name || "";
      
      // Add content items based on topic
      if (topicName && studyContent[topicName as keyof typeof studyContent]) {
        const contentItems = studyContent[topicName as keyof typeof studyContent].slice(0, 3);
        
        contentItems.forEach((item, index) => {
          this.createStudySessionContent({
            sessionId: createdSession.id,
            content: item,
            completed: session.topicId === 3 ? true : (session.topicId === 1 && index < 2)
          });
        });
      }
    });
    
    // Create app usage data
    const initialAppUsage = [
      {
        appName: "Twitter",
        date: todayStr,
        durationMinutes: 45,
        userId: 1
      },
      {
        appName: "Instagram",
        date: todayStr,
        durationMinutes: 30,
        userId: 1
      },
      {
        appName: "HabitTrack",
        date: todayStr,
        durationMinutes: 30,
        userId: 1
      }
    ];
    
    initialAppUsage.forEach(usage => this.createAppUsage(usage as InsertAppUsage));
    
    // Create habit completions for the past 14 days to show streaks and patterns
    this.populateInitialHabitCompletions();
  }
  
  private populateInitialHabitCompletions() {
    const today = new Date();
    const habits = Array.from(this.habits.values());
    
    // For each habit, create completions for the past 14 days
    habits.forEach(habit => {
      for (let i = 0; i < 14; i++) {
        const date = format(subDays(today, i), 'yyyy-MM-dd');
        const dayOfWeek = format(subDays(today, i), 'EEEE').toLowerCase();
        
        // Only create completions for days the habit is scheduled
        if (habit[dayOfWeek as keyof Habit] as boolean) {
          // Randomize completion but with a bias toward completion (70% chance)
          const completed = Math.random() < 0.7;
          
          // For Reading habit (id 2), ensure a higher completion rate for an impressive streak
          const isCompleted = habit.id === 2 ? (i < 12 || Math.random() < 0.8) : completed;
          
          this.createHabitCompletion({
            habitId: habit.id,
            date,
            completed: isCompleted,
            userId: habit.userId
          });
        }
      }
    });
  }

  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.usersCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Habit Methods
  async createHabit(habit: InsertHabit): Promise<Habit> {
    const id = this.habitsCurrentId++;
    const newHabit: Habit = { ...habit, id };
    this.habits.set(id, newHabit);
    return newHabit;
  }

  async getHabit(id: number): Promise<Habit | undefined> {
    return this.habits.get(id);
  }

  async getHabitsByUserId(userId: number): Promise<Habit[]> {
    return Array.from(this.habits.values()).filter(habit => habit.userId === userId);
  }

  async updateHabit(id: number, habitUpdate: Partial<Habit>): Promise<Habit | undefined> {
    const habit = this.habits.get(id);
    if (!habit) return undefined;
    
    const updatedHabit = { ...habit, ...habitUpdate };
    this.habits.set(id, updatedHabit);
    return updatedHabit;
  }

  async deleteHabit(id: number): Promise<boolean> {
    return this.habits.delete(id);
  }

  // Habit Completion Methods
  async createHabitCompletion(completion: InsertHabitCompletion): Promise<HabitCompletion> {
    // Check if there's already a completion for this habit on this date
    const existingCompletion = Array.from(this.habitCompletions.values()).find(
      c => c.habitId === completion.habitId && c.date === completion.date
    );
    
    if (existingCompletion) {
      // Update the existing completion
      return this.updateHabitCompletion(existingCompletion.id, completion.completed) as Promise<HabitCompletion>;
    }
    
    const id = this.habitCompletionsCurrentId++;
    const newCompletion: HabitCompletion = { ...completion, id };
    this.habitCompletions.set(id, newCompletion);
    return newCompletion;
  }

  async getHabitCompletions(habitId: number, startDate: string, endDate: string): Promise<HabitCompletion[]> {
    return Array.from(this.habitCompletions.values()).filter(completion => {
      const completionDate = parseISO(completion.date);
      return completion.habitId === habitId && 
             (isAfter(completionDate, parseISO(startDate)) || isSameDay(completionDate, parseISO(startDate))) && 
             (isBefore(completionDate, parseISO(endDate)) || isSameDay(completionDate, parseISO(endDate)));
    });
  }

  async getHabitCompletionsByDate(userId: number, date: string): Promise<HabitCompletion[]> {
    // Get all habits for this user
    const userHabits = await this.getHabitsByUserId(userId);
    const habitIds = userHabits.map(h => h.id);
    
    // Find completions for these habits on the specific date
    return Array.from(this.habitCompletions.values()).filter(
      completion => habitIds.includes(completion.habitId) && completion.date === date
    );
  }

  async updateHabitCompletion(id: number, completed: boolean): Promise<HabitCompletion | undefined> {
    const completion = this.habitCompletions.get(id);
    if (!completion) return undefined;
    
    const updatedCompletion = { ...completion, completed };
    this.habitCompletions.set(id, updatedCompletion);
    return updatedCompletion;
  }

  // Study Session Methods
  async createStudySession(session: InsertStudySession): Promise<StudySession> {
    const id = this.studySessionsCurrentId++;
    const newSession: StudySession = { ...session, id };
    this.studySessions.set(id, newSession);
    return newSession;
  }

  async getStudySessionsByUserId(userId: number): Promise<StudySession[]> {
    return Array.from(this.studySessions.values()).filter(session => session.userId === userId);
  }

  async getStudySessionsByDate(userId: number, date: string): Promise<StudySession[]> {
    return Array.from(this.studySessions.values()).filter(
      session => session.userId === userId && session.date === date
    );
  }

  async updateStudySession(id: number, sessionUpdate: Partial<StudySession>): Promise<StudySession | undefined> {
    const session = this.studySessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...sessionUpdate };
    this.studySessions.set(id, updatedSession);
    return updatedSession;
  }

  async deleteStudySession(id: number): Promise<boolean> {
    return this.studySessions.delete(id);
  }

  // Study Session Content Methods
  async createStudySessionContent(content: InsertStudySessionContent): Promise<StudySessionContent> {
    const id = this.studySessionContentsCurrentId++;
    const newContent: StudySessionContent = { ...content, id };
    this.studySessionContents.set(id, newContent);
    return newContent;
  }

  async getStudySessionContentBySessionId(sessionId: number): Promise<StudySessionContent[]> {
    return Array.from(this.studySessionContents.values()).filter(
      content => content.sessionId === sessionId
    );
  }

  async updateStudySessionContent(id: number, completed: boolean): Promise<StudySessionContent | undefined> {
    const content = this.studySessionContents.get(id);
    if (!content) return undefined;
    
    const updatedContent = { ...content, completed };
    this.studySessionContents.set(id, updatedContent);
    return updatedContent;
  }

  // App Usage Methods
  async createAppUsage(usage: InsertAppUsage): Promise<AppUsage> {
    const id = this.appUsagesCurrentId++;
    const newUsage: AppUsage = { ...usage, id };
    this.appUsages.set(id, newUsage);
    return newUsage;
  }

  async getAppUsageByDate(userId: number, date: string): Promise<AppUsage[]> {
    return Array.from(this.appUsages.values()).filter(
      usage => usage.userId === userId && usage.date === date
    );
  }

  async getAppUsageByDateRange(userId: number, startDate: string, endDate: string): Promise<AppUsage[]> {
    return Array.from(this.appUsages.values()).filter(usage => {
      const usageDate = parseISO(usage.date);
      return usage.userId === userId && 
             (isAfter(usageDate, parseISO(startDate)) || isSameDay(usageDate, parseISO(startDate))) && 
             (isBefore(usageDate, parseISO(endDate)) || isSameDay(usageDate, parseISO(endDate)));
    });
  }

  async getMostUsedApp(userId: number, startDate: string, endDate: string): Promise<{ appName: string, totalMinutes: number } | undefined> {
    const usages = await this.getAppUsageByDateRange(userId, startDate, endDate);
    
    // Group by app name and sum the durations
    const appUsageTotals = usages.reduce((acc, usage) => {
      const { appName, durationMinutes } = usage;
      acc[appName] = (acc[appName] || 0) + durationMinutes;
      return acc;
    }, {} as Record<string, number>);
    
    // Find the app with the highest usage
    let mostUsedApp: string | null = null;
    let maxDuration = 0;
    
    Object.entries(appUsageTotals).forEach(([appName, duration]) => {
      if (duration > maxDuration) {
        mostUsedApp = appName;
        maxDuration = duration;
      }
    });
    
    return mostUsedApp ? { appName: mostUsedApp, totalMinutes: maxDuration } : undefined;
  }

  // Helper Methods
  async getCurrentStreaks(userId: number): Promise<{ habitId: number, habitName: string, streak: number }[]> {
    const habits = await this.getHabitsByUserId(userId);
    const result: { habitId: number, habitName: string, streak: number }[] = [];
    
    for (const habit of habits) {
      let streak = 0;
      let date = new Date();
      let keepCounting = true;
      
      while (keepCounting) {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayOfWeek = format(date, 'EEEE').toLowerCase();
        
        // Check if habit is scheduled for this day of week
        if (habit[dayOfWeek as keyof Habit] as boolean) {
          // Find completion for this date
          const completions = Array.from(this.habitCompletions.values()).filter(
            c => c.habitId === habit.id && c.date === dateStr
          );
          
          const isCompleted = completions.length > 0 && completions[0].completed;
          
          if (isCompleted) {
            streak++;
          } else {
            keepCounting = false;
          }
        }
        
        // Move to previous day
        date = subDays(date, 1);
        
        // Limit streak checking to 100 days to prevent infinite loop
        if (streak > 100) {
          keepCounting = false;
        }
      }
      
      result.push({
        habitId: habit.id,
        habitName: habit.name,
        streak
      });
    }
    
    // Sort by streak (descending)
    return result.sort((a, b) => b.streak - a.streak);
  }

  async getCompletionRate(habitId: number, startDate: string, endDate: string): Promise<{ completed: number, total: number, rate: number }> {
    const completions = await this.getHabitCompletions(habitId, startDate, endDate);
    const habit = await this.getHabit(habitId);
    
    if (!habit) {
      return { completed: 0, total: 0, rate: 0 };
    }
    
    // Count completed days
    const completedCount = completions.filter(c => c.completed).length;
    
    // Count total days the habit was scheduled between start and end dates
    let totalScheduledDays = 0;
    let currentDate = parseISO(startDate);
    const endDateObj = parseISO(endDate);
    
    while (!isAfter(currentDate, endDateObj)) {
      const dayOfWeek = format(currentDate, 'EEEE').toLowerCase();
      
      if (habit[dayOfWeek as keyof Habit] as boolean) {
        totalScheduledDays++;
      }
      
      currentDate = addDays(currentDate, 1);
    }
    
    const rate = totalScheduledDays > 0 ? (completedCount / totalScheduledDays) * 100 : 0;
    
    return {
      completed: completedCount,
      total: totalScheduledDays,
      rate: Math.round(rate)
    };
  }
}

export const storage = new MemStorage();
