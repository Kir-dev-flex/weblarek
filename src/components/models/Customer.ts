import {ICustomer} from "../../types/index.ts"
import {IEvents} from '../base/Events.ts'

export class Customer {
    private paymentMethod: "online" | "cash" | ""
    private adress: string;
    private email: string;
    private phone: string;
    
    constructor (protected events: IEvents, customer? : ICustomer) {
        //При заходе на страницу покупатель же должен быть пустым изначально, предусмотрю это
        this.paymentMethod = customer?.paymentMethod || ""
        this.adress = customer?.adress || ""
        this.email = customer?.email || ""
        this.phone = customer?.phone || ""
    }

    setAdress(adress: string) :void {
        this.adress = adress
        this.events.emit('customer.adressChange', {adress: this.adress})
    }
    setPaymentMethod(paymentMethod: "online" | "cash" | "") :void {
        this.paymentMethod = paymentMethod
        this.events.emit('customer.paymentMethodChange', {paymentMethod: this.paymentMethod})
    }
    setPhone(phone: string) :void {
        this.phone = phone
        this.events.emit('customer.phoneChange', {phone: this.phone})
    }
    setEmail(email: string) :void {
        this.email = email
        this.events.emit('customer.emailChange', {email: this.email})
    }

    getData() :ICustomer {
        return {
            paymentMethod: this.paymentMethod,
            adress: this.adress,
            email: this.email,
            phone: this.phone
        }
    }
    clearData() :void {
        this.paymentMethod = "";
        this.adress = ""
        this.email = ""
        this.phone = ""
        this.events.emit('customer.dataCleared')
    }
    validateData(): string[] {
    const errors: string[] = [];

    if (!this.paymentMethod) errors.push("paymentMethod");
    if (!this.adress) errors.push("adress");
    if (!this.email) errors.push("email");
    if (!this.phone) errors.push("phone");
this.events.emit('customer.validation', {errors});
    return errors;
}
}