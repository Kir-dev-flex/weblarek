import './scss/styles.scss';
import {apiProducts} from './utils/data.ts'
import {Catalog} from './components/models/Catalog.ts';
import {Customer} from './components/models/Customer.ts';
import {ProductCart} from './components/models/ProductCart.ts';
import {ICustomer, IOrderRequest} from './types/index.ts'

import {Api} from './components/base/Api.ts'
import {ProductApi} from './components/models/ProductApi.ts'

// Проверка классов
const catalog = new Catalog(apiProducts.items, null)
console.log('Вывести весь каталог продуктов: ', catalog.getProducts())
console.log('Найти продукт по его айдишнику: ', catalog.getProductById("854cef69-976d-4c2a-a18c-2aa45046c390"))
console.log('Установить новый выбранный продукт: ', catalog.setChosenProduct(apiProducts.items[2]))
console.log('Получить выбранный продукт: ', catalog.getChosenProduct())
console.log('Заменить список продуктов: ', catalog.setProductList(apiProducts.items))//тут использую тот же массив за неимением другого
console.log('Вывести весь каталог продуктов: ', catalog.getProducts())//Все норм, вывелся массив без 1го элемента

console.log("---------------------")

const productCart = new ProductCart(apiProducts.items)
console.log('Стартовый набор продуктов корзины: ', productCart.getProductList())
console.log('Добавим продукт в корзину: ', productCart.addProduct(apiProducts.items[2]))
console.log('Проверим, что он действительно добавился', productCart.getProductList())
console.log('А теперь удалим его: ', productCart.removeProduct(apiProducts.items[0]))
console.log('Проверим, что удалился: ', productCart.getProductList())
console.log('Первый товар доступен? ', productCart.getProductAvailability(apiProducts.items[0]))
console.log('Проверим общую стоимость за товары в корзине: ', productCart.getTotalPrice())
console.log('А сколько товаров в корзине?', productCart.getProductsQuantity())
console.log('Очистим всю корзину: ', productCart.clear())
console.log('Проверим очистку: ', productCart.getProductList())

console.log("---------------------")

const testCustomer: ICustomer = { //Сам нарисовал покупателя, тут нигде нет примера как с каталогом товаров
    paymentMethod: "online",
    adress: "123 Main St",
    email: "example@example.com",
    phone: "123123123",
}
const customer  = new Customer(testCustomer)
console.log('Изначальный покупатель: ', customer.getData())
customer.setAdress('guchiflex st.')
customer.setPaymentMethod('cash')
customer.setPhone('0000')
customer.setEmail('blabla@bla.bla')
console.log('Покупатель после махинаций с методами для установки новых данных: ', customer.getData())
customer.clearData()
console.log('Очистили данные, смотрим: ', customer.getData())
console.log('Проверим валидацию на пустом покупателе: ', customer.validateData())
customer.setAdress('guchiflex st.')
customer.setPaymentMethod('cash')
customer.setPhone('0000')
customer.setEmail('blabla@bla.bla')
console.log('А теперь валидация с заполненным покупателем: ', customer.validateData())

console.log("---------------------");

const api = new Api("https://larek-api.nomoreparties.co/api/weblarek");
const larek = new ProductApi(api);

larek.getProducts()
    .then(async (products) => {
        console.log('запросил каталог товара с сервера: ', products)
        //Тестовый заказ
    const testOrder: IOrderRequest = {
        payment: "online",
        email: "test@test.ru",
        phone: "+71234567890",
        address: "Spb Vosstania 1",
        total: 2200,
        items: [products[0].id, products[1].id]
    };

    const orderResponse = await larek.createOrder(testOrder);
    console.log("ответ сервера на заказ: ", orderResponse);
    })
    .catch(console.error)

    const catalogFromServer = new Catalog(await larek.getProducts(), null)
    console.log("Каталог с сервера: ", catalogFromServer)
    //Пришло 10 штук, все работает