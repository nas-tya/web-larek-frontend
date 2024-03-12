import { Component } from "./base/component";
import { IProductItem } from "../types";
import { ensureElement } from "../utils/utils";

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export type ICard<T> = IProductItem & { 
  button?: string;
  id?: string;
  description?: string;
}; 

const category: Record<string, string> = {
  'софт-скил': '_soft',
  'хард-скил': '_hard',
  'другое': '_other',
  'дополнительное': '_additional',
  'кнопка': '_button' 
}

export class Card<T> extends Component<ICard<T>> {
    protected _title: HTMLElement;
    protected _image?: HTMLImageElement;
    protected _description?: HTMLElement;
    protected _price?: HTMLElement;
    protected _category?: HTMLElement;
    protected _button?: HTMLButtonElement;

    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
        super(container);

        this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
        this._image = ensureElement<HTMLImageElement>(`.${blockName}__image`, container);
        this._button = container.querySelector(`.${blockName}__button`);
        this._description = container.querySelector(`.${blockName}__text`);
        this._price = ensureElement<HTMLElement>(`.${blockName}__price`, container);
        this._category = ensureElement<HTMLElement>(`.${blockName}__category`, container);

        // если есть кнопка - ловим клик по кнопке, если кнопки нет - ловим по карточке 
            if (this._button) {
                this._button.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
    }

    set title(value: string) {
      this.setText(this._title, value);
    }

    get title(): string {
      return this._title.textContent || '';
    }

    set image(value: string) {
      this.setImage(this._image, value, this.title)
    }

    set description(value: string | string[]) {
      this.setText(this._description, value);
    }

    set price(value: number | null) {
      if (typeof(value) === null) {
        this.setText(this._price, 'Бесценно');
        if (this._button) { 
           this._button.setAttribute('disabled', '')
         } 
      }
      this.setText(this._price, value + ' синапсов');
    }

    get price(): number | null {
      return Number(this._price.textContent);
    }

    set category(value: string) {
      this.setText(this._category, value)
      this._category.classList.add('card__category' + category[value]);
    }

    get category(): string {
      return this._category.textContent || '';
  }
}

export interface ICardBusket {
  title: string;
  price: number | null;
}

export class CardBasket extends Component<ICardBusket> {
    protected _title: HTMLElement;
    protected _price?: HTMLElement;
    protected _index?: HTMLElement;
    protected _button?: HTMLButtonElement;

    constructor(index: number, container: HTMLElement, actions?: ICardActions) {
        super(container);

        this._title = ensureElement<HTMLElement>(`.card__title`, container);
        this._button = container.querySelector(`.basket__item-delete`);
        this._price = ensureElement<HTMLElement>(`.card__price`, container);
        this._index = ensureElement<HTMLElement>(`.basket__item-index`, container);

        this._button.addEventListener('click', actions.onClick);
        this.setText(this._index!, `${index + 1}`);
    }

    set price(value: number | null) {
      if (typeof(value) === null) {
        this.setText(this._price, 'Бесценно');
        if (this._button) { 
           this._button.setAttribute('disabled', '')
         } 
      }
      this.setText(this._price, value + ' синапсов');
    }

    get price(): number | null {
      return Number(this._price.textContent);
    }

    set title(value: string) {
      this.setText(this._title, value);
    }

    get title(): string {
      return this._title.textContent || '';
    }

    set index(value: number) {
      this.setText(this._index, value);
    }

    get index(): number {
      return Number(this._index.textContent);
    }
}