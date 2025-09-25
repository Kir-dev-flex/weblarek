import {CardBase} from '../CardBase.ts';
import {IEvents} from '../../base/Events.ts'
import { ensureElement } from '../../../utils/utils.ts'
import {CDN_URL} from '../../../utils/constants.ts'
import {categoryMap} from '../../../utils/constants.ts'

export class CardCatalog extends CardBase {
    categoryElement: HTMLElement;
    cardImageElement: HTMLImageElement;

    constructor (protected events: IEvents, container: HTMLElement) {
        super(events, container)
        this.categoryElement = ensureElement<HTMLElement>('.card__category', this.container)
        this.cardImageElement = ensureElement<HTMLImageElement>('.card__image', this.container)

        this.container.addEventListener('click', () => {
            this.events.emit('card.preview', {id: this.cardId})
        })
    }

    set category (value: string) {  
        this.categoryElement.textContent = value
        this.categoryElement.className = 'card__category ' + categoryMap[value as keyof typeof categoryMap];
    }

    set image (value: string) {
        this.cardImageElement.src = CDN_URL+value
    }
}