import {IProduct} from "../../types/index.ts"

export class ProductCart {
    private productList: IProduct[];

    constructor(productList? : IProduct[]) {
        this.productList = productList || []
    }
    addProduct(product: IProduct) :void {
        this.productList.push(product)
    }
    removeProduct(product: IProduct) :void {
        this.productList = this.productList.filter(item => item.id !== product.id)
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
    }
}