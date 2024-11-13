import { AbstractCaseBlock } from './AbstractCaseBlock';
import { gsap } from 'gsap';
import { Globals } from '../../../../../data/Globals';
import { GlobalCursor } from '../../../../../utils/GlobalCursor/GlobalCursor';

const DELAY: number = 2.5;

export class CaseGallery extends AbstractCaseBlock {
	private _ratio: number;

	private _hasBeenInView: boolean = false;

	private _tinyImageElement;
	private _tinyImageLoaded: boolean = false;

	private _images: NodeListOf<HTMLImageElement>;
	private _captions: NodeListOf<HTMLDivElement>;

	private _step: number = 0;
	private _totalSteps: number;

	private _observer: IntersectionObserver;

	private _active: boolean = false;

	private _looping: boolean = false;

	private _stepDisplayTotal: HTMLDivElement;
	private _stepDisplayCurrent: HTMLDivElement;

	private _firstImage;

	private _paused: boolean = true;

	private _galleryAutoPlay: boolean = true;

	private _fullImage: boolean = false;
	private _storeWidth: number = 0;

	private _arrowLeft;
	private _arrowRight;
	private _hoverSide: string = '';

	private _hideNumbersAndText: boolean = false;

	constructor(element: HTMLDivElement, type: string) {
		super(element, type);

		this._ratio = parseFloat(this.element.getAttribute('data-ratio'));

		this._captions = element.querySelectorAll('.caption');
		this._images = element.querySelectorAll('.full');

		this._arrowLeft = element.querySelector('.arrowLeft');
		this._arrowRight = element.querySelector('.arrowRight');

		this._tinyImageElement = element.querySelector('.tiny');

		this._totalSteps = this._images.length;

		this._stepDisplayTotal = element.querySelector('.step .total');
		this._stepDisplayCurrent = element.querySelector('.step .current');
		this.updateStepDisplay();

		var hideNumbers = element.dataset.hidenumbers;
		if (hideNumbers == '1') {
			this._hideNumbersAndText = true;
			this._fullImage = true;
			this._arrowLeft.style.display = 'none';
			this._arrowRight.style.display = 'none';
		}

		if (this._totalSteps === 1 || this._hideNumbersAndText === true) {
			// If there is only 1 image - we hide the step counter
			var getStep = element.querySelector('.step');
			//@ts-ignore
			getStep.style.display = 'none';
		}

		var getFirstInner = element.querySelector('.inner').innerHTML;

		function onlySpaces(str) {
			return str.trim().length === 0;
		}

		//console.log(' **** : getFirstInner : ' + getFirstInner);

		// If no text in the first image - we swap it to a large image
		if (onlySpaces(getFirstInner) === true || this._hideNumbersAndText === true) {
			var imgTags = element.querySelectorAll('img');
			for (var i = 0; i < imgTags.length; i++) {
				var currentImg = imgTags[i];
				if (this._hideNumbersAndText === true) {
					currentImg.style.height = 'calc(100%)';
				} else {
					currentImg.style.height = 'calc(100% - 30px)';
				}
			}

			this._fullImage = true;
			//height: calc(100% - 70px - 30px);
			var getStep = element.querySelector('.step');
			//@ts-ignore
			getStep.style.display = 'block';

			if (this._hideNumbersAndText === true) {
				//@ts-ignore
				getStep.style.display = 'none';
			}
		}
		if (this._hideNumbersAndText !== true) {
			gsap.set(this._captions[0], { opacity: 1 });
		}

		/*this._observer = new IntersectionObserver((entries, observer) => {
			if (entries[0].isIntersecting) {
				this._active = true;
				this._observer.disconnect();

				this._looping = true;
				gsap.delayedCall(DELAY, this.stepForward);

				if (this._totalSteps > 1) {
					// Do not add any mouse over functionality if there is only 1 image
					element.addEventListener('click', this.toggle);
					element.addEventListener('mousemove', this.mouseMove);
					element.addEventListener('mouseleave', this.mouseLeave);
				}
			}
		});*/

		if (this._totalSteps > 1) {
			this._looping = true;
			gsap.delayedCall(DELAY, this.stepForward);

			// Do not add any mouse over functionality if there is only 1 image
			element.addEventListener('click', this.clickGallery);
			element.addEventListener('mousemove', this.mouseMove);
			element.addEventListener('mouseleave', this.mouseLeave);
		}

		this.loadTinyImage();

		//this._observer.observe(element);
		this.pause();
	}

	private loadTinyImage = () => {
		var getURL = this._tinyImageElement.getAttribute('data-src');
		getURL = Globals.loadThroughImageKit(getURL, null, 4);

		this._tinyImageElement.addEventListener('load', this.tinyImageLoaded);
		this._tinyImageElement.setAttribute('src', getURL);
	};

	private tinyImageLoaded = event => {
		this._tinyImageElement.removeEventListener('load', this.tinyImageLoaded);
		this._tinyImageLoaded = true;
		gsap.to(this._tinyImageElement, { duration: 0.3, opacity: 1 });
	};

	private loadImages = () => {
		for (var i = 0; i < this._images.length; i++) {
			var currentImage = this._images[i];
			if (i === 0) {
				this._firstImage = currentImage;
			}
			var getURL = currentImage.getAttribute('data-src');
			getURL = Globals.loadThroughImageKit(getURL, null, 1000);
			currentImage.addEventListener('load', this.imageLoaded);
			//	currentImage.style.opacity = '1';
			currentImage.setAttribute('src', getURL);
			currentImage.style.zIndex = '3';
		}
	};

	private imageLoaded = event => {
		var target = event.currentTarget;
		if ((target = this._firstImage)) {
			gsap.to(target, { opacity: 1, duration: 0.2, onComplete: this.hideTinyImage });
		}
	};

	private hideTinyImage = () => {
		/*this._tinyImageElement.style.display = 'none';*/
		//this._tinyImageElement.style.opacity = 0;
		gsap.killTweensOf(this._tinyImageElement);
	};

	public isInView = (height, state) => {
		//console.log('isInView : ' + height + ' : ' + state);
		//console.log('this._paused : ' + this._paused);
		if (this._hasBeenInView === false) {
			// First time it gets into view
			this._hasBeenInView = true;
			this.loadImages();
		}
		if (this._paused === true) {
			if (this._totalSteps > 1) {
				this._galleryAutoPlay = true;
				this.resume();
			}
		}
	};

	public outOfView = () => {
		this.pause();
	};

	private mouseMove = e => {
		if (this._paused === false && Globals.GLOBAL_CURSOR.isDragging === false) {
			var x = e.offsetX;
			var y = e.pageY;

			var halfWidth = this._storeWidth / 2;
			var getMiddlePercentage = 0; //this._storeWidth * 0.2;

			Globals.GLOBAL_CURSOR.isHoveringItem = true;

			if (x < halfWidth - getMiddlePercentage) {
				this._hoverSide = 'left';
				//	gsap.to(this._arrowLeft, {duration: 0.2, opacity: 1});
				//	gsap.to(this._arrowRight, {duration: 0.2, opacity: 0});
				Globals.GLOBAL_CURSOR.showCursorType('arrow_left_small');
			} else if (x >= halfWidth + getMiddlePercentage) {
				this._hoverSide = 'right';
				//	gsap.to(this._arrowLeft, {duration: 0.2, opacity: 0});
				//	gsap.to(this._arrowRight, {duration: 0.2, opacity: 1});
				Globals.GLOBAL_CURSOR.showCursorType('arrow_right_small');
			} /* else {
				this._hoverSide = 'middle';
				if (this._galleryAutoPlay === true) {
					Globals.GLOBAL_CURSOR.showCursorType('pause');
				} else {
					Globals.GLOBAL_CURSOR.showCursorType('play');
				}
			}*/
		}
	};

	private mouseLeave = e => {
		Globals.GLOBAL_CURSOR.isHoveringItem = false;
		if (this._paused === false) {
			gsap.to([this._arrowRight, this._arrowLeft], { duration: 0.2, opacity: 0 });
		}
	};

	private toggle = event => {
		//	console.log('**** --- Stepforward');
		var getXPosition = event.offsetX;
		//console.log(getXPosition);

		if (this._paused === true) {
			gsap.killTweensOf(this.stepForward);

			/*	this._looping = !this._looping;

			if (this._looping) {
				gsap.delayedCall(DELAY, this.stepForward);
			}*/
			this._looping = false;
			gsap.delayedCall(0, this.stepForward, [true]);

			if (event) {
				event.stopPropagation();
			}
		}
	};

	private clickGallery = event => {
		let newStep;

		if (this._paused === false) {
			if (this._hoverSide === 'left') {
				this._step = this._step - 1;
				this._galleryAutoPlay = false;
				this.stopAutoPlay();
			} else if (this._hoverSide === 'right') {
				this._step = this._step + 1;
				this._galleryAutoPlay = false;
				this.stopAutoPlay();
			} else if (this._hoverSide === 'middle') {
				if (this._galleryAutoPlay === true) {
					this._galleryAutoPlay = false;
					Globals.GLOBAL_CURSOR.showCursorType('play');
					this.stopAutoPlay();
				} else if (this._galleryAutoPlay === false) {
					this._galleryAutoPlay = true;
					this.startAutoPlay();
					Globals.GLOBAL_CURSOR.showCursorType('pause');
				}
			}
			this.showImageNumber();
		}
	};

	private stepForward = clicked => {
		if (this._paused) {
			return;
		}
		let newStep;
		if (clicked === true) {
		} else {
			newStep = this._step + 1;
		}

		if (newStep > this._totalSteps - 1) {
			newStep = 0;
		}
		if (newStep < 0) {
			newStep = this._totalSteps - 1;
		}

		this._step = newStep;

		if (this._looping === true && this._galleryAutoPlay === true) {
			if (clicked === true) {
			} else {
				gsap.delayedCall(DELAY, this.stepForward);
			}
		}
	};

	private startAutoPlay = () => {
		if (this._galleryAutoPlay === true && this._paused === false) {
			//gsap.delayedCall(DELAY, this.showImageNumber);
			this._step = this._step + 1;
			this.autoPlayNextImage();
		}
	};

	private autoPlayNextImage = () => {
		if (this._galleryAutoPlay === true && this._paused === false) {
			this._step = this._step + 1;
			this.showImageNumber();
			gsap.delayedCall(DELAY, this.autoPlayNextImage);
		}
	};

	private stopAutoPlay = () => {
		gsap.killTweensOf(this.autoPlayNextImage);
	};

	private showImageNumber = () => {
		if (this._step < 0) {
			this._step = this._totalSteps - 1;
		}
		if (this._step > this._totalSteps - 1) {
			this._step = 0;
		}
		let l = this._images.length;
		for (let i = 0; i < l; i++) {
			// gsap.to(this._images[i], {opacity: i === newStep ? 1 : 0, duration: 0.5});
			gsap.to(this._images[i], { display: i === this._step ? 'block' : 'none', opacity: i === this._step ? 1 : 0, duration: 0.5 });
			if (this._hideNumbersAndText !== true) {
				gsap.to(this._captions[i], { opacity: i === this._step ? 1 : 0, duration: 0.5 });
			}
		}
		this.updateStepDisplay();
	};

	private updateStepDisplay = () => {
		let stepNormalized = this._step + 1 < 10 ? '0' + (this._step + 1) : this._step + 1;
		let totalNormalized = this._totalSteps < 10 ? '0' + this._totalSteps : this._totalSteps;

		this._stepDisplayCurrent.innerText = stepNormalized + ' / ';
		this._stepDisplayTotal.innerText = totalNormalized + '';
	};

	// @ts-ignore
	public resize = (height: number): void => {
		var useHeight = 85;
		if (this._fullImage) {
			useHeight = 0;
		}

		/*if (height < 400) {
			gsap.set(this._captions, {fontSize: '9px'});
		}*/

		var subtractFromHeight = 30;
		if (this._hideNumbersAndText === true) {
			subtractFromHeight = 0;
		}

		this._storeWidth = Math.round((height - useHeight - subtractFromHeight) * this._ratio);
		this.element.style.paddingLeft = this._storeWidth + 'px';
		this.element.style.width = this.element.style.paddingLeft;
	};

	public kill = () => {
		if (this._active) {
			this.element.removeEventListener('click', this.clickGallery);
		}

		gsap.killTweensOf(this.stepForward);
		//	this._observer.disconnect();
	};

	public pause = () => {
		this._paused = true;
		gsap.killTweensOf(this.stepForward);
	};

	public resume = () => {
		this._paused = false;

		gsap.killTweensOf(this.stepForward);
		/*	console.log('resume');
		console.log('this._looping : ' + this._looping);
		console.log('this._galleryAutoPlay : ' + this._galleryAutoPlay);*/
		if (this._looping && this._galleryAutoPlay === true) {
			//gsap.delayedCall(DELAY, this.stepForward);
			this.startAutoPlay();
		}
	};
}
