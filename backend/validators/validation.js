const { z } = require("zod");

// Common validation patterns
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const vehicleNumberRegex = /^[A-Z0-9]{1,10}$/i;
const slotIdRegex = /^[A-Z]-\d{2}$/;

// Auth validation schemas
const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .trim()
    .refine((val) => val.length > 0, "Name cannot be empty"),

  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .min(5, "Email must be at least 5 characters")
    .max(100, "Email must not exceed 100 characters")
    .toLowerCase()
    .trim()
    .refine((val) => emailRegex.test(val), "Invalid email format"),

  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters")
    .refine(
      (val) => /[A-Z]/.test(val),
      "Password must contain at least one uppercase letter"
    )
    .refine(
      (val) => /[a-z]/.test(val),
      "Password must contain at least one lowercase letter"
    )
    .refine(
      (val) => /[0-9]/.test(val),
      "Password must contain at least one number"
    )
    .refine(
      (val) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val),
      "Password must contain at least one special character"
    ),

  vehicleNumber: z
    .string({ required_error: "Vehicle number is required" })
    .min(4, "Vehicle number must be at least 4 characters")
    .max(15, "Vehicle number must not exceed 15 characters")
    .trim()
    .transform((val) => val.toUpperCase())
    .refine((val) => val.length > 0, "Vehicle number cannot be empty"),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .toLowerCase()
    .trim()
    .min(1, "Email cannot be empty"),

  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password cannot be empty"),
});

// Parking validation schemas
const bookSlotSchema = z.object({
  slotId: z
    .string({ required_error: "Slot ID is required" })
    .trim()
    .regex(slotIdRegex, "Invalid slot ID format. Must be like A-01, B-02, etc.")
    .refine(
      (val) => val.length === 4,
      "Slot ID must be 4 characters (e.g., A-01)"
    ),

  vehicleNumber: z
    .string({ required_error: "Vehicle number is required" })
    .trim()
    .min(2, "Vehicle number must be at least 2 characters")
    .max(10, "Vehicle number must not exceed 10 characters")
    .regex(
      vehicleNumberRegex,
      "Vehicle number can only contain alphanumeric characters"
    )
    .transform((val) => val.toUpperCase()),
});

// Admin validation schemas
const releaseSlotSchema = z.object({
  slotId: z
    .string({ required_error: "Slot ID is required" })
    .trim()
    .regex(slotIdRegex, "Invalid slot ID format. Must be like A-01, B-02, etc.")
    .refine(
      (val) => val.length === 4,
      "Slot ID must be 4 characters (e.g., A-01)"
    ),
});

const slotIdParamSchema = z.object({
  slotId: z
    .string({ required_error: "Slot ID is required" })
    .trim()
    .regex(slotIdRegex, "Invalid slot ID format. Must be like A-01, B-02, etc.")
    .refine(
      (val) => val.length === 4,
      "Slot ID must be 4 characters (e.g., A-01)"
    ),
});

const updateSlotStatusSchema = z.object({
  status: z.enum(["available", "occupied", "maintenance"], {
    errorMap: () => ({
      message: "Status must be: available, occupied, or maintenance",
    }),
  }),
});

const userIdParamSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),
});

const reserveSlotSchema = z.object({
  slotId: z
    .string({ required_error: "Slot ID is required" })
    .trim()
    .regex(slotIdRegex, "Invalid slot ID format. Must be like A-01, B-02, etc.")
    .refine(
      (val) => val.length === 4,
      "Slot ID must be 4 characters (e.g., A-01)"
    ),
  vehicleNumber: z
    .string({ required_error: "Vehicle number is required" })
    .trim()
    .min(2, "Vehicle number must be at least 2 characters")
    .max(10, "Vehicle number must not exceed 10 characters")
    .regex(
      vehicleNumberRegex,
      "Vehicle number can only contain alphanumeric characters"
    )
    .transform((val) => val.toUpperCase()),
  // arrivalTime is now calculated server-side, so removed from schema
});

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Validate body for POST/PUT requests
      if (["POST", "PUT", "PATCH"].includes(req.method) && schema.body) {
        req.body = schema.body.parse(req.body);
      }

      // Validate params
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }

      // Validate query
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          error: "Validation failed",
          details: errors,
        });
      }

      return res.status(400).json({
        error: "Invalid request data",
        message: error.message,
      });
    }
  };
};

module.exports = {
  validate,
  schemas: {
    registerSchema,
    loginSchema,
    bookSlotSchema,
    releaseSlotSchema,
    slotIdParamSchema,
    updateSlotStatusSchema,
    userIdParamSchema,
    reserveSlotSchema,
  },
};
