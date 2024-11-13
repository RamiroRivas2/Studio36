import { AbstractCaseBlock } from './AbstractCaseBlock';
import { gsap } from 'gsap';
import { WindowManager } from '../../../../../utils/WindowManager';

export class CaseQuote extends AbstractCaseBlock {
	private _content: HTMLDivElement;
	private _marker: HTMLSpanElement;

	private _element;
	private _spanElement;

	private _hasBeenInView: boolean = false;

	constructor(element: HTMLDivElement, type: string) {
		super(element, type);

		this._element = element;

		this._content = element.querySelector('.contents');

		this._spanElement = element.querySelector('span');
		// this._marker = this._content.querySelector('.marker');
	}

	public isInView = boundsHeight => {
		if (this._hasBeenInView === false) {
			//	console.log('IsInView()');
			this._hasBeenInView = true;
			this.resize(boundsHeight);
		}
	};

	// @ts-ignore
	public resize = (height: number): void => {
		// let columns:number = Math.ceil(this._marker.offsetLeft / 330) + 1;
		// this.element.style.paddingLeft = (290 * columns + (40 * (columns - 1))) + 'px';

		if (WindowManager.width < 680) {
			this._element.style.paddingLeft = WindowManager.width - 20 + 'px';
		} else {
			this._element.style.paddingLeft = 680 + 'px';
		}

		this._content.style.maxWidth = this._element.style.width;

		let contentHeight = this._content.offsetHeight;

		this._spanElement.style.display = 'block';
		//console.log('contentHeight : ' + contentHeight + ' - height: ' + height);

		if (contentHeight !== 0) {
			let offset = height - contentHeight;
			/*console.log(' --- CASE QOUTE --- ');
			console.log('height : ' + height);
			console.log('contentHeight : ' + contentHeight);*/
			//console.log('height : ' + height);
			let scale = 1;
			//
			if (offset < 0) {
				scale = height / contentHeight;
			}
			var newYPos = Math.round(offset * 0.5);
			//console.log('newYPos : ' + newYPos);
			gsap.set(this._content, { y: newYPos });

			//gsap.set(this._content, { y: 20 });
			//gsap.set(this._content, {y: Math.round(offset * 0.5), scale: scale});
			//gsap.set(this._content, { y: 0 });
		}
	};

	// public kill = () => {
	// 	super.kill();
	// }
}
