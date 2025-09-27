import './scss/styles.scss';

import {EventEmitter} from './components/base/Events.ts'
import {Gallery} from './components/views/Gallery.ts'
import {Header} from './components/views/Header.ts'
import {Modal} from './components/views/Modal.ts'
import {CardCatalog} from './components/views/cards/CardCatalog.ts'
import {Api} from './components/base/Api.ts'
import {cloneTemplate, ensureElement} from './utils/utils.ts'
import {Catalog} from './components/models/Catalog.ts'
import {ProductApi} from './components/models/ProductApi.ts'
import {IProduct} from './types/index.ts'
import { IOrderRequest } from './types/index.ts'
import {CardPreview} from './components/views/cards/CardPreveiw.ts'
import {ProductCart} from './components/models/ProductCart.ts'
import {Order} from './components/views/forms/Order.ts'
import {Contacts} from './components/views/forms/Contacts.ts'
import {Customer} from './components/models/Customer.ts'
import {Basket} from './components/views/Basket.ts'
import {CardBasket} from './components/views/cards/CardBasket.ts'
import {Success} from './components/views/Success.ts'

//Имитатор событий
const events = new EventEmitter()
events.onAll(({eventName, data}) => {
    console.log(`Событие: ${eventName}`, data);
});


//Контейнеры
const galleryContainer = ensureElement<HTMLElement>('.gallery')
const modalContainer = ensureElement<HTMLElement>('#modal-container')
const headerContainer = ensureElement<HTMLElement>('header.header')
const templateCardCatalog = ensureElement<HTMLTemplateElement>('#card-catalog')
const templateCardPreview = ensureElement<HTMLTemplateElement>('#card-preview')
const templateOrder = ensureElement<HTMLTemplateElement>('#order')
const templateContacts = ensureElement<HTMLTemplateElement>('#contacts')
const templateSuccess = ensureElement<HTMLTemplateElement>('#success')
const templateBasket = ensureElement<HTMLTemplateElement>('#basket')
const templateCardBasket = ensureElement<HTMLTemplateElement>('#card-basket')

// Презентер
const apiUrl = import.meta.env.VITE_API_ORIGIN 
const api = new Api(apiUrl);
const larek = new ProductApi(events, api);

//Модель каталога (инициализируем пустой, данные загрузим ниже)
const productsModel = new Catalog(events)

// Единый экземпляр модалки и подписка на закрытие
const modal = new Modal(events, modalContainer);
events.on('modal.close', () => {
    modal.close();
});

// Модель корзины и хедер
const cartModel = new ProductCart(events);
const header = new Header(events, headerContainer);
header.counter = cartModel.getProductsQuantity();
// Модель покупателя
const customerModel = new Customer(events);

// Единственные экземпляры представлений, переиспользуются при каждом открытии
const basketView = new Basket(events, cloneTemplate<HTMLElement>(templateBasket));
const orderView = new Order(events, cloneTemplate<HTMLElement>(templateOrder));
const contactsView = new Contacts(events, cloneTemplate<HTMLElement>(templateContacts));
const successView = new Success(events, cloneTemplate<HTMLElement>(templateSuccess));


// Обработка добавления в корзину
events.on('basket.add', (data: { id: string }) => {
    const product = productsModel.getProductById(data.id) as IProduct;
    if (product) {
        cartModel.addProduct(product);
    }
});

// Обработка удаления из корзины
events.on('basket.remove', (data: { id: string }) => {
    const product = productsModel.getProductById(data.id) as IProduct;
    if (product) {
        cartModel.removeProduct(product);
    }
});

// Единое событие изменения корзины на все случаи жизни
events.on('basket:change', () => {
    const items = cartModel.getProductList();
    const itemViews = items.map((product, index) => {
        const node = cloneTemplate<HTMLElement>(templateCardBasket);
        const view = new CardBasket(events, node);
        return view.render({
            id: product.id,
            title: product.title,
            price: product.price,
            cardIndex: index + 1,
        } as any);
    });
    basketView.items = itemViews;
    basketView.totalPrice = cartModel.getTotalPrice();
    header.counter = cartModel.getProductsQuantity();
});


events.on('productList.change', () => {
    const gallery = new Gallery(galleryContainer);
    const products = productsModel.getProducts();
    const instances = products.map((item) => {
        const node = cloneTemplate<HTMLElement>(templateCardCatalog);
        const cardExample = new CardCatalog(events, node);

        return cardExample.render(item);
    });

    gallery.render({catalog: instances});
});

// Обработка ошибки загрузки товаров на всякий случай
events.on('productList.error', (data: { error: string }) => {
    console.error('Ошибка загрузки каталога:', data.error);
    const gallery = new Gallery(galleryContainer);
    gallery.render({catalog: []}); 
});

// Загружаем товары и инициируем первичную отрисовку каталога
larek.getProducts()
    .then((products) => {
        productsModel.setProductList(products);
    })
    .catch((error) => {
        console.error('Ошибка загрузки товаров:', error);
        events.emit('productList.error', { error: error.message || 'Не удалось загрузить товары' });
    });

events.on('card.preview', (data: { id: string }) => {
    const cardPreview = new CardPreview(events, cloneTemplate<HTMLElement>(templateCardPreview));
    const product = productsModel.getProductById(data.id) as IProduct
    productsModel.setChosenProduct(product)
    const rendered = cardPreview.render({
        ...product,
        inCart: cartModel.getProductAvailability(product)
    } as any);
    // открываем модалку и вставляем карточку
    modal.open(rendered);
})

// Открытие корзины 
events.on('basket.open', () => {
    modal.open(basketView.render());
});


events.on('basket.buy', () => {
    modal.open(orderView.render());
});

events.on('order.submit', () => {
    modal.open(contactsView.render());
});

events.on('order.paymentMethod', (payload: { method: 'online' | 'cash', address: string }) => {
    customerModel.setPaymentMethod(payload.method);
    if (payload.address !== undefined) customerModel.setAdress(payload.address);
    const errs = customerModel.validateOrder();
    events.emit('presenter.orderErrors', { errors: errs });
});
events.on('order.addressChange', (payload: { address: string }) => {
    customerModel.setAdress(payload.address);
    const errs = customerModel.validateOrder();
    events.emit('presenter.orderErrors', { errors: errs });
});


events.on('success.close', () => {
    customerModel.clearData();
    modal.close();
});

// Синхронизация контактов с моделью покупателя
events.on('contacts.emailChange', (payload: { email: string }) => {
    customerModel.setEmail(payload.email);
    const errs = customerModel.validateContacts();
    events.emit('presenter.contactsErrors', { errors: errs });
});
events.on('contacts.phoneChange', (payload: { phone: string }) => {
    customerModel.setPhone(payload.phone);
    const errs = customerModel.validateContacts();
    events.emit('presenter.contactsErrors', { errors: errs });
});

// Сабмит контактов: создаём заказ и по успеху показываем Success
events.on('contacts.submit', async () => {
    const customer = customerModel.getData();
    const items = cartModel.getProductList().map(p => p.id);
    const total = cartModel.getTotalPrice();
    // Простая валидация перед отправкой
    if (!customer.paymentMethod || !customer.adress || !customer.email || !customer.phone || items.length === 0) {
        return;
    }
    const order: IOrderRequest = {
        payment: customer.paymentMethod as 'online' | 'cash',
        email: customer.email,
        phone: customer.phone,
        address: customer.adress,
        total,
        items,
    };
    try {
        await larek.createOrder(order);
        successView.descriptionText = String(total);
        modal.open(successView.render());
        cartModel.clear();
        customerModel.clearData();
    } catch (e) {
        const message = (e as Error)?.message || 'Ошибка оформления заказа';
        events.emit('presenter.orderSubmitError', { message });
    }
});

