import { AbstractModule } from '../../../lib/com/hellomonday/templateManager/AbstractModule';
import { Globals } from '../../data/Globals';
import { AbstractTemplate } from '../../templates/AbstractTemplate';
import { CaseController } from './components/CaseController';

export class CaseGridModule extends AbstractModule {
	private _controller: CaseController;

	constructor(element: HTMLElement, template: AbstractTemplate) {
		super(element, template);

		window.scrollTo(0, 0);

		this._controller = new CaseController(element as HTMLDivElement);

		Globals.PROGRESS_BAR = element.querySelector('.progressBar');

		if (!Globals.IS_TOUCH_DEVICE) {
			this.element.addEventListener('mousedown', this.onDown);
			this.element.addEventListener('mouseup', this.onUp);
		}
	}

	private onDown = () => {
		this.element.classList.add('grabbing');
	};

	private onUp = () => {
		this.element.classList.remove('grabbing');
	};

	public resize() {
		super.resize();
		this._controller.resize();
	}

	public kill() {
		super.kill();
		this._controller.kill();

		if (!Globals.IS_TOUCH_DEVICE) {
			this.element.removeEventListener('mousedown', this.onDown);
			this.element.removeEventListener('mouseup', this.onUp);
		}
	}
}
