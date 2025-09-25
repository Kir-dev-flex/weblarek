import {Component} from '../base/Component.ts';
import { ensureElement } from '../../utils/utils.ts'
import {IEvents} from '../base/Events.ts'

interface SuccessData {
    description: string;
}

export class Success extends Component<SuccessData> {
    protected description: HTMLElement
    protected returnButton: HTMLButtonElement

    constructor (protected events: IEvents, container: HTMLElement) {
        super(container)    
        this.description = ensureElement<HTMLElement>('.order-success__description', this.container)
        this.returnButton = ensureElement<HTMLButtonElement>('.order-success__close', this.container)

        this.returnButton.addEventListener('click', () => {
            this.events.emit('success.close')
        })
    }

    set descriptionText(value: string) {
        this.description.textContent = `Списано ${value} синапсов`;
    }
}