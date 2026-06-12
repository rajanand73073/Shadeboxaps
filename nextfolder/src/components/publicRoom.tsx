"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LoaderCircle, MapPin, Plus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Room } from "@/types/room";

type Coordinates = {
  latitude: number;
  longitude: number;
};

const DEFAULT_RADIUS = 5000;
const MAX_PUBLIC_ROOMS_PER_RADIUS = 10;

export default function PublicRoom() {
  const router = useRouter();
  const { status } = useSession();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [roomName, setRoomName] = useState("");
  const [radius, setRadius] = useState(DEFAULT_RADIUS);

  const fetchNearbyRooms = async (coords: Coordinates, roomRadius = radius) => {
    const response = await axios.get(
      `/api/public-room/nearby-rooms?lat=${coords.latitude}&lng=${coords.longitude}&radius=${roomRadius}`,
    );

    setRooms(response.data.rooms || []);
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setLocation(coords);

        try {
          await fetchNearbyRooms(coords, DEFAULT_RADIUS);
        } catch (error) {
          console.log(error);
          setError("Failed to fetch rooms");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.log(error);
        setError("Location permission denied");
        setLoading(false);
      },
    );
  }, []);

  const handleCreateRoom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (status !== "authenticated") {
      toast({
        title: "Login required",
        description: "Please sign in before creating a public room.",
        variant: "destructive",
      });
      return;
    }

    if (!location) {
      toast({
        title: "Location missing",
        description: "Allow location access to create a nearby public room.",
        variant: "destructive",
      });
      return;
    }

    if (rooms.length >= MAX_PUBLIC_ROOMS_PER_RADIUS) {
      toast({
        title: "Room limit reached",
        description: "This area already has 10 public rooms. Join one nearby.",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);

    try {
      const response = await axios.post("/api/public-room/create-public-room", {
        roomName,
        radius,
        location,
      });

      const createdRoom = response.data.data;
      toast({
        title: "Public room created",
        description: "Joining your room now.",
      });
      router.push(`/chat/chat-room/${createdRoom._id}?type=public`);
    } catch (error) {
      console.log(error);
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Please try again later.";

      toast({
        title: "Could not create room",
        description: message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const joinRoom = (roomId: string) => {
    router.push(`/chat/chat-room/${roomId}?type=public`);
  };

  return (
    <div className="min-h-screen bg-[#080914] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[360px_1fr]">
        <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-300">
              <MapPin size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Public Rooms</h1>
              <p className="text-sm text-gray-400">
                Create or join nearby rooms.
              </p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleCreateRoom}>
            <div className="space-y-2">
              <Label htmlFor="roomName">Room name</Label>
              <Input
                id="roomName"
                minLength={1}
                placeholder="Campus hangout"
                required
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                className="border-white/10 bg-black/20 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="radius">Radius in meters</Label>
              <Input
                id="radius"
                min={1}
                type="number"
                value={radius}
                onChange={(event) => setRadius(Number(event.target.value))}
                className="border-white/10 bg-black/20 text-white"
              />
            </div>

            <Button
              className="w-full gap-2"
              disabled={
                creating ||
                loading ||
                rooms.length >= MAX_PUBLIC_ROOMS_PER_RADIUS
              }
              type="submit"
            >
              {creating ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              Create Public Room
            </Button>

            {rooms.length >= MAX_PUBLIC_ROOMS_PER_RADIUS && (
              <p className="text-sm text-amber-300">
                This radius already has 10 rooms. Join an existing room nearby.
              </p>
            )}
          </form>
        </section>

        <section className="min-h-[520px] rounded-lg border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Nearby Rooms</h2>
              <p className="text-sm text-gray-400">
                {location
                  ? `${rooms.length}/10 rooms found in this radius`
                  : "Waiting for location"}
              </p>
            </div>
            {loading && (
              <LoaderCircle className="h-5 w-5 animate-spin text-emerald-300" />
            )}
          </div>

          {loading ? (
            <div className="flex h-[360px] flex-col items-center justify-center gap-4 text-gray-300">
              <MapPin className="text-emerald-300" size={32} />
              <p>Scanning nearby public rooms...</p>
            </div>
          ) : error ? (
            <div className="flex h-[360px] items-center justify-center text-red-300">
              {error}
            </div>
          ) : rooms.length === 0 ? (
            <div className="flex h-[360px] flex-col items-center justify-center gap-2 text-center text-gray-300">
              <Users size={32} />
              <h3 className="text-lg font-medium text-white">
                No nearby rooms found
              </h3>
              <p className="text-sm text-gray-400">
                Create the first public room in this radius.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {rooms.map((room) => (
                <article
                  className="flex flex-col gap-4 rounded-lg border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                  key={room._id}
                >
                  <div>
                    <h3 className="text-lg font-medium">{room.roomName}</h3>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={15} />
                        {room.radius.toFixed(0)}m
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users size={15} />
                        Public chat
                      </span>
                    </div>
                  </div>

                  <Button onClick={() => joinRoom(room._id)} type="button">
                    Join
                  </Button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
