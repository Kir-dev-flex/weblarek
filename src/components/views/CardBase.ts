import {Component} from '../base/Component.ts';
import {IEvents} from '../base/Events.ts'
import { ensureElement } from '../../utils/utils.ts'

interface CardBaseData {
    title: string;
    price: number | null;
    id: string;
}

export class CardBase extends Component<CardBaseData> {
    protected titleElement: HTMLElement;
    protected priceElement: HTMLElement;
    protected cardId: string = '';

    constructor (protected events: IEvents, container: HTMLElement) {
        super(container)

        this.titleElement = ensureElement<HTMLElement>('.card__title', this.container)
        this.priceElement = ensureElement<HTMLElement>('.card__price', this.container)
    }

    set id (value: string) {
        this.cardId = value
    }

    set title (value: string) {
        this.titleElement.textContent = value
    }

    set price (value: number | null) {
        if (value) {
            this.priceElement.textContent = String(value) + ' синапсов'
        } else {
            this.priceElement.textContent = 'Бесценно'
        }
        
    }

}