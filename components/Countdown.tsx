import React, { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const Countdown: React.FC = () => {
  // Target date: One week from now for demo purposes
  const calculateTimeLeft = (): TimeLeft => {
    // Set a fixed date or dynamic future date
    const difference = +new Date("2024-12-31T20:00:00") - +new Date();
    let timeLeft: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center mx-2 md:mx-4">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 md:p-6 w-20 md:w-32 text-center border border-white/20 shadow-xl">
        <span className="text-3xl md:text-5xl font-bold text-white block">
          {value.toString().padStart(2, '0')}
        </span>
        <span className="text-xs md:text-sm text-party-200 uppercase tracking-widest mt-2">{label}</span>
      </div>
    </div>
  );

  return (
    <div className="flex justify-center flex-wrap gap-y-4">
      <TimeUnit value={timeLeft.days} label="Days" />
      <TimeUnit value={timeLeft.hours} label="Hours" />
      <TimeUnit value={timeLeft.minutes} label="Mins" />
      <TimeUnit value={timeLeft.seconds} label="Secs" />
    </div>
  );
};

export default Countdown;