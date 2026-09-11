import { Check } from 'lucide-react';
import type { AttendanceAvailableOffering } from '@/entities/attendance';
import { Badge } from '@/shared/ui';
import styles from './OfferingCard.module.css';

type OfferingCardProps = {
  offering: AttendanceAvailableOffering;
  selected: boolean;
  disabled?: boolean;
  onSelect: (teachingAssignmentId: number) => void;
};

export const OfferingCard = ({
  offering,
  selected,
  disabled = false,
  onSelect,
}: OfferingCardProps) => (
  <button
    aria-pressed={selected}
    className={`${styles.card} ${selected ? styles.selected : ''}`}
    disabled={disabled}
    onClick={() => onSelect(offering.teachingAssignmentId)}
    type="button"
  >
    <span className={styles.main}>
      <strong className={styles.name}>{offering.name}</strong>
      <Badge tone="neutral">{offering.labelKind}</Badge>
    </span>
    {selected ? (
      <span aria-hidden="true" className={styles.check}>
        <Check size={18} strokeWidth={2.5} />
      </span>
    ) : (
      <span aria-hidden="true" className={styles.checkPlaceholder} />
    )}
  </button>
);
