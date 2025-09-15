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
            place_id: {
              type: 'string',
              description: 'Google Places ID'
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
              description: 'Price range (1-4)',
              minimum: 1,
              maximum: 4
            },
            rating: {
              type: 'number',
              description: 'Restaurant rating'
            },
            opening_hours: {
              type: 'object',
              properties: {
                sunday: {
                  type: 'string',
                  description: 'Opening hours for Sunday (e.g., "11:00-21:00")'
                },
                monday: {
                  type: 'string',
                  description: 'Opening hours for Monday (e.g., "11:30-22:00")'
                },
                tuesday: {
                  type: 'string',
                  description: 'Opening hours for Tuesday (e.g., "11:30-22:00")'
                },
                wednesday: {
                  type: 'string',
                  description: 'Opening hours for Wednesday (e.g., "11:30-22:00")'
                },
                thursday: {
                  type: 'string',
                  description: 'Opening hours for Thursday (e.g., "11:30-22:00")'
                },
                friday: {
                  type: 'string',
                  description: 'Opening hours for Friday (e.g., "11:30-22:00")'
                },
                saturday: {
                  type: 'string',
                  description: 'Opening hours for Saturday (e.g., "11:00-22:00")'
                }
              },
              description: 'Restaurant opening hours for each day of the week'
            },
            pictures: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri',
                description: 'URL to restaurant picture'
              },
              description: 'Array of restaurant picture URLs'
            },
            location: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['Point'],
                  description: 'GeoJSON type'
                },
                coordinates: {
                  type: 'array',
                  items: {
                    type: 'number'
                  },
                  minItems: 2,
                  maxItems: 2,
                  description: 'Longitude and latitude coordinates [longitude, latitude]'
                }
              },
              required: ['type', 'coordinates'],
              description: 'GeoJSON Point object representing restaurant location'
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
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    description: 'Restaurant ID'
                  }
                },
                required: ['id']
              },
              description: 'List of restaurant IDs'
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
