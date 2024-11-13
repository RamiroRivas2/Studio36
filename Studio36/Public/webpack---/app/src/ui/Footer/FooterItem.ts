import { gsap } from 'gsap';
import { Footer } from './Footer';

export class FooterItem {
	private _element: HTMLDivElement;
	private _footer: Footer;
	private _id: number;
	private _inner: HTMLDivElement;
	private _content: HTMLDivElement;
	private _contentHeight: number;

	private _label: HTMLDivElement;
	private _labelWidth: number;

	private _openPercent = { value: 0 };

	private _containerWidth: number;

	private _alignment: string;

	private _mobile: boolean = false;

	private _innerHeight: number;

	private _speedFactor: number = 1;

	constructor(element: HTMLDivElement, footer: Footer) {
		this._element = element;
		this._footer = footer;
		this._content = element.querySelector('.content');
		// gsap.set(this._content, { y: 20 });
		this._alignment = this._content.classList.contains('right') ? 'right' : 'left';

		this._inner = this._content.querySelector('.inner');

		this._label = element.querySelector('.button');

		this._id = parseInt(element.dataset.id);

		// element.addEventListener('click', this.onClick);
	}

	private onClick = e => {
		this._footer.updateButtons(this._id);
	};

	public expand = () => {
		this._element.classList.add('expanded');
		gsap.to(this._openPercent, { value: 1, onUpdate: this.update, duration: 0.5 * this._speedFactor, ease: 'power2.inOut' });
		gsap.to(this._content, { opacity: 1, delay: 0.5 * this._speedFactor, duration: 0.2 * this._speedFactor, y: 0 });
	};

	public collapse = () => {
		this._element.classList.remove('expanded');
		gsap.to(this._openPercent, { value: 0, onUpdate: this.update, duration: 0.5 * this._speedFactor, ease: 'power2.inOut' });
		gsap.to(this._content, { opacity: 0, duration: 0.2 * this._speedFactor, y: 20 });
	};

	public resize = (containerWidth: number) => {
		/*
		this._containerWidth = containerWidth;
		this._labelWidth = Math.ceil(this._label.getBoundingClientRect().width);
		this._innerHeight = Math.ceil(this._inner.getBoundingClientRect().height);

		gsap.set(this._inner, {
			width: this._mobile ? this._containerWidth : this._containerWidth * 0.49
		});

		this._contentHeight = this._inner.getBoundingClientRect().height;

		this.update();
		*/
	};

	get labelWidth() {
		return this._labelWidth;
	}

	private update = () => {
		/*
		gsap.set(this._content, {
			width: this._mobile ? this._containerWidth : this._containerWidth * 0.49 * this._openPercent.value,
			height: this._mobile ? this._innerHeight * this._openPercent.value : 'unset',
			x: this._mobile ? 0 : this._alignment === 'right' ? -(this._containerWidth * 0.49 + 10) : this._labelWidth + 60
		});

		//console.log('id : ' + this._id);
		//console.log(-(this._containerWidth * 0.49 + 10));
		*/
		this._footer.update();
	};

	get width() {
		return this._mobile ? this._containerWidth : this._labelWidth + this._containerWidth * 0.49 * this._openPercent.value;
	}

	get contentHeight() {
		return this._mobile ? this._innerHeight * this._openPercent.value : this._contentHeight;
	}

	get element() {
		return this._element;
	}

	get mobile() {
		return this._mobile;
	}

	set mobile(value: boolean) {
		this._mobile = value;
	}
}
