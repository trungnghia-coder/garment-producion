export interface Stage {
  id: string;
  name: string;
  type_id: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StageWithPrice extends Stage {
  price_company: number;
  price_market: number;
}

export interface OrderItem extends StageWithPrice {
  qty: number;
}
