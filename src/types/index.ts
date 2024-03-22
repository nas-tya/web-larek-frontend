export interface IProductList {
  total: number | null,
  items: []
} 

export interface IProductItem {
  id: string,
  description: string,
  image: string,
  title: string,
  category: string,
  price: number | null,
  selected: boolean;
} 

export type PaymentMethod = 'card' | 'cash';

export interface IOrder {
  payment: PaymentMethod,
  email: string,
  phone: string,
  address: string,
  total: number | null,
  items: string[]
}

export interface IOrderResult {
  id: string,
  total: number | null
}

export interface IAppState {    
  catalog: IProductItem[];
  basket: string[];    
  order: IOrder | null;    
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;