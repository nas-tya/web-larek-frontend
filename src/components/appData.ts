import {Model} from "./base/model";
import {IProductItem, IOrder, IAppState, FormErrors, PaymentMethod } from "../types";
import { IEvents } from "./base/events";

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
  basket: IProductItem[];    
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

  addToBasket(item: IProductItem): void {
    this.basket.push(item);
    this.emitChanges('basket:changed');
  }

  removeFromBasket(id: string): void {
    this.basket = this.basket.filter((item) => item.id !== id);
    this.emitChanges('basket:changed');
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
      return this.basket.reduce((sum, product)=> sum + product.price, 0)
  }

  setCatalog(items: IProductItem[]): void {
    this.catalog = items.map(item => new Product(item, this.events));
    this.events.emit('items:changed');
  }

  getTheBasket(): IProductItem[] {
    return this.basket;
  }

  checkIfInTheBasket(item: IProductItem): boolean {
      return this.basket.includes(item);
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

  setOrder(): void {
    this.order.total = this.getTotal();
    this.order.items = this.getTheBasket().map((item) => item.id);
  }

  validateOrderContacts(): void {
      const errors: typeof this.formErrors = {};
      if (!this.order.email) {
          errors.email = 'Необходимо указать email';
      }
      if (!this.order.phone) {
          errors.phone = 'Необходимо указать телефон';
      }
      this.formErrors = errors;
      this.events.emit('contactsErrors:change', this.formErrors);
  }

  validateOrderAddress(): void {
    const errors: typeof this.formErrors = {};
    if (!this.order.address) {
        errors.email = 'Необходимо указать адрес';
    }
    this.formErrors = errors;
    this.events.emit('addressErrors:change', this.formErrors);
}
}
