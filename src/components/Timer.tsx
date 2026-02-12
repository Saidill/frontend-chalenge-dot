import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
  initialTime: number;
  onTimeUp: () => void;
  isActive: boolean;
}

export const Timer: React.FC<TimerProps> = ({
  initialTime,
  onTimeUp,
  isActive,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);

  // Reset ketika initialTime berubah
  useEffect(() => {
    setTimeRemaining(initialTime);
  }, [initialTime]);

  // Countdown logic
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeUp]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const isWarning = timeRemaining <= 30;   // 30 detik terakhir
  const isCritical = timeRemaining <= 10;  // 10 detik terakhir

  return (
    <div className="bg-white rounded-lg shadow-md px-6 py-4 flex items-center justify-between">

      <div className="flex items-center gap-2 text-gray-600">
        <Clock className="w-5 h-5" />
        <span className="text-sm font-medium">Time Remaining</span>
      </div>

      <div
        className={`text-2xl font-bold tabular-nums transition-colors ${
          isCritical
            ? "text-red-600 animate-pulse"
            : isWarning
            ? "text-orange-500"
            : "text-gray-900"
        }`}
      >
        {String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")}
      </div>

    </div>
  );
};
