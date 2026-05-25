import dbConnect from "../../../../lib/dbConnect";
import LocationModel from "../../../../model/Location.model";

export async function POST(request: Request) {
    console.log("Received request to create location");
  await dbConnect();

  try {
    const body = await request.json();
    const { roomName, radius, location, creatorId } = body;

    if (!roomName || !location) {
      return Response.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 },
      );
    }

    const newLocation = new LocationModel({
      roomName,
      radius,
      location: {
        type: "Point",
        coordinates: [location.longitude, location.latitude],
      },
     creatorId: creatorId, 
     expiresAt: new Date(
      Date.now() + 60 * 60 * 1000
   )
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
