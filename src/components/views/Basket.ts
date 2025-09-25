import {IEvents} from '../base/Events.ts'
import {Component} from '../base/Component.ts';
import { ensureElement } from '../../utils/utils.ts'

interface BasketData {
    totalPrice: number;
}

export class Basket extends Component<BasketData> {
    protected basketBuyButton: HTMLButtonElement;
    protected total: HTMLElement;
    protected basketList: HTMLElement;

    constructor (protected events: IEvents, container: HTMLElement) {
        super(container)        
        this.basketBuyButton = ensureElement<HTMLButtonElement>('.basket__button', this.container)
        this.basketList = ensureElement<HTMLElement>('.basket__list', this.container)

        this.total = ensureElement<HTMLElement>('.basket__price', this.container)
        this.basketBuyButton.addEventListener('click', () => {
            this.events.emit('basket.buy')
        })}

        set totalPrice(value: number) {
            this.total.textContent = String(value) + ' синапсов';
            this.events.emit('basket.totalPriceChange')
        }

        set items(value: HTMLElement[]) {
            if (value.length === 0) {
                this.basketList.replaceChildren();
                this.basketList.textContent = 'Корзина пуста';
                this.total.textContent = '0 синапсов';
                this.basketBuyButton.disabled = true;
            } else {
                this.basketList.replaceChildren(...value);
                this.basketBuyButton.disabled = false;
            }
            this.events.emit('basket.itemsChange')
        }

        
}