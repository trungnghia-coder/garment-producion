export interface Stage {
  id: string;
  name: string;
  price_company: number;
  price_market: number;
  type_id: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem extends Stage {
  qty: number;
  qtyMay: number;
  slMay: number;
  slConLai: number;
}
