import dbConnect from "../../../../lib/dbConnect";
import LocationModel from "../../../../model/Location.model";
import { createLocationSchema } from "../../../../Schemas/LocationSchema";
import { getServerSession } from "next-auth";
import { User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

const EARTH_RADIUS_IN_METERS = 6378137;

export async function POST(request: Request) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !user?._id) {
      return Response.json(
        {
          success: false,
          message: "Not Authenticated",
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsedBody = createLocationSchema.safeParse(body);

    if (!parsedBody.success) {
      return Response.json(
        {
          success: false,
          message: parsedBody.error.errors[0]?.message || "Invalid room data",
        },
        { status: 400 },
      );
    }

    const { roomName, radius = 5000, location } = parsedBody.data;
    const { latitude, longitude } = location;

    const roomsInRadius = await LocationModel.countDocuments({
      location: {
        $geoWithin: {
          $centerSphere: [
            [longitude, latitude],
            radius / EARTH_RADIUS_IN_METERS,
          ],
        },
      },
    });

    if (roomsInRadius >= 10) {
      return Response.json(
        {
          success: false,
          message:
            "This area already has 10 public rooms. Join an existing room.",
        },
        { status: 409 },
      );
    }

    const newLocation = new LocationModel({
      roomName,
      radius,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      creatorId: user._id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    await newLocation.save();

    return Response.json(
      {
        success: true,
        message: "Public Room created successfully",
        data: newLocation,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating location:", error);
    return Response.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
