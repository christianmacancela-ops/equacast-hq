import { createClient } from "@libsql/client";
import path from "path";

// SQLite database file in the project root
const dbPath = path.join(process.cwd(), "local.db");

export const client = createClient({
  url: `file:${dbPath}`,
});

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  try {
    const res = await client.execute({ sql, args: params });
    const rows: T[] = [];
    
    // Convert rows from libsql format into clean key-value objects
    for (const row of res.rows) {
      const obj: any = {};
      res.columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      rows.push(obj);
    }
    return rows;
  } catch (error) {
    console.error("Database query error:", error, "SQL:", sql, "Params:", params);
    throw error;
  }
}

export async function execute(sql: string, params: any[] = []): Promise<any> {
  try {
    return await client.execute({ sql, args: params });
  } catch (error) {
    console.error("Database execute error:", error, "SQL:", sql, "Params:", params);
    throw error;
  }
}
