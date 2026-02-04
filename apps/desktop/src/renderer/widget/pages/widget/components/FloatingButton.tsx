import React, { useState, useRef, useEffect, useCallback } from "react";
import { Square, X, Sparkles, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Waveform } from "@/components/Waveform";
import { useRecording } from "@/hooks/useRecording";
import { api } from "@/trpc/react";
import { PresetMenu } from "../../../components/PresetMenu";
import { PRESET_COLORS, type PresetColorId } from "@/types/formatter";
import { useMouseEventCapture } from "../../../contexts/MouseEventContext";

function getPresetColorClass(colorId: PresetColorId | undefined): string {
  const color = PRESET_COLORS.find((c) => c.id === colorId);
  return color?.class ?? "text-yellow-500";
}

function getPresetBgColorClass(colorId: PresetColorId | undefined): string {
  const colorMap: Record<string, string> = {
    yellow: "bg-yellow-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    pink: "bg-pink-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
  };
  return colorMap[colorId ?? "yellow"] ?? "bg-yellow-500";
}

const NUM_WAVEFORM_BARS = 12;
const NUM_PROCESSING_DOTS = 6;
const HOVER_DEBOUNCE_MS = 100;

const StopButton: React.FC<{ onClick: (e: React.MouseEvent) => void }> = ({
  onClick,
}) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center w-[28px] h-[18px] rounded bg-red-500/20 hover:bg-red-500/40 active:bg-red-500/60 transition-colors"
    aria-label="Stop recording"
  >
    <Square className="w-[10px] h-[10px] text-red-500 fill-red-500" />
  </button>
);

const CancelButton: React.FC<{ onClick: (e: React.MouseEvent) => void }> = ({
  onClick,
}) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center w-[20px] h-[20px] rounded transition-colors hover:bg-white/10"
    aria-label="Cancel recording"
  >
    <X className="w-[12px] h-[12px] text-gray-400" />
  </button>
);

const ProcessingIndicator: React.FC<{ colorId?: PresetColorId }> = ({ colorId }) => {
  const bgColor = getPresetBgColorClass(colorId);
  return (
    <div className="flex gap-[4px] items-center justify-center flex-1 h-6">
      {Array.from({ length: NUM_PROCESSING_DOTS }).map((_, index) => (
        <motion.div
          key={index}
          className={`w-1 h-1 ${bgColor} rounded-full`}
          animate={{
            y: [0, -3, 0],
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut",
            repeat: Infinity,
            delay: index * 0.08,
          }}
        />
      ))}
    </div>
  );
};

const WaveformVisualization: React.FC<{
  isRecording: boolean;
  voiceDetected: boolean;
}> = ({ isRecording, voiceDetected }) => (
  <>
    {Array.from({ length: NUM_WAVEFORM_BARS }).map((_, index) => (
      <Waveform
        key={index}
        index={index}
        isRecording={isRecording}
        voiceDetected={voiceDetected}
        baseHeight={60}
        silentHeight={20}
      />
    ))}
  </>
);

export const FloatingButton: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { enableCapture, disableCapture, forceDisable } = useMouseEventCapture();

  const { data: formatterConfig } = api.settings.getFormatterConfig.useQuery();
  const { data: activePreset } = api.settings.getActivePreset.useQuery();
  const isFormatterEnabled = formatterConfig?.enabled ?? false;
  const presets = formatterConfig?.presets ?? [];

  const {
    recordingStatus,
    stopRecording,
    cancelRecording,
    voiceDetected,
    startRecording,
  } = useRecording();

  const isIdle = recordingStatus.state === "idle";
  const isRecording =
    recordingStatus.state === "recording" ||
    recordingStatus.state === "starting";
  const isStopping = recordingStatus.state === "stopping";
  const isHandsFreeMode = recordingStatus.mode === "hands-free";

  const clearLeaveTimeout = useCallback(() => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  }, []);

  // Capture enabled when hovering or preset menu is open
  const captureEnabled = showPresetMenu || isHovered;

  // Sync capture state
  useEffect(() => {
    if (captureEnabled) {
      enableCapture();
    } else {
      disableCapture();
    }
  }, [captureEnabled, enableCapture, disableCapture]);

  // Keep resetting failsafe timer while capture is enabled
  useEffect(() => {
    if (!captureEnabled) return;

    const interval = setInterval(() => {
      enableCapture();
    }, 2000);

    return () => clearInterval(interval);
  }, [captureEnabled, enableCapture]);

  // Handle recording state changes - only close preset menu
  const prevRecordingStateRef = useRef(recordingStatus.state);
  useEffect(() => {
    const prevState = prevRecordingStateRef.current;
    const currentState = recordingStatus.state;
    prevRecordingStateRef.current = currentState;

    if (prevState !== currentState) {
      console.log(`[FloatingButton] State change: ${prevState} -> ${currentState}`);
      setShowPresetMenu(false);

      // Reset hover when going to idle (recording finished)
      if (currentState === "idle") {
        setIsHovered(false);
      }
    }
  }, [recordingStatus.state]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearLeaveTimeout();
      forceDisable();
    };
  }, [clearLeaveTimeout, forceDisable]);

  const handleButtonClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isIdle) {
        setIsHovered(false);
        forceDisable();
        await startRecording();
      }
    },
    [isIdle, startRecording, forceDisable]
  );

  const handleStopClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsHovered(false);
      forceDisable();
      await stopRecording();
    },
    [stopRecording, forceDisable]
  );

  const handleCancelClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsHovered(false);
      forceDisable();
      await cancelRecording();
    },
    [cancelRecording, forceDisable]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Only in idle state
      if (!isIdle) return;
      if (!isFormatterEnabled || presets.length === 0) return;

      setMenuPosition({ x: e.clientX, y: e.clientY - 10 });
      setShowPresetMenu(true);
    },
    [isIdle, isFormatterEnabled, presets.length]
  );

  const handleClosePresetMenu = useCallback(() => {
    clearLeaveTimeout();
    setShowPresetMenu(false);
    setIsHovered(false);
    forceDisable();
  }, [clearLeaveTimeout, forceDisable]);

  const handleMouseEnter = useCallback(() => {
    clearLeaveTimeout();
    setIsHovered(true);
  }, [clearLeaveTimeout]);

  const handleMouseLeave = useCallback(() => {
    if (showPresetMenu) return;

    clearLeaveTimeout();
    leaveTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, HOVER_DEBOUNCE_MS);
  }, [showPresetMenu, clearLeaveTimeout]);

  const expanded = isRecording || isStopping || isHovered;

  // Show pointer cursor when clickable
  const isClickable = expanded && (isIdle || (isHandsFreeMode && isRecording));

  const getWidthStyle = (): { width: string } | undefined => {
    if (!expanded) return { width: "48px" };
    if (isRecording || isStopping) return { width: "120px" };
    return undefined;
  };

  const contentVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const getContentKey = () => {
    if (isStopping) return "stopping";
    if (isRecording && isHandsFreeMode) return "recording-handsfree";
    if (isRecording) return "recording";
    return "idle";
  };

  const renderWidgetContent = () => {
    if (!expanded) return null;

    if (isStopping) {
      return (
        <motion.div
          key="stopping"
          variants={contentVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.15 }}
          className="flex h-full w-full justify-center items-center"
        >
          <ProcessingIndicator colorId={activePreset?.color} />
        </motion.div>
      );
    }

    if (isRecording && isHandsFreeMode) {
      return (
        <motion.div
          key="recording-handsfree"
          variants={contentVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.15 }}
          className="flex h-full w-full"
        >
          <div className="h-full items-center flex ml-2">
            <CancelButton onClick={handleCancelClick} />
          </div>
          <div className="justify-center items-center flex flex-1 gap-[1px]">
            <WaveformVisualization
              isRecording={isRecording}
              voiceDetected={voiceDetected}
            />
          </div>
          <div className="h-full items-center flex mr-2">
            <StopButton onClick={handleStopClick} />
          </div>
        </motion.div>
      );
    }

    if (isRecording) {
      return (
        <motion.div
          key="recording"
          variants={contentVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.15 }}
          className="justify-center items-center flex flex-1 gap-[1px]"
        >
          <WaveformVisualization
            isRecording={isRecording}
            voiceDetected={voiceDetected}
          />
        </motion.div>
      );
    }

    return (
      <motion.button
        key="idle"
        variants={contentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.15 }}
        className="items-center flex h-full px-4 gap-2.5"
        role="button"
        onClick={handleButtonClick}
      >
        {isFormatterEnabled && activePreset && (
          <div className="flex items-center gap-1 text-xs text-white/70">
            <Sparkles
              className={`w-3 h-3 ${getPresetColorClass(activePreset.color)}`}
            />
            <span className="truncate">{activePreset.name}</span>
          </div>
        )}
        <Play className="w-3 h-3 text-white fill-white" />
      </motion.button>
    );
  };

  return (
    <>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
        className={`
          transition-all duration-200 ease-in-out
          ${expanded ? "h-[24px]" : "h-[8px]"}
          bg-black/70 rounded-[24px] backdrop-blur-md ring-[1px] ring-black/60 shadow-[0px_0px_15px_0px_rgba(0,0,0,0.40)]
          before:content-[''] before:absolute before:inset-[1px] before:rounded-[23px] before:outline before:outline-white/15 before:pointer-events-none
          mb-2 select-none ${isClickable ? "cursor-pointer" : "cursor-default"}
        `}
        style={{ pointerEvents: "auto", ...getWidthStyle() }}
      >
        {expanded && (
          <AnimatePresence mode="wait">
            {renderWidgetContent()}
          </AnimatePresence>
        )}
      </div>

      {showPresetMenu && presets.length > 0 && (
        <PresetMenu
          presets={presets}
          activePresetId={activePreset?.id ?? null}
          onClose={handleClosePresetMenu}
          position={menuPosition}
        />
      )}
    </>
  );
};
