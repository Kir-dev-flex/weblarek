import { ensureElement } from '../../../utils/utils.ts'
import {IEvents} from '../../base/Events.ts'
import { FormBase } from '../FormBase.ts';

export class Contacts extends FormBase {
    protected emailInput: HTMLInputElement;
    protected phoneInput: HTMLInputElement;

    constructor (protected events: IEvents, container: HTMLElement) {
        super(events, container)
        this.emailInput = ensureElement<HTMLInputElement>('[name=email]', this.container)
        this.phoneInput = ensureElement<HTMLInputElement>('[name=phone]', this.container)

        this.emailInput.addEventListener('input', () => {
            this.updateNextState();
            this.events.emit('contacts.emailChange', { email: this.emailInput.value });
        })
        this.phoneInput.addEventListener('input', () => {
            this.updateNextState();
            this.events.emit('contacts.phoneChange', { phone: this.phoneInput.value });
        })
    }

    private updateNextState() {
        const email = this.emailInput.value.trim();
        const phone = this.phoneInput.value.trim();
        let error = '';
        if (!email) error = 'Заполните поле Email';
        else if (!phone) error = 'Заполните поле телефона';
        this.errors = error;
        this.nextEnabled = !error;
    }

    render(data?: Partial<unknown>): HTMLElement {
        const el = super.render(data);
        this.updateNextState();
        this.formElement.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!this.nextButton.disabled) {
                this.events.emit('contacts.submit');
            }
        });
        return el;
    }
}