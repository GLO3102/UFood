import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'UFood API',
      version: '1.0.0',
      description: 'A food delivery and restaurant discovery API',
      contact: {
        name: 'Vincent Seguin',
        url: 'https://github.com/GLO3102/UFood'
      }
    },
    servers: [
      {
        url: 'https://ufoodapi.herokuapp.com',
        description: 'API server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            rating: {
              type: 'number',
              description: 'User rating'
            },
            following: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'List of user IDs being followed'
            }
          }
        },
        Restaurant: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Restaurant ID'
            },
            name: {
              type: 'string',
              description: 'Restaurant name'
            },
            address: {
              type: 'string',
              description: 'Restaurant address'
            },
            tel: {
              type: 'string',
              description: 'Restaurant phone number'
            },
            genres: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Restaurant genres/categories'
            },
            price_range: {
              type: 'number',
              description: 'Price range (1-4)'
            },
            rating: {
              type: 'number',
              description: 'Restaurant rating'
            }
          }
        },
        FavoriteList: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Favorite list ID'
            },
            name: {
              type: 'string',
              description: 'Favorite list name'
            },
            owner: {
              type: 'string',
              description: 'Owner user ID'
            },
            restaurants: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Restaurant'
              },
              description: 'List of restaurants'
            }
          }
        },
        Visit: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Visit ID'
            },
            user_id: {
              type: 'string',
              description: 'User ID'
            },
            restaurant_id: {
              type: 'string',
              description: 'Restaurant ID'
            },
            comment: {
              type: 'string',
              description: 'Visit comment'
            },
            rating: {
              type: 'number',
              description: 'Visit rating'
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Visit date'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            password: {
              type: 'string',
              description: 'User password'
            }
          }
        },
        SignupRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              description: 'User name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            password: {
              type: 'string',
              description: 'User password'
            }
          }
        },
        TokenResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'JWT token'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            errorCode: {
              type: 'string',
              description: 'Error code'
            },
            message: {
              type: 'string',
              description: 'Error message'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./index.js'] // Path to the API files
}

const specs = swaggerJSDoc(options)

export { specs, swaggerUi }
