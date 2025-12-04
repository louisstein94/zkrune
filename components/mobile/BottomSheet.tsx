"use client";

/**
 * Mobile-friendly bottom sheet component
 */

import { useState, useEffect, ReactNode } from 'react';
import { useSwipe } from '@/lib/hooks/useSwipe';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  snapPoints?: number[]; // Percentage heights [30, 60, 90]
  defaultSnapPoint?: number;
}

export default function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [40, 70, 95],
  defaultSnapPoint = 1,
}: BottomSheetProps) {
  const [currentSnapPoint, setCurrentSnapPoint] = useState(defaultSnapPoint);
  const [isDragging, setIsDragging] = useState(false);

  const swipeHandlers = useSwipe({
    onSwipeDown: () => {
      if (currentSnapPoint === 0) {
        onClose();
      } else {
        setCurrentSnapPoint(Math.max(0, currentSnapPoint - 1));
      }
    },
    onSwipeUp: () => {
      setCurrentSnapPoint(Math.min(snapPoints.length - 1, currentSnapPoint + 1));
    },
    minSwipeDistance: 30,
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentHeight = snapPoints[currentSnapPoint];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-zk-dark rounded-t-3xl z-50 shadow-2xl transition-all duration-300 animate-slide-up"
        style={{ height: `${currentHeight}vh` }}
        {...swipeHandlers}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-zk-gray/30 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="px-6 py-4 border-b border-zk-gray/20">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-hatton text-white">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-zk-gray/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-zk-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto px-6 py-4" style={{ height: title ? 'calc(100% - 80px)' : 'calc(100% - 40px)' }}>
          {children}
        </div>

        {/* Snap Point Indicators */}
        <div className="absolute right-4 top-20 flex flex-col gap-2">
          {snapPoints.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSnapPoint(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSnapPoint === index
                  ? 'bg-zk-primary scale-125'
                  : 'bg-zk-gray/30 hover:bg-zk-gray/50'
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
}

