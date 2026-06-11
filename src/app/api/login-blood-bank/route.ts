import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("====== BLOOD BANK LOGIN ======");
    console.log("EMAIL:", body.email);
    console.log("==============================");

    return NextResponse.json({
      success: true,
      message: "Blood Bank Login API Working",
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
      },
      { status: 500 }
    );
  }
}