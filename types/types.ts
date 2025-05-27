export interface User {
  id: string;
  email: string;
  role: 'admin' | 'operator' | 'client';
}

export interface Order {
  id: string;
  status: string;
  created_at: string;
  client_id: string;
  operator_id?: string;
}
