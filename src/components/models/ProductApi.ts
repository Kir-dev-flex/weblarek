import {Api} from '../base/Api.ts'
import {IProduct, IProductResponse, IOrderRequest, IOrderResponse} from '../../types/index.ts'

export class ProductApi {
    private api: Api;

    constructor(api: Api) {
        this.api = api
    }

    async getProducts() :Promise<IProduct[]> {
        const res = await this.api.get<IProductResponse>('/api/weblarek/product/');
        return res.items;
    }

    async createOrder(order: IOrderRequest): Promise<IOrderResponse> {
        return this.api.post<IOrderResponse>('/api/weblarek/order/', order)
    }
}