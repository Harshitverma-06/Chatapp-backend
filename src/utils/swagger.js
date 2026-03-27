import swaggerJsdoc from "swagger-jsdoc"


const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Chat App API",
      version: "1.0.0",
      description: "ChatApp API documentation for user authentication and messaging",
      contact: {
        name: "Chat App Support"
      }
    },
    tags: [
        {
            name: "Authentication",
            description: "User authentication endpoints including signup, login, logout, and profile management"
        },
        {
            name: "Message",
            description: "Messaging endpoints for sending and retrieving messages"
        },
    ],
    servers: [
      {
        url: "/",
        description: "Current server"
      },
    ],
    components: {
        securitySchemes: {
            Bearer: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
                description: "JWT token for authentication"
            },
            ApiKeyAuth: {
                type: "apiKey",
                in: "cookie",
                name: "accessToken",
                description: "API key authorization via cookie"
            }
        },
        schemas: {
            User: {
                type: "object",
                properties: {
                    _id: {
                        type: "string",
                        description: "User ID"
                    },
                    username: {
                        type: "string",
                        description: "Unique username"
                    },
                    email: {
                        type: "string",
                        format: "email",
                        description: "User email address"
                    },
                    fullname: {
                        type: "string",
                        description: "Full name of the user"
                    },
                    avatar: {
                        type: "string",
                        description: "URL to user avatar image"
                    },
                    createdAt: {
                        type: "string",
                        format: "date-time"
                    },
                    updatedAt: {
                        type: "string",
                        format: "date-time"
                    }
                }
            },
            Message: {
                type: "object",
                properties: {
                    _id: {
                        type: "string",
                        description: "Message ID"
                    },
                    senderId: {
                        type: "string",
                        description: "ID of the user sending the message"
                    },
                    receiverId: {
                        type: "string",
                        description: "ID of the user receiving the message"
                    },
                    text: {
                        type: "string",
                        description: "Text content of the message"
                    },
                    image: {
                        type: "string",
                        description: "URL to image attachment (optional)"
                    },
                    createdAt: {
                        type: "string",
                        format: "date-time"
                    },
                    updatedAt: {
                        type: "string",
                        format: "date-time"
                    }
                }
            },
            ApiResponse: {
                type: "object",
                properties: {
                    success: {
                        type: "boolean"
                    },
                    data: {
                        type: "object"
                    },
                    message: {
                        type: "string"
                    },
                    errors: {
                        type: "array",
                        items: {
                            type: "string"
                        }
                    }
                }
            },
            Error: {
                type: "object",
                properties: {
                    success: {
                        type: "boolean",
                        example: false
                    },
                    message: {
                        type: "string"
                    },
                    errors: {
                        type: "array",
                        items: {
                            type: "string"
                        }
                    }
                }
            }
        }
    }
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);
export { swaggerSpec }


