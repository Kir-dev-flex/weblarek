import {Component} from '../base/Component.ts';
import { ensureElement } from '../../utils/utils.ts'
import {IEvents} from '../base/Events.ts'

interface ModalData {
    element: HTMLElement
}

export class Modal extends Component<ModalData> {
    protected modalClose: HTMLButtonElement;
    protected modalContent: HTMLElement;

    constructor (protected events: IEvents, container: HTMLElement) {
        super(container)

        this.modalClose = ensureElement<HTMLButtonElement>('.modal__close', this.container)
        this.modalContent = ensureElement<HTMLElement>('.modal__content', this.container)

        this.modalClose.addEventListener('click', () => {
            this.events.emit('modal.close')
        })

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.events.emit('modal.close')}
        })

        // Закрытие по клику вне модального окна
        this.container.addEventListener('click', (event) => {
            if (event.target === this.container) {
                this.events.emit('modal.close')
            }
        })
    }

    set content(element: HTMLElement) {
        this.modalContent.replaceChildren(element)
    }

    open(element: HTMLElement) {
        this.content = element; 
        this.container.classList.add('modal_active');
    }

    close() {
        this.container.classList.remove('modal_active');
        this.modalContent.replaceChildren(); 
    }
}