const { z } = require("zod");

const name = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(50, "Name must be at most 50 characters")
  .regex(/^[A-Za-z ]+$/, "Name cannot contain numbers or symbols")
  .refine((v) => !v.includes("@"), "Name cannot contain @");

const email = z.string().trim().email("Enter a valid email address").transform((v) => v.toLowerCase());

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a symbol");

const semesterName = z.string().trim().min(1).max(64);

const moduleSchema = z.object({
  name: z.string().trim().min(1).max(120),
  credits: z.coerce.number().finite().min(0.5).max(60),
  grade: z.enum(["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"]),
});

const modulesArray = z.array(moduleSchema).min(1).max(40);

module.exports = {
  schemas: {
    auth: {
      register: z.object({
        body: z.object({
          name,
          email,
          password,
          university: z.string().trim().max(120).optional().default(""),
          currentSemester: z.string().trim().max(64).optional().default("Semester 1"),
        }),
        params: z.object({}).passthrough(),
        query: z.object({}).passthrough(),
        headers: z.object({}).passthrough(),
      }),
      login: z.object({
        body: z.object({
          email,
          password: z.string().min(1),
        }),
        params: z.object({}).passthrough(),
        query: z.object({}).passthrough(),
        headers: z.object({}).passthrough(),
      }),
    },
    gpa: {
      calculate: z.object({
        body: z.object({ modules: modulesArray }),
        params: z.object({}).passthrough(),
        query: z.object({}).passthrough(),
        headers: z.object({}).passthrough(),
      }),
      saveSemester: z.object({
        body: z.object({
          semesterName,
          modules: modulesArray,
        }),
        params: z.object({}).passthrough(),
        query: z.object({}).passthrough(),
        headers: z.object({}).passthrough(),
      }),
      deleteSemester: z.object({
        body: z.object({}).passthrough(),
        params: z.object({ name: semesterName }),
        query: z.object({}).passthrough(),
        headers: z.object({}).passthrough(),
      }),
    },
    ai: {
      predict: z.object({
        body: z.object({
          cgpa: z.coerce.number().finite().min(0).max(4),
          semesters: z.coerce.number().int().min(0).max(50),
          totalCredits: z.coerce.number().finite().min(0).max(5000),
        }),
        params: z.object({}).passthrough(),
        query: z.object({}).passthrough(),
        headers: z.object({}).passthrough(),
      }),
      advice: z.object({
        body: z.object({
          message: z.string().trim().min(5).max(2000),
          cgpa: z.coerce.number().finite().min(0).max(4).optional(),
          semesterName: semesterName.optional(),
        }),
        params: z.object({}).passthrough(),
        query: z.object({}).passthrough(),
        headers: z.object({}).passthrough(),
      }),
    },
  },
};

