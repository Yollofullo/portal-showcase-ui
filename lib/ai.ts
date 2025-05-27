// This module provides AI-powered sorting logic for delivery scheduling.

interface Order {
  priority: number;
  deliveryTime: string;
  distance: number;
  // Add other relevant fields as needed
}

/**
 * Sort deliveries based on priority, distance, and delivery time.
 * @param {Order[]} orders - List of orders to be sorted.
 * @returns {Order[]} - Sorted list of orders.
 */
export function sortDeliveries(orders: Order[]): Order[] {
  return orders.sort((a: Order, b: Order) => {
    const timeDifference =
      new Date(a.deliveryTime).getTime() - new Date(b.deliveryTime).getTime();
    if (timeDifference !== 0) {
      return timeDifference;
    }
    return a.distance - b.distance;
  });
}
