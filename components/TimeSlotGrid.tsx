'use client';

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

        let cls =
          'inline-flex items-center gap-1.5 px-3 h-11 min-w-[68px] justify-center rounded-xl text-sm font-semibold transition-colors border ';
        if (booked) {
          cls +=
            'bg-surface-muted border-border text-ink-subtle cursor-not-allowed opacity-50';
        } else if (selectedSlot) {
          cls += 'bg-primary border-primary text-primary-foreground shadow-sport';
        } else if (peak) {
          cls +=
            'bg-accent/10 border-accent/40 text-accent hover:bg-accent/15 cursor-pointer';
        } else {
          cls +=
            'bg-surface border-border text-ink hover:border-primary/50 hover:bg-primary/5 cursor-pointer';
        }

        return (
          <button
            key={slot}
            type="button"
            onClick={() => !booked && onSelect(slot)}
            disabled={booked}
            aria-pressed={selectedSlot}
            aria-label={`${slot}${peak ? ' (peak hour)' : ''}${booked ? ' (booked)' : ''}`}
            className={cls}
          >
            <span className="tabular-nums">{slot}</span>
            {peak && !booked && (
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">
                Peak
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
