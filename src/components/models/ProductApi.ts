import {IEvents} from '../base/Events.ts'
import {Api} from '../base/Api.ts'
import {IProduct, IProductResponse, IOrderRequest, IOrderResponse} from '../../types/index.ts'

export class ProductApi {
    private api: Api;

    constructor(protected events: IEvents, api: Api) {
        this.api = api
    }

    async getProducts() :Promise<IProduct[]> {
        const res = await this.api.get<IProductResponse>('/api/weblarek/product/');
        this.events.emit('productList.fetched', {productList: res.items})
        return res.items;
    }

    async createOrder(order: IOrderRequest): Promise<IOrderResponse> {
        this.events.emit('order.creating', {order})
        return this.api.post<IOrderResponse>('/api/weblarek/order/', order)

    }
}