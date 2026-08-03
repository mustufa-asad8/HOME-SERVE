import type { AppointmentStatus } from '../lib/types';
import { statusLabel } from '../lib/format';

export default function StatusBadge({ status }: { status: AppointmentStatus }) {
  return <span className={`status-badge ${status}`}>{statusLabel(status)}</span>;
}
