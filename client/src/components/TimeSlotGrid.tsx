interface TimeSlotGridProps {
  slots: string[];
  selected?: string;
  onSelect: (slot: string) => void;
  bookedSlots?: string[];
  peakSlots?: string[];
  className?: string;
}

export default function TimeSlotGrid({
  slots,
  selected,
  onSelect,
  bookedSlots = [],
  peakSlots = [],
  className = '',
}: TimeSlotGridProps) {
  const isBooked = (slot: string) => bookedSlots.includes(slot);
  const isPeak = (slot: string) => peakSlots.includes(slot);
  const isSelected = (slot: string) => selected === slot;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {slots.map((slot) => {
        const booked = isBooked(slot);
        const peak = isPeak(slot);
        const selectedSlot = isSelected(slot);

        let className = 'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ';
        if (booked) {
          className += 'bg-bg-deep border-border-dark text-muted cursor-not-allowed opacity-50';
        } else if (selectedSlot) {
          className += 'bg-green border-green text-white';
        } else if (peak) {
          className += 'bg-amber/10 border-amber/30 text-amber hover:bg-amber/20';
        } else {
          className += 'bg-bg-deep border-border-dark text-text-base hover:border-indigo/40 hover:bg-bg-panel cursor-pointer';
        }

        return (
          <button
            key={slot}
            onClick={() => !booked && onSelect(slot)}
            disabled={booked}
            className={className}
          >
            {slot}
            {peak && !booked && <span className="ml-1 text-[10px]">PEAK</span>}
          </button>
        );
      })}
    </div>
  );
}
