/**
 * Premium lightweight class name merger
 */
export function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format currency to USD style
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Shorten Supabase IDs or UUIDs for readable UI keys
 */
export function shortId(id: string): string {
  if (!id) return '';
  return id.substring(0, 6).toUpperCase();
}
