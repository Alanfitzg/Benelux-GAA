"use client";

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import AuthModal from '@/components/AuthModal';

export default function CreateEventButton() {
  const router = useRouter();
  const { requireAuth, showAuthModal, closeAuthModal } = useAuthCheck();

  const handleCreateEvent = () => {
    requireAuth(() => {
      router.push('/events/create');
    });
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCreateEvent}
        className="inline-block bg-red-600 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-lg hover:bg-red-700 transition font-semibold shadow-sm hover:shadow-md text-sm md:text-base"
      >
        <span className="hidden md:inline">CREATE EVENT</span>
        <span className="md:hidden">Create Event</span>
      </motion.button>

      <AuthModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        message="You need to be signed in to create an event. Join our community to share tournaments and connect with GAA clubs worldwide!"
        redirectPath="/events/create"
      />
    </>
  );
}