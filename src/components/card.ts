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

export class CardInBasket extends Card<ICardBusket> {
  protected _index?: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super('card', container, actions);
		this._index = ensureElement<HTMLElement>(`.basket__item-index`, container);
	}

	set index(value: number) {
		this._index.textContent = value.toString();
	}
}

interface IPreviewCard {
	label: string;
};

export class PreviewCard extends Card<IPreviewCard> {
	constructor(container: HTMLElement, actions?: ICardActions) {
		super('card', container, actions);
	}
}