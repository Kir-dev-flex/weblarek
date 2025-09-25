import {CardBase} from '../CardBase.ts';
import {IEvents} from '../../base/Events.ts'
import { ensureElement } from '../../../utils/utils.ts'

export class CardBasket extends CardBase {
    cardDelete: HTMLButtonElement;
    cardNumber: HTMLElement;

    constructor (protected events: IEvents, container: HTMLElement) {
        super(events, container)
        this.cardDelete = ensureElement<HTMLButtonElement>('.basket__item-delete', this.container)
        this.cardNumber = ensureElement<HTMLElement>('.basket__item-index', this.container)

        this.cardDelete.addEventListener('click', () => {
            this.events.emit('card.deleteFromBasket', {id: this.cardId})
        })
    }

    set cardIndex(value: number) {  
        this.cardNumber.textContent = String(value)
    }
}