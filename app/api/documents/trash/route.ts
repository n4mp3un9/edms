import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET /api/documents/trash
export async function GET() {
  try {
    const db = getDb();

    const [rows] = await db.execute(
      `SELECT id,
              title,
              department,
              tags,
              description,
              access_level,
              file_url,
              original_filenames,
              created_at,
              edited_at
       FROM edms_documents
       WHERE is_deleted = 1
       ORDER BY edited_at DESC, created_at DESC, id DESC`
    );

    return NextResponse.json({ documents: rows });
  } catch (error) {
    console.error("Error fetching deleted documents:", error);
    return NextResponse.json(
      { message: "ไม่สามารถดึงรายการเอกสารถูกลบได้" },
      { status: 500 }
    );
  }
}
