import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";

const ReservationCountdown = ({ reservationTime, onExpired }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpiring, setIsExpiring] = useState(false);

  useEffect(() => {
    if (!reservationTime) return;

    const updateTimeLeft = () => {
      const now = new Date();
      const reservationDate = new Date(reservationTime);
      const expiryTime = new Date(reservationDate.getTime() + 60 * 60 * 1000); // 1 hour later
      const timeDiff = expiryTime - now;

      if (timeDiff <= 0) {
        setTimeLeft(null);
        if (onExpired) onExpired();
        return;
      }

      const minutes = Math.floor(timeDiff / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      setTimeLeft({ minutes, seconds, total: timeDiff });
      setIsExpiring(timeDiff <= 10 * 60 * 1000); // 10 minutes warning
    };

    // Update immediately
    updateTimeLeft();

    // Update every second
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [reservationTime, onExpired]);

  if (!timeLeft) return null;

  const { minutes, seconds } = timeLeft;
  const isUrgent = minutes <= 5;

  return (
    <div
      className={`p-3 rounded-lg border ${
        isUrgent
          ? "bg-red-50 border-red-200"
          : isExpiring
          ? "bg-yellow-50 border-yellow-200"
          : "bg-blue-50 border-blue-200"
      }`}
    >
      <div className="flex items-center gap-2 justify-center">
        {isUrgent ? (
          <AlertTriangle className="w-4 h-4 text-red-600" />
        ) : (
          <Clock className="w-4 h-4 text-blue-600" />
        )}
        <div className="text-center">
          <div
            className={`font-mono text-lg font-bold ${
              isUrgent
                ? "text-red-700"
                : isExpiring
                ? "text-yellow-700"
                : "text-blue-700"
            }`}
          >
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </div>
          <p
            className={`text-xs ${
              isUrgent
                ? "text-red-600"
                : isExpiring
                ? "text-yellow-600"
                : "text-blue-600"
            }`}
          >
            {isUrgent
              ? "Reservation expires soon!"
              : isExpiring
              ? "Reservation expires in 10 min"
              : "Time remaining to use reservation"}
          </p>
        </div>
      </div>

      {isExpiring && (
        <div className="mt-2 text-xs text-center text-muted-foreground">
          💡 You can request parking anytime before expiry
        </div>
      )}
    </div>
  );
};

export default ReservationCountdown;
