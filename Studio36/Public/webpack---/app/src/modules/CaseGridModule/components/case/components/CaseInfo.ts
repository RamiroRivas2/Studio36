import { gsap } from 'gsap';
import { Howl } from 'howler';
import { Globals } from '../../../../../data/Globals';
import { CaseEntry } from '../CaseEntry';

export class CaseInfo {
	private _element: HTMLDivElement;
	private _icon: HTMLDivElement;
	private _iconSVG;
	private _iconSVGMobile;
	// private _iconSVG: HTMLImageElement;

	private _keys: NodeListOf<HTMLParagraphElement>;
	private _values: NodeListOf<HTMLParagraphElement>;

	private _additionalInfoActive: boolean = false;
	private _mobileAdditionalInfoActive: boolean = false;

	private _mainInfo: HTMLDivElement;
	private _mainInfoH: number;

	private _mainDate: HTMLDivElement;

	private _scale: number = 1;

	private _id: number;

	private _expanded: boolean = false;

	private _opened: boolean = false;

	private _draggedX: number = 0;

	private _audioTour;
	private _audioTourHowl: Howl;

	private _disabled: boolean = false;
	private _mobileInfoElement;

	private _previousInfoScale: number = 0;
	private _previousControllerScaleValue: number = 0;

	private _caseEntry: CaseEntry;

	private _storePreviousScale: number;

	constructor(element: HTMLDivElement, id: number, caseEntry: CaseEntry) {
		this._element = element;
		this._id = id;
		this._caseEntry = caseEntry;

		this._icon = element.querySelector('.icon');
		gsap.set(this._icon, { width: 40, height: 40 });

		this._iconSVG = this._icon.querySelector('img');
		// this._iconSVG = this._icon.querySelector('img');
		//gsap.set(this._iconSVG, { opacity: 0 });

		this._mainInfo = element.querySelector('.mainInfo');
		this._mainInfoH = this._mainInfo.getBoundingClientRect().height;

		this._mainDate = this._mainInfo.querySelector('.date');

		gsap.set(this._mainInfo, { scaleX: 0.75, scaleY: 0.75, y: 8 + 18, transformOrigin: Globals.MOBILE_LAYOUT ? '0% 0%' : '100% 0%', force3D: true });

		this._audioTour = this._element.querySelector('.audioTour');

		var mobileInfo = this._element.parentNode.querySelector('.mobileInfo');
		this._mobileInfoElement = mobileInfo;

		this._iconSVGMobile = this._element.parentNode.parentNode.parentNode.querySelector('.mobileSVG');

		var additionalInfo = this._element.querySelector('.additionalInfo');
		//additionalInfo.style.paddingLeft = 'calc(250px + 60px)';
		//	console.log(this._element)
		mobileInfo.innerHTML = additionalInfo.innerHTML;

		//	mobileInfo.appendChild(additionalInfo);

		this.initAdditionalInfo();
	}

	public getMobileInfoElement = () => {
		return this._mobileInfoElement;
	};

	private initAdditionalInfo = () => {
		this._keys = this._element.querySelectorAll('.key');
		this._values = this._element.querySelectorAll('.value-content');

		if (Globals.MOBILE_LAYOUT) {
			this._keys = this._mobileInfoElement.querySelectorAll('.key');
			this._values = this._mobileInfoElement.querySelectorAll('.value-content');
		}
		let l = this._keys.length;

		for (let i = 0; i < l; i++) {
			gsap.set(this._keys[i], { x: -10 });
			gsap.set(this._values[i], { x: -10 });
		}

		if (this._audioTour) {
			gsap.set(this._audioTour, { x: -10 });

			this._audioTourHowl = new Howl({
				src: [this._audioTour.dataset.audioUrl],
				html5: true
			});

			this._audioTour.addEventListener('click', this.toggleAudioTour);
		}
	};

	private toggleAudioTour = () => {
		if (!this._audioTourHowl.playing()) {
			this._audioTourHowl.play();
		} else {
			this._audioTourHowl.stop();
		}
	};

	public displayAdditionalInfo = () => {
		// this._additionalInfoActive = true;
		if (Globals.MOBILE_LAYOUT) {
			this._mobileAdditionalInfoActive = true;
		}

		gsap.to(this.element, { opacity: 1, duration: 0.3 });

		gsap.to(this._mainDate, { opacity: 1, duration: 0.3 });

		this.toggleInfo(true);
	};

	public hideMobileAdditionalInfo = () => {
		this._mobileAdditionalInfoActive = false;
		gsap.set(this.element, { opacity: 0 });
	};

	public toggleInfo = (state: boolean) => {
		if (state === this._additionalInfoActive) {
			return;
		}

		this._additionalInfoActive = state;
		let l = this._keys.length;
		let i = 0;

		var setOpacity = 0;
		if (state === true) {
			setOpacity = 1;
		}

		var easeType = 'power2.out';
		if (state === false) {
			easeType = 'power2.in';
		}
		//	console.log(this._keys[i]);
		gsap.to(this._keys, {
			opacity: setOpacity,
			x: state ? 0 : -20,
			// y: -3,
			ease: easeType,
			duration: state ? 0.8 : 0.2,
			// force3D: true,
			delay: this._opened ? 0 : state ? 0.9 + i * 0.05 : 0,
			overwrite: true
		});

		//	console.log(this._values[i]);
		gsap.to(this._values, {
			opacity: setOpacity,
			x: state ? 0 : -20,
			ease: easeType,
			duration: state ? 0.8 : 0.2,
			// force3D: true,
			delay: this._opened ? 0 : state ? 0.9 + i * 0.05 : 0,
			overwrite: true
		});
		//	}

		if (this._audioTour) {
			gsap.to(this._audioTour, {
				opacity: state ? 1 : 0,
				x: state ? 0 : -10,
				ease: easeType,
				duration: state ? 0.8 : 0.2,
				// force3D: true,
				delay: this._opened ? 0 : state ? 0.9 + i * 0.2 : 0,
				overwrite: true
			});

			if (state === false && this._audioTourHowl.playing()) {
				this._audioTourHowl.stop();
			}
		}

		this._opened = true;
	};

	public expand = () => {
		if (this._expanded) {
			return;
		}

		this._expanded = true;

		//gsap.to(this, { scale: 1, duration: 0.75, delay: 0.5, ease: 'power2.out', overwrite: true }); //, overwrite: true});

		//gsap.to(this._icon, {delay: 0.2, width: 38, height: 38, duration: 0.3, force3D: true, overwrite: true});

		// if (this._additionalInfoActive) {
		// 	this.toggleInfo(true);
		// }
	};

	public collapse = () => {
		if (!this._expanded) {
			return;
		}

		this._expanded = false;

		gsap.to(this, { scale: 0, duration: 0.75, ease: 'power2.out', overwrite: true }); //, overwrite: true});

		//gsap.to(this._icon, {width: 8, height: 8, duration: 0.3, force3D: true, overwrite: true});

		// if (this._additionalInfoActive) {
		// 	this.toggleInfo(false);
		// }
	};

	public update = (x: number) => {
		//gsap.set(this._element, {x: x, force3D: true});
	};

	get draggedX() {
		return this._draggedX;
	}

	set draggedX(value: number) {
		this._draggedX = value;
	}

	get mainInfoH() {
		if (Globals.MOBILE_LAYOUT) {
			return this._mainInfoH * (0.75 + 0.25 * this._scale);
		} else {
			return (this._mainInfoH + 18 + 30) * (0.75 + 0.25 * this._scale) + 8;
		}
	}

	get element() {
		return this._element;
	}

	get scale() {
		return this._scale;
	}

	set scale(value: number) {
		this.scaleSet(value);
	}

	private scaleSet = (value: number, force?: boolean) => {
		this._storePreviousScale = this._scale;
		if (Globals.CASE_CONTROLLER_SCALE_VALUE !== this._previousControllerScaleValue || force === true) {
			this._previousControllerScaleValue = Globals.CASE_CONTROLLER_SCALE_VALUE;
			/*	if (this._id === 0) {
				console.log(' ---- scale : ' + value);
			}*/
			this._scale = 1 - Globals.CASE_CONTROLLER_SCALE_VALUE + 0.5;

			var scaleDiff = 1 - Globals.CASE_CONTROLLER_SCALE_VALUE;

			gsap.set([this._icon], { scale: scaleDiff + 1, transformOrigin: '100% 0%', overwrite: true });
		}

		/*console.log('Globals.CASE_CONTROLLER_SCALE_VALUE: ' + Globals.CASE_CONTROLLER_SCALE_VALUE)
	console.log('scaleDiff : ' + scaleDiff)

	console.log(' ---- tscaleDiff + 1 : ' + (scaleDiff + 1));*/

		//gsap.set([this._icon, this._iconSVG], { width: 45 * this._scale, height: 45 * this._scale, overwrite: true });

		//gsap.set(this._icon, {scale: this._scale, force3D: true, overwrite: true});

		if (Globals.SHUFFLE_INFO_SCALE.value !== this._previousInfoScale || force === true) {
			this._previousInfoScale = Globals.SHUFFLE_INFO_SCALE.value;
			let infoScale = 1; // 0.75 + 0.25 * this._scale;
			gsap.set(this._mainInfo, {
				scaleX: infoScale * Globals.SHUFFLE_INFO_SCALE.value,
				scaleY: infoScale * Globals.SHUFFLE_INFO_SCALE.value,
				y: Globals.MOBILE_LAYOUT ? 0 : 71 * Globals.SHUFFLE_INFO_SCALE.value /* * this._scale*/,
				transformOrigin: Globals.MOBILE_LAYOUT ? '0% 0%' : '100% 0%',
				overwrite: true
			});
		}

		//gsap.set(this._iconSVG, { opacity: this._scale });
	};

	get mobileAdditionalInfoActive() {
		return this._mobileAdditionalInfoActive;
	}

	get mainInfo() {
		return this._mainInfo;
	}

	get disabled() {
		return this._disabled;
	}

	set disabled(value: boolean) {
		this._disabled = value;
	}

	public loadIcon = () => {
		if (this._iconSVG) {
			this._iconSVG.addEventListener('load', this.iconLoaded);
			this._iconSVG.src = this._iconSVG.getAttribute('data-src');

			this._iconSVGMobile.addEventListener('load', this.iconLoadedMobile);
			this._iconSVGMobile.src = this._iconSVGMobile.getAttribute('data-src');
		}
	};

	private iconLoaded = event => {
		gsap.to(this._iconSVG, { duration: 0.2, opacity: 1 });
	};

	private iconLoadedMobile = event => {
		gsap.to(this._iconSVGMobile, { duration: 0.2, opacity: 1 });
	};

	public kill = () => {
		if (this._audioTour) {
			this._audioTourHowl.stop();
			this._audioTour.removeEventListener('click', this.toggleAudioTour);
		}
	};

	public resize = () => {
		if (Globals.MOBILE_LAYOUT) {
			this._mobileInfoElement.style.display = 'block';
			this.element.style.display = 'none';
			this.scaleSet(this._storePreviousScale, true);
		} else {
			this._mobileInfoElement.style.display = 'none';
			this.element.style.display = 'block';
			this.scaleSet(this._storePreviousScale, true);

			if (this._caseEntry.isOpen) {
				this.toggleInfo(true);
			} else {
				this.toggleInfo(false);
			}
		}
	};
}
