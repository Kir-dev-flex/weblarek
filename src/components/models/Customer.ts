import {ICustomer} from "../../types/index.ts"

export class Customer {
    private paymentMethod: "online" | "cash" | ""
    private adress: string;
    private email: string;
    private phone: string;
    
    constructor (customer? : ICustomer) {
        //При заходе на страницу покупатель же должен быть пустым изначально, предусмотрю это
        this.paymentMethod = customer?.paymentMethod || ""
        this.adress = customer?.adress || ""
        this.email = customer?.email || ""
        this.phone = customer?.phone || ""
    }

    setAdress(adress: string) :void {
        this.adress = adress
    }
    setPaymentMethod(paymentMethod: "online" | "cash" | "") :void {
        this.paymentMethod = paymentMethod
    }
    setPhone(phone: string) :void {
        this.phone = phone
    }
    setEmail(email: string) :void {
        this.email = email
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
    }
    validateData(): string[] {
    const errors: string[] = [];

    if (!this.paymentMethod) errors.push("paymentMethod");
    if (!this.adress) errors.push("adress");
    if (!this.email) errors.push("email");
    if (!this.phone) errors.push("phone");

    return errors;
}
}