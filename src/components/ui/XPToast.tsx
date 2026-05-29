"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";

interface XPToastProps {
  xp: number;
  show: boolean;
}

/** Floating XP reward animation */
export default function XPToast({ xp, show }: XPToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.8 }}
          animate={{ opacity: 1, y: -60, scale: 1 }}
          exit={{ opacity: 0, y: -80 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="fixed bottom-28 right-6 z-50 flex items-center gap-1.5 bg-mm-gold text-black font-bold text-sm px-3 py-1.5 rounded-full shadow-lg"
        >
          <Star size={13} fill="currentColor" />
          +{xp} XP
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Hook để trigger XP toast */
export function useXPToast() {
  const [xp, setXP] = useState(0);
  const [show, setShow] = useState(false);

  const awardXP = (amount: number) => {
    setXP(amount);
    setShow(true);
    setTimeout(() => setShow(false), 1500);
  };

  return { xp, show, awardXP };
}
