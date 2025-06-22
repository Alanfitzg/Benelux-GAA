"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useAnimation, useMotionValue, PanInfo } from "framer-motion";

interface BottomSheetProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  snapPoints?: number[]; // Percentages of screen height
  defaultSnap?: number; // Index of default snap point
}

export default function BottomSheet({
  children,
  isOpen,
  onClose,
  snapPoints = [0.1, 0.5, 0.9], // 10%, 50%, 90% of screen height
  defaultSnap = 1, // Default to middle snap point
}: BottomSheetProps) {
  const [currentSnapIndex, setCurrentSnapIndex] = useState(defaultSnap);
  const controls = useAnimation();
  const y = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const getSnapHeight = useCallback((index: number) => {
    if (typeof window === "undefined") return 0;
    return window.innerHeight * (1 - snapPoints[index]);
  }, [snapPoints]);

  useEffect(() => {
    if (isOpen) {
      controls.start({
        y: getSnapHeight(currentSnapIndex),
        transition: { type: "spring", damping: 30, stiffness: 300 },
      });
    } else {
      controls.start({
        y: window.innerHeight,
        transition: { type: "spring", damping: 30, stiffness: 300 },
      });
    }
  }, [isOpen, currentSnapIndex, controls, getSnapHeight]);

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    const currentY = y.get();
    const velocity = info.velocity.y;
    
    // Find closest snap point
    let closestSnapIndex = 0;
    let closestDistance = Infinity;
    
    snapPoints.forEach((_, index) => {
      const snapY = getSnapHeight(index);
      const distance = Math.abs(currentY - snapY);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestSnapIndex = index;
      }
    });

    // Apply velocity bias
    if (velocity > 500 && closestSnapIndex < snapPoints.length - 1) {
      closestSnapIndex++;
    } else if (velocity < -500 && closestSnapIndex > 0) {
      closestSnapIndex--;
    }

    // Close if dragged past the last snap point
    if (currentY > getSnapHeight(snapPoints.length - 1) + 100) {
      onClose?.();
      return;
    }

    setCurrentSnapIndex(closestSnapIndex);
    controls.start({
      y: getSnapHeight(closestSnapIndex),
      transition: { type: "spring", damping: 30, stiffness: 300 },
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/20 z-40 md:hidden"
      />
      
      {/* Bottom Sheet */}
      <motion.div
        ref={containerRef}
        initial={{ y: "100%" }}
        animate={controls}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 md:hidden"
      >
        {/* Handle */}
        <div className="flex justify-center p-3 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>
        
        {/* Content */}
        <div 
          ref={contentRef}
          className="overflow-y-auto"
          style={{ 
            maxHeight: `calc(${snapPoints[snapPoints.length - 1] * 100}vh - 60px)` 
          }}
        >
          {children}
        </div>
      </motion.div>
    </>
  );
}