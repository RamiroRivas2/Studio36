import {AbstractTemplate} from './AbstractTemplate';
import {TemplateManager} from "../../lib/com/hellomonday/templateManager/TemplateManager";
import {WindowManager} from "../utils/WindowManager";

export class AboutTemplate extends AbstractTemplate {

	private _introBody: HTMLDivElement;

	constructor(element: HTMLDivElement, templateManager: TemplateManager) {
		super(element, templateManager);

		//
		this._introBody = element.querySelector('.introBody');
	}

	kill() {
		super.kill();
	}

	resize() {
		super.resize();

	/*	let bounds = this._introBody.getBoundingClientRect();
		let columnWidth = WindowManager.width > 640 ? (Math.round(bounds.width * 0.5) - 20) : 9999
		this._introBody.style.columnWidth = columnWidth + 'px';*/
	}

}
