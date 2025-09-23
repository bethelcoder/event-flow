const swaggerJsdoc = require('swagger-jsdoc');
const path = require("path");

// Swagger Setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Event Flow API Documentation",
      version: "1.0.0",
      description: "Secure Event Flow API accessible using JWT Token and API key external access authentication."
    },
    servers: [
      { url: "https://event-flow-6514.onrender.com" } // Replace with your deployed URL
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key"
        }
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64f222222222222222222222" },
            googleId: { type: "string", example: "google123456" },
            email: { type: "string", example: "staff@example.com" },
            displayName: { type: "string", example: "Jane Staff" },
            role: { type: "string", enum: ['manager','guest','staff','security'], example: "staff" },
            createdAt: { type: "string", format: "date-time", example: "2025-09-19T10:00:00Z" }
          }
        },
        Guest: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64f333333333333333333333" },
            fullName: { type: "string", example: "Guest Name" },
            email: { type: "string", example: "guest@example.com" },
            eventId: { type: "string", example: "64f123abc1234def56789ghi" },
            qrCode: { type: "string", example: "EncryptedQRCodeDataHere" },
            qrCodeUrl: { type: "string", example: "data:image/png;base64,iVBORw0..." },
            refNumber: { type: "string", example: "EVT-2025-0001" },
            checkedIn: { type: "boolean", example: false },
            createdAt: { type: "string", format: "date-time", example: "2025-09-19T10:00:00Z" }
          }
        },
        Event: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64f123abc1234def56789ghi" },
            name: { type: "string", example: "Techno AI Conference 2025" },
            description: { type: "string", example: "Annual AI event" },
            dateTime: { type: "string", format: "date-time", example: "2025-12-01T09:00:00Z" },
            expectedAttendees: { type: "integer", example: 200 },
            organizer: {
              type: "object",
              properties: {
                id: { type: "string", example: "64f111111111111111111111" },
                name: { type: "string", example: "John Doe" },
                contactEmail: { type: "string", example: "john@example.com" },
                contactPhone: { type: "string", example: "+1234567890" }
              }
            }
          }
        }
      }
    },
    security: [{ ApiKeyAuth: [] }]
  },
  apis: [path.join(__dirname, "../routes/*.js")], // location of API doc comments
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
module.exports = swaggerSpec;
