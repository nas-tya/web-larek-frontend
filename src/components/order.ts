import { Form } from "./common/form";
import {IOrder} from "../types";
import {EventEmitter, IEvents} from "./base/events";
import {ensureElement} from "../utils/utils";

export interface IOrderContacts {
  phone: string;
  email: string;
}

export class OrderContacts extends Form<IOrderContacts> {

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
    }

    set phone(value: string) {
        (this.container.elements.namedItem('phone') as HTMLInputElement).value = value;
    }

    set email(value: string) {
        (this.container.elements.namedItem('email') as HTMLInputElement).value = value;
    }
}

export interface IOrderAddress {
  address: string;
  payment: string;
}

export class OrderAddress extends Form<IOrderAddress> {
  protected _buttonCard: HTMLButtonElement;
  protected _buttonCash: HTMLButtonElement;

  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);

    this._buttonCard = container.elements.namedItem('card') as HTMLButtonElement;
    this._buttonCash = container.elements.namedItem('cash') as HTMLButtonElement;

    if (this._buttonCard) {
      this._buttonCard.addEventListener('click', () => {
        this._buttonCard.classList.add('button_alt-active');
        this._buttonCash.classList.remove('button_alt-active');
      });
    }

    if (this._buttonCash) {
      this._buttonCash.addEventListener('click', () => {
        this._buttonCash.classList.add('button_alt-active');
        this._buttonCard.classList.remove('button_alt-active');
      });
    }
}
    

    setAddress(value: string): void {
      (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
    }
}