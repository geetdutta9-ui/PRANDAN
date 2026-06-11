import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("====== BLOOD BANK REGISTER ======");
    console.log("NAME:", body.bloodBankName);
    console.log("EMAIL:", body.email);
    console.log("PHONE:", body.phone);
    console.log("DISTRICT:", body.district);
    console.log("================================");

    return NextResponse.json({
      success: true,
      message: "Blood Bank Registration API Working",
      receivedData: body,
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