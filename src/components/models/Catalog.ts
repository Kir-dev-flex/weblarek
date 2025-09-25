import { IProduct } from "../../types/index.ts"
import {IEvents} from '../base/Events.ts'

export class Catalog {
    private productList: IProduct[];
    private chosenProduct: IProduct | null;

    constructor(protected events: IEvents, productList?: IProduct[], chosenCard?: IProduct | null) {
        // Может быть пустым без изначальной "команды" на заполнение
        this.productList = productList || []
        this.chosenProduct = chosenCard || null
    }
    getProducts () :IProduct[] { //Для единообразия не буду пользоваться геттером
        return this.productList
    }
    getProductById (productId: string) :IProduct | undefined {
        return this.productList.find(product => product.id === productId)
    }
    setChosenProduct (product: IProduct) :void {
        this.chosenProduct = product
        this.events.emit('chosenProduct.change', {chosenProduct: this.chosenProduct})
    }
    getChosenProduct () :IProduct | null {
        return this.chosenProduct
    }
    setProductList (productList : IProduct[]) :void {
        this.productList = productList
        this.events.emit('productList.change', {productList: this.productList})
    }
}