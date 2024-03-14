import { Form } from "./common/form";
import {IOrder, PaymentMethod} from "../types";
import {EventEmitter, IEvents} from "./base/events";
import {ensureElement} from "../utils/utils";

interface IOrderContacts {
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

interface IOrderAddress {
  address: string;
  payment: PaymentMethod;
}

export class OrderAddress extends Form<IOrderAddress> {
  protected _buttons: HTMLButtonElement[];

  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);
    this._buttons = Array.from(container.querySelectorAll('button_alt'))

    this._buttons.forEach((button) => {
      button.addEventListener('click', () => {
        events.emit('payment:change', button);
      })
    })
}

    setPayment(value: string): void { 
      this._buttons.forEach((button) => { 
    this.toggleClass(button, "button_alt-active",button.name===value); 
      }); 
  }

  setAddress(value: string): void {
    (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
  }
}