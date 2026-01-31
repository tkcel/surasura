import React, { useState, useRef, useEffect } from "react";
import { Square, X, Sparkles } from "lucide-react";
import { Waveform } from "@/components/Waveform";
import { useRecording } from "@/hooks/useRecording";
import { api } from "@/trpc/react";
import { PresetMenu } from "../../../components/PresetMenu";

const NUM_WAVEFORM_BARS = 6; // Fewer bars to make room for stop button
const DEBOUNCE_DELAY = 100; // milliseconds

// Separate component for the stop button
const StopButton: React.FC<{ onClick: (e: React.MouseEvent) => void }> = ({
  onClick,
}) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center w-[20px] h-[20px] rounded transition-colors"
    aria-label="Stop recording"
  >
    <Square className="w-[12px] h-[12px] text-red-500 fill-red-500" />
  </button>
);

// Separate component for the cancel button
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

// Separate component for the processing indicator
const ProcessingIndicator: React.FC = () => (
  <div className="flex gap-[4px] items-center justify-center flex-1 h-6">
    <div className="w-[4px] h-[4px] bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
    <div className="w-[4px] h-[4px] bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
    <div className="w-[4px] h-[4px] bg-blue-500 rounded-full animate-bounce" />
  </div>
);

// Separate component for the waveform visualization
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
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref for debounce timeout
  const clickTimeRef = useRef<number | null>(null); // Track when user clicked

  // tRPC mutation to control widget mouse events
  const setIgnoreMouseEvents = api.widget.setIgnoreMouseEvents.useMutation();

  // Formatter config and active preset queries
  const { data: formatterConfig } = api.settings.getFormatterConfig.useQuery();
  const { data: activePreset } = api.settings.getActivePreset.useQuery();
  const isFormatterEnabled = formatterConfig?.enabled ?? false;
  const presets = formatterConfig?.presets ?? [];

  // Log component initialization
  useEffect(() => {
    console.log("FloatingButton component initialized");
    return () => {
      console.debug("FloatingButton component unmounting");
    };
  }, []);

  const {
    recordingStatus,
    stopRecording,
    cancelRecording,
    voiceDetected,
    startRecording,
  } = useRecording();
  const isRecording =
    recordingStatus.state === "recording" ||
    recordingStatus.state === "starting";
  const isStopping = recordingStatus.state === "stopping";
  const isHandsFreeMode = recordingStatus.mode === "hands-free";

  // Track when recording state changes to "recording" after a click
  useEffect(() => {
    if (recordingStatus.state === "recording" && clickTimeRef.current) {
      const timeSinceClick = performance.now() - clickTimeRef.current;
      console.log(
        `FAB: Recording state became 'recording' ${timeSinceClick.toFixed(2)}ms after user click`,
      );
      clickTimeRef.current = null; // Reset
    }
  }, [recordingStatus.state]);

  // Handler for widget click to start recording in hands-free mode
  const handleButtonClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const clickTime = performance.now();
    clickTimeRef.current = clickTime;
    console.log("FAB: Button clicked at", clickTime);
    console.log("FAB: Current status:", recordingStatus);

    // Only start recording if not already recording
    if (recordingStatus.state === "idle") {
      const startRecordingCallTime = performance.now();
      await startRecording();
      const startRecordingReturnTime = performance.now();
      console.log(
        `FAB: startRecording() call took ${(startRecordingReturnTime - startRecordingCallTime).toFixed(2)}ms to return`,
      );
      console.log("FAB: Started hands-free recording");
    } else {
      console.log("FAB: Already recording, ignoring click");
      clickTimeRef.current = null; // Reset since we're not starting
    }
  };

  // Handler for stop button in hands-free mode
  const handleStopClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent triggering the main button click
    console.log("FAB: Stopping hands-free recording");
    await stopRecording();
  };

  // Handler for cancel button
  const handleCancelClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent triggering the main button click
    console.log("FAB: Cancelling recording");
    await cancelRecording();
  };

  // Handler for right-click to show preset menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only show menu if formatter is enabled and we have presets
    if (!isFormatterEnabled || presets.length === 0) {
      return;
    }

    // Position menu above the widget
    setMenuPosition({
      x: e.clientX,
      y: e.clientY - 10,
    });
    setShowPresetMenu(true);
  };

  // Close preset menu
  const handleClosePresetMenu = async () => {
    setShowPresetMenu(false);
    // Re-enable mouse event forwarding after menu closes
    try {
      await setIgnoreMouseEvents.mutateAsync({ ignore: true });
      console.debug("Re-enabled mouse event forwarding after menu close");
    } catch (error) {
      console.error("Failed to re-enable mouse event forwarding:", error);
    }
  };

  // Debounced mouse leave handler
  const handleMouseLeave = async () => {
    // Don't disable mouse events while preset menu is open
    if (showPresetMenu) {
      return;
    }
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    leaveTimeoutRef.current = setTimeout(async () => {
      setIsHovered(false);
      // Re-enable mouse event forwarding when not hovering
      try {
        await setIgnoreMouseEvents.mutateAsync({ ignore: true });
        console.debug("Re-enabled mouse event forwarding");
      } catch (error) {
        console.error("Failed to re-enable mouse event forwarding:", error);
      }
    }, DEBOUNCE_DELAY);
  };

  // Mouse enter handler - clears any pending leave timeout
  const handleMouseEnter = async () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setIsHovered(true);
    // Disable mouse event forwarding to make widget clickable
    await setIgnoreMouseEvents.mutateAsync({ ignore: false });
    console.debug("Disabled mouse event forwarding for clicking");
  };

  const expanded = isRecording || isStopping || isHovered;

  // Calculate width based on state
  const getExpandedWidth = () => {
    if (!expanded) return "w-[48px]";
    if (isRecording && isHandsFreeMode) return "w-[120px]"; // Cancel + waveform + stop
    if (isRecording) return "w-[96px]"; // Just waveform (PTT recording)
    // Idle/hover state: show preset name if formatter is enabled
    if (isFormatterEnabled && activePreset) {
      return "w-[140px]"; // Preset name + waveform
    }
    return "w-[96px]"; // Just waveform
  };

  // Function to render widget content based on state
  const renderWidgetContent = () => {
    if (!expanded) return null;

    // Show processing indicator when stopping
    if (isStopping) {
      return <ProcessingIndicator />;
    }

    // Show waveform with cancel and stop buttons in hands-free mode
    if (isRecording && isHandsFreeMode) {
      return (
        <>
          <div className="h-full items-center flex ml-2">
            <CancelButton onClick={handleCancelClick} />
          </div>
          <div className="justify-center items-center flex flex-1 gap-1">
            <WaveformVisualization
              isRecording={isRecording}
              voiceDetected={voiceDetected}
            />
          </div>
          <div className="h-full items-center flex mr-2">
            <StopButton onClick={handleStopClick} />
          </div>
        </>
      );
    }

    // Show just waveform in PTT mode (user releases key to stop/cancel)
    if (isRecording) {
      return (
        <div className="justify-center items-center flex flex-1 gap-1">
          <WaveformVisualization
            isRecording={isRecording}
            voiceDetected={voiceDetected}
          />
        </div>
      );
    }

    // Show clickable waveform visualization when idle/hovered
    // With preset name if formatter is enabled
    return (
      <button
        className="justify-center items-center flex flex-1 gap-1 h-full w-full px-2"
        role="button"
        onClick={handleButtonClick}
      >
        {isFormatterEnabled && activePreset && (
          <div className="flex items-center gap-1 text-xs text-white/70 shrink-0">
            <Sparkles className="w-3 h-3 text-yellow-500" />
            <span className="max-w-[60px] truncate">{activePreset.name}</span>
          </div>
        )}
        <WaveformVisualization
          isRecording={isRecording}
          voiceDetected={voiceDetected}
        />
      </button>
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
          ${expanded ? "h-[24px]" : "h-[8px]"} ${getExpandedWidth()}
          bg-black/70 rounded-[24px] backdrop-blur-md ring-[1px] ring-black/60 shadow-[0px_0px_15px_0px_rgba(0,0,0,0.40)]
          before:content-[''] before:absolute before:inset-[1px] before:rounded-[23px] before:outline before:outline-white/15 before:pointer-events-none
          mb-2 cursor-pointer select-none
        `}
        style={{ pointerEvents: "auto" }}
      >
        {expanded && (
          <div className="flex gap-[2px] h-full w-full justify-between">
            {renderWidgetContent()}
          </div>
        )}
      </div>

      {/* Preset selection menu */}
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
