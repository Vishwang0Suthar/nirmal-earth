// postgresql://neondb_owner:usn0dYHPW7Gk@ep-empty-darkness-a1qfqqec.ap-southeast-1.aws.neon.tech/nirmal-earth?sslmode=require
import { neon } from "@neondatabase/serverless";

import * as schema from "./schema";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(process.env.CONNECTION_URL);

export const db = drizzle(sql, schema);
