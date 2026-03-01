import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/markets`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[api/v1/markets] proxy error", err);
    return NextResponse.json(
      { message: "Failed to fetch markets" },
      { status: 502 },
    );
  }
}
