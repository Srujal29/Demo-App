/**
 * Formats a numeric price into INR currency format.
 * Example: 2499 -> "₹2,499"
 */
export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

/**
 * Generates a deterministic-looking mock order ID.
 * Example: "NEX-849201"
 */
export function generateOrderId(): string {
  const timestamp = Date.now().toString().slice(-4);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `NEX-${timestamp}${randomSuffix}`;
}
