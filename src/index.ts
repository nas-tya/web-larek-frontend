import './scss/styles.scss';

import { API_URL, CDN_URL } from "./utils/constants";
import { EventEmitter } from "./components/base/Events";
import { AppState, CatalogChangeEvent } from "./components/AppData";
import { Page } from "./components/Page";
import { Card } from "./components/Card";
import { cloneTemplate, ensureElement } from "./utils/utils";
import { Modal } from "./components/common/Modal";
import { Basket } from "./components/Basket";
import { OrderContacts, OrderAddress } from "./components/Order";
import { Success } from "./components/Success";
import { LarekAPI } from "./components/LarekApi";
import { IOrderForm, IProductItem } from './types';

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
events.on('card:select', (item: IProductItem) => {
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
events.on('basket:added', (item: IProductItem) => {
    console.log('Item added to basket:', item);
    appData.addToBasket(item);
    changePageCounter();
    modal.close();
})

// Удаление из корзины
events.on('basket:deleted', (item: IProductItem) => {
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
        const cardBasket = new Card('card', cloneTemplate(cardBasketTemplate), {
            onClick: () => {
                events.emit('basket:deleted', item);
                console.log('card deleted');
        }
        });

        return cardBasket.render({
            id: String(i + 1),
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

// Изменен открытый выбранный лот
events.on('preview:changed', (item: IProductItem) => {
  const showItem = (item: IProductItem) => {
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

        showItem(item);
});

// Открыть форму заказа с адресом и оплатой
events.on('order:open', () => {
    modal.render({
        content: orderAddress.render({
            payment: 'card',
            address: '',
            valid: false,
            errors: []
        })
    });
});

// Открыть форму заказа с контактами
events.on('order:submit', () => {
    modal.render({
        content: orderContacts.render({
            email: '',
            phone: '',
            valid: false,
            errors: []
        })
    });
})

// Изменилось состояние валидации формы с адресом
events.on('formErrorsAddress:change', (errors: Partial<IOrderForm>) => {
    const { payment, address } = errors;
    orderAddress.valid = !payment && !address;
    orderAddress.errors = Object.values({payment, address}).filter(i => !!i).join('; ');
});

// Изменилось состояние валидации формы с контактами
events.on('formErrorsContacts:change', (errors: Partial<IOrderForm>) => {
    const { email, phone } = errors;
    orderContacts.valid = !email && !phone;
    orderContacts.errors = Object.values({email, phone}).filter(i => !!i).join('; ');
});

// Изменилось одно из полей
events.on('orderInput:change', (data: { field: keyof IOrderForm, value: string }) => {
    appData.setOrderField(data.field, data.value);
});

events.on('order.payment:change', (data: { value: string }) => {
    appData.setPayment(data.value);
})

events.on('order.address:change', (data: { value: string }) => {
    appData.setAddress(data.value);
})

events.on('contacts.email:change', (data: { value: string }) => {
    appData.setEmail(data.value);
})

events.on('contacts.phone:change', (data: { value: string }) => {
    appData.setPhone(data.value);
})

// Отправить заказ
events.on('contacts:submit', () => {
    appData.setOrder();
    console.log(appData.order);
    api.orderProducts(appData.order)
        .then(() => {
                    modal.close();
                    events.emit('order:success');
                    appData.clearBasket();
                    appData.clearOrder();     
                    changePageCounter();             
                })
        .catch(err => {
            console.error(err);
        }); 
})

// Заказ успешно отправлен
events.on('order:success', () => {
    console.log('вызвали саксесс');
    const success = new Success(cloneTemplate(successTemplate), {
        onClick: () => {
            modal.close();
            window.location.href = '/';
        }}, appData.getTotal());
        modal.render({
            content: success.render({})
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
