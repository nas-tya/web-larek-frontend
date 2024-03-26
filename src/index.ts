import './scss/styles.scss';

import { API_URL, CDN_URL } from "./utils/constants";
import { EventEmitter } from "./components/base/events";
import { AppState, CatalogChangeEvent, Product } from "./components/appData";
import { Page } from "./components/page";
import { Card, CardInBasket, IBasketItem } from "./components/card";
import { cloneTemplate, createElement, ensureElement } from "./utils/utils";
import { Modal } from "./components/common/modal";
import { Basket } from "./components/common/basket";
import { OrderContacts, OrderAddress, IOrderContacts, IOrderAddress } from "./components/order";
import { Success } from "./components/common/success";
import { LarekAPI } from "./components/larekApi";
import { IOrder, IProductItem, PaymentMethod } from './types';

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
const orderAddress = new OrderAddress(cloneTemplate(orderTemplate), events);
const orderContacts = new OrderContacts(cloneTemplate(contactsTemplate), events);

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
});

// Открыть лот
events.on('card:select', (item: Product) => {
    console.log('карточка открыта');
    appData.setPreview(item);
});

// Меняем отображение количества в корзине
const changePageCounter = () => {
    const basket = appData.getTheBasket();

    if (Array.isArray(basket)) {
      page.counter = basket.length;
    } else {
      page.counter = 0;
    }
}

// Добавление в корзину
events.on('basket:added', (item: Product) => {
    console.log('Item added to basket:', item);
    appData.addToBasket(item);
    changePageCounter();
    modal.close();
})

// Удаление из корзины
events.on('basket:deleted', (item: Product) => {
    console.log('Item deleted from basket:', item);
    appData.deleteFromBasket(item);
    events.emit('basket:changed');
    changePageCounter();
})

// Открытие корзины и фиксация изменений в ней
events.on('basket:changed', () => {
    const basketItems = appData.getTheBasket();
    console.log(basketItems);
    const total = appData.getTotal();
    console.log(total);

    const cardsInBasket = basketItems.map((item, i) => {
        const cardBasket = new CardInBasket(cloneTemplate(cardBasketTemplate), {
            onClick: () => {
                events.emit('basket:deleted', item);
                console.log('card deleted');
        }
        });

        return cardBasket.render({
            id: i + 1,
            title: item.title,
            price: item.price,
        });
});

    modal.render({
        content: basket.render({
            items: cardsInBasket,
            total: appData.getTotal(),
        })
      });

    });


// Клик по корзине
const openBasketButton = document.querySelector('.header__basket');
if (openBasketButton) {
    openBasketButton.addEventListener('click', () => {
        events.emit('basket:changed');
    });
}

// Изменен открытый выбранный лот
events.on('preview:changed', (item: Product) => {
  const showItem = (item: Product) => {
      const card = new Card('card', cloneTemplate(cardPreviewTemplate), {
        onClick: () => {
            if (appData.checkIfInTheBasket(item)) {
                events.emit('basket:changed');
              }
              else {
            events.emit('basket:added', item);   
        }
    }
      });

      if (appData.checkIfInTheBasket(item)) {
        card.buttonLabel = 'В корзину';
      }
      
      modal.render({
          content: card.render({
              title: item.title,
              image: item.image,
              description: item.description,
              price: item.price,
              category: item.category,

              })
          });
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

// Открыть форму заказа
events.on('order:open', () => {
    modal.render({
        content: orderAddress.render({
            address: '',
            payment: 'card',
            valid: false,
            errors: []
        })
    });
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
