import {Model} from "./base/model";
import {IProductItem, IOrder, IAppState, FormErrors, PaymentMethod } from "../types";
import { IEvents } from "./base/events";

import {IOrderContacts, IOrderAddress} from "././order"

export type CatalogChangeEvent = {
    catalog: IProductItem[]
};

export class Product extends Model<IProductItem> {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}

export class AppState extends Model<IAppState> {
  catalog: IProductItem[];
  basket: IProductItem[] = [];    
  preview: string | null;
  order: null | IOrder = {
    payment: 'card',
    email: '',
    phone: '',
    address: '',
    total: null,
    items: []
};
  formErrors: FormErrors = {};

  addToBasket(itemId: IProductItem): void {
    if (!this.basket.includes(itemId)) {
        this.basket.push(itemId);
    }
}
  deleteFromBasket(itemId: IProductItem): void {
    const index = this.basket.indexOf(itemId); 
    if (index !== -1) {
        this.basket.splice(index, 1); 
    }
  }

  clearBasket(): void {
    this.basket = [];
    this.clearOrder();
    this.emitChanges('basket:changed');
  }

  clearOrder(): void {
    this.order = {
      payment: 'card',
      email: '',
      phone: '',
      address: '',
      total: null,
      items: []
  };
  }

  getTotal(): number | null {
    return this.basket.reduce((a, c) => a + c.price, 0);
  }

  setCatalog(items: IProductItem[]): void {
    this.catalog = items.map(item => new Product(item, this.events));
    this.events.emit('items:changed');
  }

  setPreview(item: IProductItem) {
    this.preview = item.id;
    this.emitChanges('preview:changed', item);
  }

  getTheBasket(): IProductItem[] {
    return this.basket || [];
}

  checkIfInTheBasket(itemId: IProductItem): boolean {
    return this.basket.includes(itemId);
  }

  setOrder(): void {
    this.order.total = this.getTotal();
    this.order.items = this.getTheBasket()
  }

  setPayment(payment: PaymentMethod): void {
    this.order.payment = payment;
  }

  setAddress(address: string): void {
    this.order.address = address;
  }

  setPhone(phone: string): void {
    this.order.phone = phone;
  }

  setEmail(email: string): void {
    this.order.email = email;
  }

  validateOrderContacts(): boolean {
      const errors: typeof this.formErrors = {};
      if (!this.order.email) {
          errors.email = 'Необходимо указать email';
      }
      if (!this.order.phone) {
          errors.phone = 'Необходимо указать телефон';
      }
      this.formErrors = errors;
      this.events.emit('contactsErrors:change', this.formErrors);
      return Object.keys(errors).length === 0;
  }

  validateOrderAddress(): boolean {
    const errors: typeof this.formErrors = {};
    if (!this.order.address) {
        errors.email = 'Необходимо указать адрес';
    }
    this.formErrors = errors;
    this.events.emit('addressErrors:change', this.formErrors);
    return Object.keys(errors).length === 0;
}
}
