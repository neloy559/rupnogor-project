export const ORDER_STATUSES = ['processing', 'shipped', 'delivered', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const VALID_ORDER_STATUSES: string[] = [...ORDER_STATUSES];