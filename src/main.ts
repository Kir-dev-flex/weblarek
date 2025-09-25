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
const apiUrl = import.meta.env.VITE_API_ORIGIN //Всякие штуки чтобы получить каталог с сервака
const api = new Api(apiUrl);
const larek = new ProductApi(events, api);

//Модель каталога
const productsModel = new Catalog(events, await larek.getProducts(), null)

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

// Текущее состояние открытой превью-карты
let currentPreviewCard: CardPreview | null = null;
let currentPreviewProductId: string | null = null;
let currentFormStep: 'order' | 'contacts' | null = null;

// Обработка добавления в корзину из превью
events.on('card.addToBasket', (data: { id: string }) => {
    const product = productsModel.getProductById(data.id) as IProduct;
    if (product) {
        cartModel.addProduct(product);
        // если модалка открыта с этим товаром, обновляю состояние кнопки через модель представления
        if (currentPreviewProductId === product.id && currentPreviewCard) {
            (currentPreviewCard as any).inCart = true;
        }
    }
});

// Обработка удаления из корзины из превью
events.on('card.removeFromBasket', (data: { id: string }) => {
    const product = productsModel.getProductById(data.id) as IProduct;
    if (product) {
        cartModel.removeProduct(product);
        if (currentPreviewProductId === product.id && currentPreviewCard) {
            (currentPreviewCard as any).inCart = false;
        }
    }
});

// Обновление счётчика в хедере при изменениях корзины
events.on('cart.productAdded', () => {
    header.counter = cartModel.getProductsQuantity();
});
events.on('cart.productRemoved', () => {
    header.counter = cartModel.getProductsQuantity();
});
events.on('cart.cleared', () => {
    header.counter = cartModel.getProductsQuantity();
});


productsModel.setProductList(await larek.getProducts()) 
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

events.on('card.preview', (data: { id: string }) => {
    const cardPreview = new CardPreview(events, cloneTemplate<HTMLElement>(templateCardPreview));
    const product = productsModel.getProductById(data.id) as IProduct
    productsModel.setChosenProduct(product)
    const rendered = cardPreview.render({
        ...product,
        inCart: cartModel.getProductAvailability(product)
    } as any);
    currentPreviewCard = cardPreview;
    currentPreviewProductId = product.id;
    // открываем модалку и вставляем карточку
    modal.open(rendered);
})

// Открытие корзины
events.on('basket.open', () => {
    const basketView = new Basket(events, cloneTemplate<HTMLElement>(templateBasket));
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
    modal.open(basketView.render());
});

// Удаление позиции из корзины через карточку корзины
events.on('card.deleteFromBasket', (data: { id: string }) => {
    const product = productsModel.getProductById(data.id) as IProduct;
    if (product) {
        cartModel.removeProduct(product);
        const isBasketOpen = modalContainer.classList.contains('modal_active');
        if (isBasketOpen) {
            events.emit('basket.open');
        }
    }
});

events.on('basket.buy', () => {
    const orderView = new Order(events, cloneTemplate<HTMLElement>(templateOrder));
    modal.open(orderView.render());
    currentFormStep = 'order';

    // Синхронизация формы с моделью покупателя
    events.on('order.paymentMethod', (payload: { method: 'online' | 'cash', address: string }) => {
        customerModel.setPaymentMethod(payload.method);
        if (payload.address !== undefined) customerModel.setAdress(payload.address);
    });
    events.on('order.addressChange', (payload: { address: string }) => {
        customerModel.setAdress(payload.address);
    });
});

// Переход на форму контактов из формы заказа
events.on('form.next', () => {
    if (currentFormStep === 'order') {
        const contactsView = new Contacts(events, cloneTemplate<HTMLElement>(templateContacts));
        modal.open(contactsView.render());
        currentFormStep = 'contacts';
        return;
    }
    if (currentFormStep === 'contacts') {
        const successView = new Success(events, cloneTemplate<HTMLElement>(templateSuccess));
        successView.descriptionText = String(cartModel.getTotalPrice());
        modal.open(successView.render());
        cartModel.clear();
        currentFormStep = null;
    }
});

events.on('success.close', () => {
    customerModel.clearData();
    modal.close();
});

// Синхронизация контактов с моделью покупателя
events.on('contacts.emailChange', (payload: { email: string }) => {
    customerModel.setEmail(payload.email);
});
events.on('contacts.phoneChange', (payload: { phone: string }) => {
    customerModel.setPhone(payload.phone);
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
        const successView = new Success(events, cloneTemplate<HTMLElement>(templateSuccess));
        successView.descriptionText = String(total);
        modal.open(successView.render());
        cartModel.clear();
        customerModel.clearData();
        currentFormStep = null;
    } catch (e) {
        // На проде показали бы алерт/ошибку в форме
        console.error('Order error', e);
    }
});
events.emit('productList.change', {productList: productsModel.getProducts()})
