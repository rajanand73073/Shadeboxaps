import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import LocationModel from "../../../../model/Location.model";

export async function GET(request: NextRequest) {
  await dbConnect();

  const searchParams = request.nextUrl.searchParams;
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const radius = Number(searchParams.get("radius") || 5000);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      {
        success: false,
        message: "Latitude and longitude are required",
      },
      { status: 400 },
    );
  }

  const rooms = await LocationModel.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        $maxDistance: Number.isFinite(radius) && radius > 0 ? radius : 5000,
      },
    },
  }).limit(10);

  return NextResponse.json({
    success: true,
    rooms,
  });
}
