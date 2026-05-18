export function formatCreatedAtEn(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();

  const diffMs = date.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60)); 
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) return `after ${diffMinutes} minutes. You will receive an email with reminding.`;
  if (diffHours < 24) return `after ${diffHours} hours. You will receive an email with reminding.`;
  if (diffDays === 1) return `tomorrow. You will receive an email with reminding.`;
  if (diffDays < 30) return `after ${diffDays} days. You will receive an email with reminding.`;
  return `after ${diffDays} days. You will receive an email with reminding.`;
}
