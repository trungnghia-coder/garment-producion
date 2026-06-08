export interface Stage {
  id: string;
  name: string;
  price: number;
  unitPrice: number;
  type: string;
}

export interface OrderItem extends Stage {
  qty: number;
  qtyMay: number;
  slMay: number;
  slConLai: number;
}
