export interface StagePrice {
  id: string;
  stage_id: string;
  material_id: string;
  price_company: number;
  price_market: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
