import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rawBranches, rawServices] = await Promise.all([
      db.cRMLead.groupBy({
        by: ["branch"],
        _count: { _all: true },
        orderBy: { _count: { branch: "desc" } },
      }),
      db.cRMLead.groupBy({
        by: ["service"],
        _count: { _all: true },
        orderBy: { _count: { service: "desc" } },
      }),
    ]);

    const branches = rawBranches.map((b) => b.branch).filter((b): b is string => Boolean(b));
    const services = rawServices.map((s) => s.service).filter((s): s is string => Boolean(s));

    // Group branches by region (Miền Tây, Miền Đông, TP.HCM)
    const regionalGrouping = {
      "Khu Vực TP.HCM": branches.filter((b) =>
        ["Thủ Đức", "Gò Vấp", "Quận 7", "Tân Bình", "Bình Thạnh", "Quận 10", "Quận 12"].some((k) =>
          b.toLowerCase().includes(k.toLowerCase())
        )
      ),
      "Khu Vực Miền Tây": branches.filter((b) =>
        ["Cà Mau", "Cần Thơ", "An Giang", "Kiên Giang", "Bạc Liêu", "Sóc Trăng", "Vĩnh Long", "Tiền Giang"].some((k) =>
          b.toLowerCase().includes(k.toLowerCase())
        )
      ),
      "Khu Vực Miền Đông & Khác": branches.filter((b) =>
        ["Biên Hòa", "Đồng Nai", "Bình Dương", "Tây Ninh", "Đà Lạt", "Vũng Tàu"].some((k) =>
          b.toLowerCase().includes(k.toLowerCase())
        )
      ),
    };

    return NextResponse.json({
      success: true,
      data: {
        totalBranches: branches.length,
        totalServices: services.length,
        branches,
        services,
        regionalGrouping,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Lỗi tải phân loại CRM" }, { status: 500 });
  }
}
