import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { table } = await params;
  
  // Whitelist tables to prevent SQL injection
  const allowedTables = ["topics", "clips", "recording_plans", "weekly_reviews"];
  if (!allowedTables.includes(table)) {
    return new NextResponse("Invalid table", { status: 400 });
  }

  try {
    const rows = await query(`SELECT * FROM ${table}`);
    if (rows.length === 0) {
      return new NextResponse("No data available to export", { status: 400 });
    }

    // Generate CSV Header
    const headers = Object.keys(rows[0]);
    let csvContent = headers.join(",") + "\n";

    // Generate CSV Rows
    rows.forEach((row) => {
      const line = headers.map((header) => {
        let val = row[header];
        if (val === null || val === undefined) {
          return '""';
        }
        // Escape quotes and wrap in quotes if contains comma/newline
        let valStr = strFormat(val);
        if (valStr.includes(",") || valStr.includes('"') || valStr.includes("\n") || valStr.includes("\r")) {
          valStr = `"${valStr.replace(/"/g, '""')}"`;
        }
        return valStr;
      });
      csvContent += line.join(",") + "\n";
    });

    // Return as file download attachment response
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="equacast_${table}_export_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("CSV Export error:", error);
    return new NextResponse("Database export failure", { status: 500 });
  }
}

function strFormat(val: any): string {
  if (typeof val === "object") {
    return JSON.stringify(val);
  }
  return String(val);
}
