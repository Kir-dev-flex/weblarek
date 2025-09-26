import {CardBase} from '../CardBase.ts';
import {IEvents} from '../../base/Events.ts'
import { ensureElement } from '../../../utils/utils.ts'
import {CDN_URL} from '../../../utils/constants.ts'

export class CardPreview extends CardBase {
    descriptionElement: HTMLElement;
    cardButtonElement: HTMLButtonElement;
    cardImageElement: HTMLImageElement;
    private isInCart: boolean = false;
    protected priceElement: HTMLElement;

    constructor (protected events: IEvents, container: HTMLElement) {
        super(events, container)
        this.descriptionElement = ensureElement<HTMLElement>('.card__text', this.container)  
        this.cardButtonElement = ensureElement<HTMLButtonElement>('.card__button', this.container)
        this.cardImageElement = ensureElement<HTMLImageElement>('.card__image', this.container)
        this.priceElement = ensureElement<HTMLElement>('.card__price', this.container)

        this.cardButtonElement.addEventListener('click', () => {
            if (this.isInCart) {
                this.events.emit('basket.remove', { id: this.cardId })
            } else {
                this.events.emit('basket.add', { id: this.cardId })
            }
            // Закрыть модалку после действия
            this.events.emit('modal.close')
        })
    }

    set description(description: string) {
        this.descriptionElement.textContent = description
    }

    set image (value: string) {
        this.cardImageElement.src = CDN_URL + value
    }

    set inCart(value: boolean) {
        this.isInCart = value
        if (!this.cardButtonElement.disabled) {
            this.cardButtonElement.textContent = value ? 'Удалить из корзины' : 'В корзину'
        }
    }

    set price (value: number | null) {
        if (value) {
            this.priceElement.textContent = String(value) + ' синапсов'
            this.cardButtonElement.disabled = false;
            this.cardButtonElement.textContent = this.isInCart ? 'Удалить из корзины' : 'В корзину'
        } else {
            this.priceElement.textContent = 'Бесценно'
            this.cardButtonElement.disabled = true;
            this.cardButtonElement.textContent = 'Недоступно'
        }
    }

}