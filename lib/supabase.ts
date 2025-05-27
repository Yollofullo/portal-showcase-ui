import {
  createClient,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export function createServerClient() {
  return supabase;
}

interface InventoryPayload {
  id: string;
  item: string;
  quantity: number;
}

interface OrderPayload {
  id: string;
  status: string;
  updated_at: string;
}

function isInventoryPayload(payload: unknown): payload is InventoryPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'id' in payload &&
    'item' in payload &&
    'quantity' in payload &&
    typeof (payload as InventoryPayload).id === 'string' &&
    typeof (payload as InventoryPayload).item === 'string' &&
    typeof (payload as InventoryPayload).quantity === 'number'
  );
}

function isOrderPayload(payload: unknown): payload is OrderPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'id' in payload &&
    'status' in payload &&
    'updated_at' in payload &&
    typeof (payload as OrderPayload).id === 'string' &&
    typeof (payload as OrderPayload).status === 'string' &&
    typeof (payload as OrderPayload).updated_at === 'string'
  );
}

export function setupRealtimeListeners(
  onInventoryUpdate: (payload: InventoryPayload) => void,
  onOrderStatusChange: (payload: OrderPayload) => void,
) {
  const inventorySubscription = supabase
    .channel('inventory-updates')
    .on<RealtimePostgresChangesPayload<InventoryPayload>>(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'inventory' },
      (payload) => {
        const updatedData = payload.new;
        if (
          updatedData &&
          typeof updatedData === 'object' &&
          isInventoryPayload(updatedData)
        ) {
          onInventoryUpdate(updatedData);
        }
      },
    )
    .subscribe();

  const orderSubscription = supabase
    .channel('order-updates')
    .on<RealtimePostgresChangesPayload<OrderPayload>>(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'orders' },
      (payload) => {
        const updatedData = payload.new;
        if (
          updatedData &&
          typeof updatedData === 'object' &&
          isOrderPayload(updatedData)
        ) {
          onOrderStatusChange(updatedData);
        }
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(inventorySubscription);
    supabase.removeChannel(orderSubscription);
  };
}

export function setupRealtimeSubscriptions(
  onInventoryUpdate: (payload: InventoryPayload) => void,
  onOrderStatusChange: (payload: OrderPayload) => void,
) {
  const inventorySubscription = supabase
    .channel('inventory-updates')
    .on<RealtimePostgresChangesPayload<InventoryPayload>>(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'inventory' },
      (payload) => {
        const updatedData = payload.new;
        if (
          updatedData &&
          typeof updatedData === 'object' &&
          isInventoryPayload(updatedData)
        ) {
          onInventoryUpdate(updatedData);
        }
      },
    )
    .subscribe();

  const orderSubscription = supabase
    .channel('order-updates')
    .on<RealtimePostgresChangesPayload<OrderPayload>>(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'orders' },
      (payload) => {
        const updatedData = payload.new;
        if (
          updatedData &&
          typeof updatedData === 'object' &&
          isOrderPayload(updatedData)
        ) {
          onOrderStatusChange(updatedData);
        }
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(inventorySubscription);
    supabase.removeChannel(orderSubscription);
  };
}
