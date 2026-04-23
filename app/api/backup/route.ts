import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { BackupSystem } from "@/lib/backup";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const backups = BackupSystem.listBackups();
    return NextResponse.json({
      backups,
      total: backups.length
    });
  } catch (error) {
    console.error("Backup list error:", error);
    return NextResponse.json({ error: "Failed to list backups" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { action, data } = body || {};

  try {
    switch (action) {
      case 'create': {
        const { userId } = data;
        
        if (!userId) {
          return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        // Admin only check
        const isAdmin = ["Admin", "DarianBayan", "TowerAdmin"].includes(user.username);
        if (!isAdmin) {
          return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        const backupPath = await BackupSystem.createBackup(userId);
        return NextResponse.json({ 
          success: true, 
          message: "Backup created",
          backupPath 
        });
      }

      case 'restore': {
        const { backupFile } = data;
        
        if (!backupFile) {
          return NextResponse.json({ error: "Backup file required" }, { status: 400 });
        }

        // Admin only check
        const isAdmin = ["Admin", "DarianBayan", "TowerAdmin"].includes(user.username);
        if (!isAdmin) {
          return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        await BackupSystem.restoreBackup(backupFile);
        return NextResponse.json({ 
          success: true, 
          message: "Backup restored successfully" 
        });
      }

      case 'delete': {
        const { backupFile } = data;
        
        if (!backupFile) {
          return NextResponse.json({ error: "Backup file required" }, { status: 400 });
        }

        // Admin only check
        const isAdmin = ["Admin", "DarianBayan", "TowerAdmin"].includes(user.username);
        if (!isAdmin) {
          return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        const success = BackupSystem.deleteBackup(backupFile);
        return NextResponse.json({ 
          success, 
          message: success ? "Backup deleted" : "Failed to delete backup" 
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Backup API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
