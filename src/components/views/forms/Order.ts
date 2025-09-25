import { ensureElement } from '../../../utils/utils.ts'
import {IEvents} from '../../base/Events.ts'
import { FormBase } from '../FormBase.ts';

export class Order extends FormBase {
    protected onlineButton: HTMLButtonElement;
    protected cashButton: HTMLButtonElement;
    protected paymentMethod: 'online' | 'cash' | "" = "";
    protected addressInput: HTMLInputElement;

    constructor (protected events: IEvents, container: HTMLElement) {
        super(events, container)
        this.onlineButton = ensureElement<HTMLButtonElement>('[name=card]', this.container)
        this.cashButton = ensureElement<HTMLButtonElement>('[name=cash]', this.container)
        this.addressInput = ensureElement<HTMLInputElement>('[name=address]', this.container)

        this.onlineButton.addEventListener('click', () => {
            this.paymentMethod = 'online'
            this.updatePaymentButtons();
            this.updateNextState();
            this.events.emit('order.paymentMethod', {method: this.paymentMethod, address: this.addressInput.value})
        })

        this.cashButton.addEventListener('click', () => {
            this.paymentMethod = 'cash'
            this.updatePaymentButtons();
            this.updateNextState();
            this.events.emit('order.paymentMethod', {method: this.paymentMethod, address: this.addressInput.value})
        })

    }

    private updateNextState() {
        const address = this.addressInput.value.trim();
        const valid = Boolean(this.paymentMethod) && address.length > 0;
        if (!this.paymentMethod) {
            this.errors = 'Выберите способ оплаты';
        } else if (address.length === 0) {
            this.errors = 'Заполните поле адреса';
        } else {
            this.errors = '';
        }
        this.nextEnabled = valid;
    }

    private updatePaymentButtons() {
        const activeClass = 'button_alt-active';
        this.onlineButton.classList.toggle(activeClass, this.paymentMethod === 'online');
        this.cashButton.classList.toggle(activeClass, this.paymentMethod === 'cash');
    }

    render(data?: Partial<unknown>): HTMLElement {
        const el = super.render(data);
        this.updateNextState();
        this.updatePaymentButtons();
        this.addressInput.addEventListener('input', () => {
            this.updateNextState();
            this.events.emit('order.addressChange', {address: this.addressInput.value});
        });
        return el;
    }

    set address(value: string) {
        this.addressInput.value = value ?? '';
        this.updateNextState();
    }

    set payment(value: 'online' | 'cash' | '') {
        this.paymentMethod = value;
        this.updatePaymentButtons();
        this.updateNextState();
    }
}