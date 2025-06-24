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
        className="inline-block mt-6 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-semibold shadow-lg hover:shadow-xl"
      >
        CREATE EVENT
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