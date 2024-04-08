// src/lib/db/db.ts
import { drizzle } from "drizzle-orm/d1";

import * as schema from "$lib/db/schema";

export function initializeDrizzle(D1: D1Database) {
  return drizzle(D1, { schema });
}
