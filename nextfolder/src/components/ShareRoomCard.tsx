"use client";

import { motion } from "framer-motion";
import { Copy, X, Send, MessageCircle, Link as LinkIcon } from "lucide-react";

type Props = {
  roomId: string;
  onClose?: () => void;
};

export default function ShareRoomCard({ roomId, onClose }: Props) {
  const roomLink = `${typeof window !== "undefined" ? window.location.origin : ""}/chat/chat-room/${roomId}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(roomLink);
    alert("Link copied!");
  };

  const shareWhatsapp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(roomLink)}`,
      "_blank",
    );
  };

  const shareTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(roomLink)}`,
      "_blank",
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      {/* Animated Card */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6 w-[90%] max-w-md text-center relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-2">🎉 Room Created!</h2>
        <p className="text-sm text-zinc-500 mb-4">
          Share this link with your friends to join anonymously
        </p>

        {/* Link Box */}
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2 text-sm mb-4">
          <LinkIcon size={16} />
          <span className="truncate">{roomLink}</span>
          <button
            onClick={copyLink}
            className="ml-auto text-blue-600 hover:text-blue-800"
          >
            <Copy size={16} />
          </button>
        </div>

        {/* Social Icons */}
        <div className="flex justify-center gap-6 mt-4">
          <button
            onClick={shareWhatsapp}
            className="p-3 rounded-full bg-green-500 text-white hover:scale-110 transition"
          >
            <MessageCircle size={20} />
          </button>

          <button
            onClick={shareTelegram}
            className="p-3 rounded-full bg-blue-500 text-white hover:scale-110 transition"
          >
            <Send size={20} />
          </button>
        </div>

        <p className="text-xs text-zinc-400 mt-4">
          Room auto-expires in 1 hour
        </p>
      </motion.div>
    </div>
  );
}
