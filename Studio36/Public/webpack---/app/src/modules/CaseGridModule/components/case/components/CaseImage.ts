import { AbstractCaseBlock } from './AbstractCaseBlock';
import { gsap } from 'gsap';
import { Globals } from '../../../../../data/Globals';

export class CaseImage extends AbstractCaseBlock {
	private _ratio: number;
	private _width: number;
	private _height: number;
	private _src: string;

	private _hasBeenInView: boolean = false;
	private _tinyImageLoaded: boolean = false;
	private _fullImageLoaded: boolean = false;
	private _smallImageLoaded: boolean = false;

	private _tinyImageElement: HTMLImageElement;
	private _smallImageElement: HTMLImageElement;
	private _fullImageElement: HTMLImageElement;

	private _element;

	private _isHeroImage: boolean = false;

	private _hasBeenInited: boolean = false;

	constructor(element: HTMLDivElement, type: string, isHeroImage?: boolean) {
		super(element, type);

		if (isHeroImage) {
			this._isHeroImage = isHeroImage;
		}

		this._element = element;

		this._src = this._element.getAttribute('data-src');

		this._height = parseFloat(this._element.getAttribute('data-image-height'));
		this._width = parseFloat(this._element.getAttribute('data-image-width'));
		this._ratio = parseFloat(this._element.getAttribute('data-ratio'));

		if (isHeroImage && Globals.MOBILE_LAYOUT_FIRST_LOAD) {
			var mobileSrc = this._element.getAttribute('data-mobile-src');
			if (mobileSrc !== '' && mobileSrc !== null) {
				this._src = mobileSrc;

				//console.log(this._ratio)
			}
			if (isHeroImage) {
				this._height = 700; //parseFloat(this._element.getAttribute('data-mobile-height'));
				this._width = 1050; //parseFloat(this._element.getAttribute('data-mobile-width'));
				this._ratio = this._width / this._height;
			}
		}
		this._tinyImageElement = element.querySelector('.tiny');
		this._smallImageElement = element.querySelector('.small');
		this._fullImageElement = element.querySelector('.full');

		this.loadTinyImage();
	}

	public isInView = () => {
		if (this._hasBeenInView === false) {
			this._hasBeenInView = true;
			this.loadSmallImage();
		}
	};

	/*public init = () => {
		if (this._hasBeenInited === false) {
			this.loadTinyImage();
			this._hasBeenInited = true;
		}
	};*/

	public outOfView = () => {};

	public isOutOfView = () => {};

	private loadTinyImage = () => {
		var getURL = Globals.loadThroughImageKit(this._src, null, 6);
		if (Globals.MOBILE_LAYOUT_FIRST_LOAD && this._isHeroImage) {
			getURL = Globals.loadThroughImageKit(this._src, null, 6, '3-2');
		}
		this._tinyImageElement.style.opacity = '0';
		this._tinyImageElement.style.width = '150%';
		this._tinyImageElement.addEventListener('load', this.tinyImageLoaded);
		this._tinyImageElement.setAttribute('src', getURL);
	};

	private tinyImageLoaded = event => {
		if (this._tinyImageElement) {
			this._tinyImageElement.removeEventListener('load', this.tinyImageLoaded);
			this._tinyImageLoaded = true;
			gsap.to(this._tinyImageElement, { duration: 0.3, opacity: 1, onComplete: this.tinyImageFadedIn });
		}
	};

	private tinyImageFadedIn = () => {
		//this.loadSmallImage();
	};

	private loadSmallImage = () => {
		// Remove background (so images dont risk having a border)
		var getURL = Globals.loadThroughImageKit(this._src, null, 500);
		if (Globals.MOBILE_LAYOUT_FIRST_LOAD && this._isHeroImage) {
			getURL = Globals.loadThroughImageKit(this._src, null, 500, '3-2');
		}
		this._smallImageElement.style.opacity = '0';

		this._smallImageElement.addEventListener('load', this.smallImageLoaded);
		this._smallImageElement.setAttribute('src', getURL);
	};

	private smallImageLoaded = event => {
		this._smallImageElement.removeEventListener('load', this.smallImageLoaded);
		this._smallImageLoaded = true;

		gsap.to(this._smallImageElement, { duration: 0.3, opacity: 1, onComplete: this.hideTinyImage });
	};

	private loadFullImage = () => {
		var getURL = Globals.loadThroughImageKit(this._src, null, 1200);
		if (Globals.MOBILE_LAYOUT_FIRST_LOAD && this._isHeroImage) {
			getURL = Globals.loadThroughImageKit(this._src, null, 1200, '3-2');
		}
		this._fullImageElement.style.opacity = '0';

		this._fullImageElement.addEventListener('load', this.fullImageLoaded);
		this._fullImageElement.setAttribute('src', getURL);
	};

	private fullImageLoaded = event => {
		this._fullImageElement.removeEventListener('load', this.fullImageLoaded);

		this._fullImageLoaded = true;
		gsap.to(this._fullImageElement, { duration: 0.1, opacity: 1, onComplete: this.hideBG });
	};

	private hideBG = () => {
		this._tinyImageElement.parentNode.removeChild(this._tinyImageElement);
		this._tinyImageElement = null;

		this._smallImageElement.style.display = 'none';

		if (Globals.USE_NIGHTSHIFT === true) {
			this.element.style.backgroundColor = '#000000';
		} else {
			this.element.style.backgroundColor = '#ffffff';
		}
	};

	private hideTinyImage = image => {
		//this._tinyImageElement.style.display = 'none';

		this.loadFullImage();
	};

	// @ts-ignore
	public resize = (height: number): void => {
		this.element.style.paddingLeft = Math.round(height * this._ratio) + 'px';
		this.element.style.width = this.element.style.paddingLeft;
	};

	get ratio() {
		return this._ratio;
	}
}
