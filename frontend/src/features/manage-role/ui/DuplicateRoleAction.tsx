import { Copy } from 'lucide-react';
import { Button } from '@/shared/ui';

export const DuplicateRoleAction = ({ disabled = false, onDuplicate }: { disabled?: boolean; onDuplicate: () => void }) => (
  <Button disabled={disabled} onClick={onDuplicate} type="button" variant="secondary"><Copy size={15} /> Duplicar</Button>
);