import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import LocationModel from "../../../../model/Location.model";

const PUBLIC_ROOM_RADIUS_METERS = 5000;

export async function GET(request: NextRequest) {
  await dbConnect();

  const searchParams = request.nextUrl.searchParams;
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      {
        success: false,
        message: "Latitude and longitude are required",
      },
      { status: 400 },
    );
  }

  const now = new Date();
  await LocationModel.deleteMany({ expiresAt: { $lte: now } });

  const rooms = await LocationModel.find({
    expiresAt: { $gt: now },
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        $maxDistance: PUBLIC_ROOM_RADIUS_METERS,
      },
    },
  }).limit(10);

  return NextResponse.json({
    success: true,
    rooms,
  });
}
