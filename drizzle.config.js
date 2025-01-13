export default {
    dialect: "postgresql",
    schema: './utils/db/schema.ts',
    // driver: 'pg',
    out: './drizzle',
    dbCredentials: {
        url: process.env.CONNECTION_URL,
        connectionString: process.env.CONNECTION_STRING
    }
}