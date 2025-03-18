export const connectionSchemas = {
  postgres: {
    connectionSpecification: {
      properties: {
        // ... other fields ...
        port: {
          type: "number",
          title: "Port",
          default: 5432,
          description: "Database port number",
          minimum: 1,
          maximum: 65535
        },
        // ... other fields ...
      },
      required: ["host", "port", "database", "username", "password"]
    }
  },
  mysql: {
    connectionSpecification: {
      properties: {
        // ... other fields ...
        port: {
          type: "number",
          title: "Port",
          default: 3306,
          description: "Database port number",
          minimum: 1,
          maximum: 65535
        },
        // ... other fields ...
      },
      required: ["host", "port", "database", "username", "password"]
    }
  },
  snowflake: {
    connectionSpecification: {
      properties: {
        host: {
          type: "string",
          title: "Host",
          description: "Your Snowflake host name",
          required: true
        },
        role: {
          type: "string",
          title: "Role",
          description: "Your Snowflake role",
          required: true
        },
        warehouse: {
          type: "string",
          title: "Warehouse",
          description: "Your Snowflake warehouse",
          required: true
        },
        database: {
          type: "string",
          title: "Database",
          description: "Your Snowflake database",
          required: true
        },
        schema: {
          type: "string",
          title: "Schema",
          description: "Your Snowflake schema",
          required: true
        },
        username: {
          type: "string",
          title: "Username",
          description: "Your Snowflake username",
          required: true
        },
        password: {
          type: "string",
          title: "Password",
          description: "Your Snowflake password",
          required: true
        },
        jdbc_url_params: {
          type: "string",
          title: "JDBC URL Parameters (Advanced)",
          description: "Additional JDBC URL parameters (optional)",
          required: false
        }
      },
      required: [
        "host",
        "role",
        "warehouse",
        "database",
        "schema",
        "username",
        "password"
      ]
    }
  }
}; 