"use client";

import multivatar from "@/lib/multivatar";

type AvatarProps = {
  Seed: string;
  isMessageComponent?: boolean;
};

export default function Avatar({
  Seed,
  isMessageComponent = false,
}: AvatarProps) {
  const svg = multivatar(Seed);

  return (
    <div
      className={
        isMessageComponent
          ? "w-full h-full mt-10 "
          : "w-40 h-40 mx-auto my-4 border rounded-full overflow-hidden"
      }
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
