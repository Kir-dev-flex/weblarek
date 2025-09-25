import {Component} from '../base/Component.ts';
import { ensureElement } from '../../utils/utils.ts'
import {IEvents} from '../base/Events.ts'

interface OrderData {
    nextButton: HTMLButtonElement;
}

export class FormBase  extends Component<OrderData> {
    protected nextButton: HTMLButtonElement;
    protected errorsElement: HTMLElement;
    protected formElement: HTMLFormElement;

    constructor (protected events: IEvents, container: HTMLElement) {
        super(container)
        this.formElement = (this.container as HTMLElement).tagName === 'FORM'
            ? (this.container as HTMLFormElement)
            : ensureElement<HTMLFormElement>('form.form', this.container)
        // Кнопка может отличаться по классам между формами, оказывается
        this.nextButton = this.container.querySelector<HTMLButtonElement>('.order__button')
            || this.container.querySelector<HTMLButtonElement>('.button[type="submit"]')
            || this.container.querySelector<HTMLButtonElement>('.button')
            || ensureElement<HTMLButtonElement>('.order__button', this.container)
        this.errorsElement = ensureElement<HTMLElement>('.form__errors', this.container)

        this.formElement.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!this.nextButton.disabled) {
                this.events.emit('form.next')
            }
        })
    }

    set errors(value: string) {
        this.errorsElement.textContent = value;
    }

    set nextEnabled(value: boolean) {
        this.nextButton.disabled = !value;
    }
    
}