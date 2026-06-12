export interface Room {
  _id: string;
  roomName: string;
  radius: number;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  expiresAt: string;
}
