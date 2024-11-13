import gsap from 'gsap';
import {PeopleTemplate} from "../PeopleTemplate";
import {WindowManager} from "../../utils/WindowManager";
import {Globals} from "../../data/Globals";
import {clamp} from "../../../lib/com/hellomonday/utils/MathUtils";

export class PeoplePartnerProfile {

	private _element: HTMLDivElement;
	private _info: HTMLDivElement;
	private _plus: HTMLDivElement;
	private _inner: HTMLDivElement;
	private _name: HTMLDivElement;
	private _innerName: HTMLDivElement;
	private _title: HTMLDivElement;
	private _innerTitle: HTMLParagraphElement;

	private _template: PeopleTemplate;
	private _main: HTMLDivElement;

	private _openPercent = {value: 0};
	private _innerHeight: number;
	private _open: boolean = false;

	private _highlighted: boolean = false;

	private _id: number;

	private _height: number;

	private _y: number;

	private _heroImage: HTMLDivElement;
	private _heroImageInline: HTMLDivElement;
	private _heroImageImageElement: HTMLImageElement;
	private _heroImageInlineImageElement: HTMLImageElement;
	private _heroActive: boolean = false;

	private _isPartner: boolean;

	private _officeId: number;

	private _nameCharCount: number;

	private _maxScale: number = 0.4;

	private _nameWidth: number;
	private _titleWidth: number;

	private _heroImageIsLoaded: boolean = false;
	private _heroImageInlineIsLoaded: boolean = false;

	constructor(element: HTMLDivElement, template: PeopleTemplate, id: number) {
		this._element = element;
		this._template = template;
		this._id = id;
		this._main = template.element.querySelector('.main');

		this._officeId = parseInt(element.dataset.officeId);

		this._isPartner = this._element.dataset.partner === 'true';

		this._inner = element.querySelector('.inner');
		this._name = element.querySelector('.name');
		this._innerName = this._name.querySelector('.innerName');
		this._title = element.querySelector('.title');
		this._innerTitle = this._title.querySelector('.innerTitle');

		// this._nameCharCount = this._name.innerText.length;
		this._heroImage = element.querySelector('.heroImage');
		this._heroImageInline = element.querySelector('.heroImageInline');
		if (this._heroImageInline) {
			this._heroImageInlineImageElement = this._heroImageInline.querySelector('img');

		}

		this._heroImageImageElement = this._heroImage.querySelector('img');

		this._nameWidth = this._innerName.getBoundingClientRect().width;
		this._titleWidth = this._innerTitle.getBoundingClientRect().width;

		// if (this._nameCharCount > 19) {
		// 	this._maxScale = 0.6;
		// }
		// if (this._nameCharCount > 29) {
		// 	this._maxScale = 0.5;
		// }

		gsap.set(this._name, {scale: 0.4, transformOrigin: '0% 0%'});

		if (this._isPartner) {
			this._info = element.querySelector('.info');
			this._plus = element.querySelector('.x');
			this._element.addEventListener('click', this.onClick);
		}

		if (!Globals.IS_TOUCH_DEVICE) {
			this._element.addEventListener('mouseover', this.onMouseOver);
			this._element.addEventListener('mouseout', this.onMouseOut);
		}
	}

	private onMouseOver = () => {
		if (Globals.MOBILE_LAYOUT === false) {
			//@ts-ignore
			this._template.closeFirstHighlight();
			this.toggleHighlight(true);
		}

	}

	private onMouseOut = () => {
		this.toggleHighlight(false);
	}

	private onClick = () => {
		this._open = !this._open;
		this.toggle(this._open);

		if (Globals.MOBILE_LAYOUT === false) {
			this._template.closeInactivePartners(this._id);
		}

	}

	public toggleHighlight = (state: boolean) => {
		/*if (state === this._highlighted) {
			return;
		}*/

		//	console.log('toggleHighlight', state);

		if (!this._heroActive) {
			this._heroActive = true;
			gsap.delayedCall(0, this.activateHeroImage);
		}

		this._highlighted = state;

		if (this._highlighted === true) {
			this._template.updateID(this._id);
		}

		let duration = 0.3;

		this.calculateScale();

		var easing = 'linear.none';

		if (state === true && this._heroImageIsLoaded === false) {
			this._heroImageIsLoaded = true;
			this._heroImageImageElement.addEventListener('load', this.showHeroImage);
			this._heroImageImageElement.src = this._heroImageImageElement.dataset.src;
			//console.log(this._heroImageImageElement.src)
		}

		gsap.to(this._heroImage, {
			opacity: this._highlighted ? 1 : 0,
			duration: 0.3,
			delay: this._highlighted ? 0.3 : 0,
			overwrite: true
		})

		var scaleTo = 0.4;
		var transformOrigin = '0% 25px';
		if (this._highlighted) {
			scaleTo = Globals.MOBILE_LAYOUT ? 0.6 : 0.6;
		} else {
			//scaleTo = 1;
		}

		if (Globals.MOBILE_LAYOUT) {
			transformOrigin = '0% 0%';
		}

		gsap.to(this._name, {
			scale: scaleTo, //this._highlighted ? Globals.MOBILE_LAYOUT ? 0.6 : this._maxScale : 0.4,
			duration: duration,//this._highlighted ? 0.2 : 0.5,
			transformOrigin: transformOrigin,
			delay: 0.0,
			overwrite: true,
			ease: easing
		});
	}

	private showHeroImage = (event) => {
		this.resize();
		event.currentTarget.removeEventListener('load', this.showHeroImage);
		gsap.to(event.currentTarget, {
			opacity: 1,
			duration: 0.3,
			overwrite: true
		})
		if (Globals.MOBILE_LAYOUT === true) {
			this.openState();
		}
	}

	private activateHeroImage = () => {
		this._heroImage.style.display = 'block';
	}

	private toggle = (state: boolean) => {
		this._open = state;


		if (state === true) {

			if (this._heroImageInlineIsLoaded === false) {
				this._heroImageInlineIsLoaded = true;
				this._heroImageInlineImageElement.addEventListener('load', this.showHeroImage);
				this._heroImageInlineImageElement.src = this._heroImageInlineImageElement.dataset.src;
				if (Globals.MOBILE_LAYOUT === true) {

				}
				else {
					this.openState();
				}
			} else {
				this.openState();
			}

			//	console.log(this._heroImageInlineImageElement.src)
		}
		else {
			this.closeState();
		}
	}

	private openState = () => {
		gsap.to(this._openPercent, {value: 1, onUpdate: this.update, duration: 1, ease: 'power1.inOut'});
		gsap.to(this._plus, {rotation: 45, duration: 0.5, ease: 'power1.inOut', transformOrigin: '50% 50%'});
	}

	private closeState = () => {
		gsap.to(this._openPercent, {value: 0, onUpdate: this.update, duration: 1, ease: 'power1.inOut'});
		gsap.to(this._plus, {rotation: 0, duration: 0.5, ease: 'power1.inOut', transformOrigin: '50% 50%'});
	}

	public close = () => {
		if (this._open) {
			this.toggle(false);
			this.toggleHighlight(false);
		}
	}

	private calculateScale = () => {
		let mainWidth = Math.round(this._main.getBoundingClientRect().width);

		let remaining = mainWidth - (this._titleWidth + 27 + 40); // x = 27, padding = 40

		this._maxScale = Globals.MOBILE_LAYOUT ? 0.4 : clamp(remaining / this._nameWidth, 0, 1);
	}

	public resize = () => {
		this._y = (this._element.getBoundingClientRect() as DOMRect).y;

		this.calculateScale();

		if (this._isPartner) {
			this._innerHeight = this._inner.getBoundingClientRect().height;
			//console.log(this._heroImageInlineImageElement.height)
			if (Globals.MOBILE_LAYOUT) {
				if (this._heroImageInlineImageElement.height > 0) {

				} else {
					this._innerHeight = this._innerHeight + (window.innerWidth - 40) * 0.75;
					//console.log('this._innerHeight : ' + this._innerHeight)
				}
			}

			this.update();
		}

		/*gsap.set(this._name, {
			scale: this._highlighted ? Globals.MOBILE_LAYOUT ? 0.6 : this._maxScale : 0.4,
			height: this._highlighted ? 50 : 11,
			x: this._highlighted ? Globals.MOBILE_LAYOUT ? 0 : -4 : 0,
			transformOrigin: '0% 0%',
		});*/

		// gsap.set(this._title, {
		// 	y: this._highlighted ? 50 : 0,
		// });

		/*gsap.set(this._element, {
			paddingBottom: this._highlighted ? Globals.MOBILE_LAYOUT ? 0 : 22 : 22,
		});*/
	}

	private update = () => {
		gsap.set(this._info, {height: (this._innerHeight + 22) * this._openPercent.value});
	}

	public kill = () => {
		if (this._isPartner) {
			this._element.removeEventListener('click', this.onClick);
		}

		if (!Globals.IS_TOUCH_DEVICE) {

			this._element.removeEventListener('mouseover', this.onMouseOver);
			this._element.removeEventListener('mouseout', this.onMouseOut);
		}
	}

	get y() {
		return (this._element.getBoundingClientRect() as DOMRect).y; // offsetTop;//
	}

	get height() {
		return (this._innerHeight + (this._open ? 50 : 18) + 11);
	}

	get element() {
		return this._element;
	}

	get officeId() {
		return this._officeId;
	}
}
