export type InboxSource = 'disciplinary' | 'absenteeism' | 'justification_pending';

export type InboxItem = {
  id: number;
  source: InboxSource;
  title: string;
  body: string;
  href: string;
  createdAt: string;
  readAt: string | null;
};

export type InboxMine = {
  unreadCount: number;
  items: InboxItem[];
};
