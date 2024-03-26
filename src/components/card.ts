import { Component } from "./base/component";
import { IProductItem } from "../types";
import { ensureElement } from "../utils/utils";

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export type ICard<T> = IProductItem & { 
  title?: string;
  image?: string;
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
        if (actions?.onClick) {
          if (this._button) {
              this._button.addEventListener('click', actions.onClick);
          } else {
              container.addEventListener('click', actions.onClick);
          }
      }
    }

    set buttonLabel(label: string) {
      this._button.textContent = label;
      console.log(this._button);
    }

    set id(value: string) {
      this.container.dataset.id = value;
    }

    get id(): string {
      return this.container.dataset.id || '';
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
      if (value === null) {
          this.setText(this._price, 'Бесценно');
          if (this._button) { 
              this._button.setAttribute('disabled', '');
              this.setText(this._button, 'Нельзя купить');
          } 
      } else {
          this.setText(this._price, value + ' синапсов');
          if (this._button) { 
              this._button.removeAttribute('disabled');
          }
      }
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

export interface IBasketItem {
  title: string;
  price: number | null;
  id: number;
}

export class CardInBasket extends Component<IBasketItem> {
  protected _title: HTMLElement;
  protected _price: HTMLElement;
  protected _id: HTMLElement;
  protected _deleteButton: HTMLElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
      super(container);

      this._title = ensureElement<HTMLElement>('.card__title', container);
      this._price = ensureElement<HTMLElement>('.card__price', container);
      this._id = ensureElement<HTMLElement>('.basket__item-index', container);
      this._deleteButton = ensureElement<HTMLElement>('.basket__item-delete', container);

      if (actions && actions.onClick) {
          this._deleteButton.addEventListener('click', actions.onClick);
      }
  }

  set title(value: string) {
      this.setText(this._title, value);
  }

  set price(value: number) {
      this.setText(this._price, `${value} синапсов`);
  }

  set id(value: string) {
    this.setText(this._id, value);
}

  get id(): string {
    return this._id.textContent || '';
  }
}