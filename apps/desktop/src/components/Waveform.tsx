import React from "react";
import { motion } from "framer-motion";

interface WaveformProps {
  index: number;
  isRecording: boolean;
  voiceDetected: boolean;
  baseHeight?: number;
  silentHeight?: number;
}

export function Waveform({
  index,
  isRecording,
  voiceDetected,
  baseHeight = 20,
  silentHeight = 20,
}: WaveformProps) {
  // Calculate animation values
  const minHeight = silentHeight;
  const maxHeight = baseHeight;
  const midHeight = minHeight + (maxHeight - minHeight) * 0.6;

  if (!isRecording) {
    return <div className="h-[15%] w-[2px] rounded-full bg-white" />;
  }

  return (
    <motion.div
      className="w-[2px] rounded-full bg-white"
      style={{ height: `${silentHeight}%` }}
      animate={{
        height: voiceDetected
          ? [
              `${midHeight}%`,
              `${maxHeight}%`,
              `${midHeight}%`,
              `${minHeight + 5}%`,
              `${midHeight}%`,
            ]
          : `${silentHeight}%`,
      }}
      transition={{
        duration: voiceDetected ? 0.6 : 0.3,
        ease: "easeInOut",
        repeat: voiceDetected ? Number.POSITIVE_INFINITY : 0,
        repeatType: "loop",
        delay: index * 0.03,
        type: "tween",
      }}
    />
  );
}
