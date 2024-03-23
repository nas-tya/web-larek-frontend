import './scss/styles.scss';

import { API_URL, CDN_URL } from "./utils/constants";
import { EventEmitter } from "./components/base/events";
import { AppState, CatalogChangeEvent, Product } from "./components/appData";
import { Page } from "./components/page";
import { Card, CardInBasket } from "./components/card";
import { cloneTemplate, createElement, ensureElement } from "./utils/utils";
import { Modal } from "./components/common/modal";
import { Basket } from "./components/common/basket";
import { OrderContacts, OrderAddress } from "./components/order";
import { Success } from "./components/common/success";
import { LarekAPI } from "./components/larekApi";
import { IOrder, IProductItem } from './types';

const events = new EventEmitter();
const api = new LarekAPI(CDN_URL, API_URL);
const appData = new AppState({}, events);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
    console.log(eventName, data);
});

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new OrderContacts(cloneTemplate(orderTemplate), events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Бизнес-логика

// Изменились элементы каталога
events.on<CatalogChangeEvent>('items:changed', () => {
  page.catalog = appData.catalog.map(item => {
      const card = new Card('card', cloneTemplate(cardCatalogTemplate), {
          onClick: () => events.emit('card:select', item)
      });
      return card.render({
          title: item.title,
          image: item.image,
          description: item.description,
          category: item.category,
          price: item.price
      });
  });

  const basket = appData.getTheBasket();

  if (Array.isArray(basket)) {
    page.counter = basket.length;
  } else {
    page.counter = 0;
  }

});



// Отправлена форма заказа
events.on('order:submit', () => {
  api.orderProducts(appData.order)
      .then((result) => {
          const success = new Success(cloneTemplate(successTemplate), {
              onClick: () => {
                  modal.close();
                  appData.clearBasket();
                  events.emit('order:changed');
              }
          });
          modal.render({
              content: success.render({})
          });
      })
      .catch(err => {
          console.error(err);
      });
});

// Изменилось состояние валидации формы
events.on('formErrors:change', (errors: Partial<IOrder>) => {
  const { email, phone } = errors;
  order.valid = !email && !phone;
  order.errors = Object.values({phone, email}).filter(i => !!i).join('; ');
});

// Открыть форму заказа
events.on('order:open', () => {
  modal.render({
      content: order.render({
          phone: '',
          email: '',
          valid: false,
          errors: []
      })
  });
});

// Открыть лот
events.on('card:select', (item: Product) => {
  appData.setPreview(item);
});

// Открыть корзину
events.on('basket:open', () => {
    const basketItems = appData.getTheBasket(); // Получаем элементы корзины
    const total = appData.getTotal(); // Получаем общую стоимость корзины
    modal.render({
        content: basket.render({
            items: basketItems,
            total: total,
        }),
    });
});

const openBasketButton = document.querySelector('.header__basket');
if (openBasketButton) {
    openBasketButton.addEventListener('click', () => {
        events.emit('basket:open');
    });
}

// Изменен открытый выбранный лот
events.on('preview:changed', (item: Product) => {
  const showItem = (item: Product) => {
      const card = new Card('card', cloneTemplate(cardPreviewTemplate));
      modal.render({
          content: card.render({
              title: item.title,
              image: item.image,
              description: item.description,
              price: item.price,
              category: item.category
              })
          })
      };

  if (item) {
      api.getProductItem(item.id)
          .then((result) => {
              item.description = result.description;
              showItem(item);
          })
          .catch((err) => {
              console.error(err);
          })
  } else {
      modal.close();
  }
});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
  page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
  page.locked = false;
});

// Получаем список товаров с сервера
api.getProductList()
    .then(appData.setCatalog.bind(appData))
    .catch(err => {
        console.error(err);
    });
