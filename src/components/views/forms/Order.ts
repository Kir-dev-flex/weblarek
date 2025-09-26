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
        // Явный submit: отправляем событие order.submit
        this.formElement.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!this.nextButton.disabled) {
                this.events.emit('order.submit');
            }
        });
        this.events.on('presenter.orderErrors', (payload: { errors: Record<string, string> }) => {
            const { errors } = payload;
            this.errors = errors.paymentMethod || errors.adress || '';
            this.nextEnabled = !errors.paymentMethod && !errors.adress && this.addressInput.value.trim().length > 0 && Boolean(this.paymentMethod);
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