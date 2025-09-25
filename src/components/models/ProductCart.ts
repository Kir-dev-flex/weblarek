import {IProduct} from "../../types/index.ts"
import {IEvents} from '../base/Events.ts'

export class ProductCart {
    private productList: IProduct[];

    constructor(protected events: IEvents, productList? : IProduct[]) {
        this.productList = productList || []
    }
    addProduct(product: IProduct) :void {
        this.productList.push(product)
        this.events.emit('cart.productAdded', {product})
    }
    removeProduct(product: IProduct) :void {
        this.productList = this.productList.filter(item => item.id !== product.id)
        this.events.emit('cart.productRemoved', {product})
    }
    getProductsQuantity() :number {
        return this.productList.length
    }
    getTotalPrice() :number {
        let totalValue = 0;
        this.productList.forEach(function(item) {
            if (item.price === null) {
                item.price = 99999999 //Надеюсь "бесценно" на языке программирования выглядит именно так
            }
            totalValue += item.price
        })
        return totalValue
    }
    getProductAvailability (product :IProduct) :boolean {
        if (this.productList.find(item => item.id === product.id)) {
            return true
        } else {
            return false
        }
    }
    getProductList() :IProduct[] {
        return this.productList
    }
    clear() :void {
        this.productList = []
        this.events.emit('cart.cleared')
    }
}