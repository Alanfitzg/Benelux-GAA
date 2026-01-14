"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

export default function CreateEventButton() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Only show for CLUB_ADMIN or SUPER_ADMIN users
  const isAdmin =
    session?.user?.role === "CLUB_ADMIN" ||
    session?.user?.role === "SUPER_ADMIN";

  // Don't render anything while loading or if user is not an admin
  if (status === "loading" || !isAdmin) {
    return null;
  }

  const handleCreateEvent = () => {
    router.push("/events/create");
  };

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleCreateEvent}
      className="inline-block bg-red-600 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-lg hover:bg-red-700 transition font-semibold shadow-sm hover:shadow-md text-sm md:text-base"
    >
      <span className="hidden md:inline">CREATE EVENT</span>
      <span className="md:hidden">Create Event</span>
    </motion.button>
  );
}
