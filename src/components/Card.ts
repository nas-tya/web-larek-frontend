import { Component } from "./base/Component";
import { IProductItem } from "../types";
import { ensureElement } from "../utils/utils";

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export type ICard = IProductItem & { 
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

export class Card extends Component<ICard> {
    protected _title: HTMLElement;
    protected _image?: HTMLImageElement;
    protected _description?: HTMLElement;
    protected _price?: HTMLElement;
    protected _category?: HTMLElement;
    protected _button?: HTMLButtonElement;

    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
        super(container);

        this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
        this._button = container.querySelector(`.${blockName}__button`);
        this._price = ensureElement<HTMLElement>(`.${blockName}__price`, container);

        // Проверяем наличие изображения
        const imageElement = container.querySelector(`.${blockName}__image`);
        if (imageElement instanceof HTMLImageElement) {
            this._image = imageElement;
        } else {
            this._image = null;
        }

         // Проверяем наличие описания
        const descriptionElement = container.querySelector(`.${blockName}__text`);
        if (descriptionElement instanceof HTMLElement) {
            this._description = descriptionElement;
        } else {
            this._description = null; 
        }

        // Проверяем наличие категории
        const categoryElement = container.querySelector(`.${blockName}__category`);
        if (categoryElement instanceof HTMLElement) {
            this._category = categoryElement;
        } else {
            this._category = null; 
        }

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
        this.setImage(this._image, value, this.title);
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