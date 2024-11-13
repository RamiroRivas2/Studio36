import { gsap } from 'gsap';
import { Globals } from '../../data/Globals';

export class GlobalCursor {
	private _cursorElement: HTMLDivElement;

	private _cursorArrowRight: HTMLDivElement;
	private _cursorArrowLeft: HTMLDivElement;
	private _cursorArrowRightSmall: HTMLDivElement;
	private _cursorArrowLeftSmall: HTMLDivElement;
	private _cursorSide: HTMLDivElement;
	private _cursorUpDown: HTMLDivElement;
	private _cursorPause: HTMLDivElement;
	private _cursorPlay: HTMLDivElement;
	private _cursorCloseX: HTMLDivElement;
	private _cursorUp: HTMLDivElement;

	private _currentCursorType: string = 'none';

	private _isDragging: boolean = false;
	private _isHoveringItem: boolean = false;

	private _mobileOS: string = 'unknown';

	constructor(element: HTMLDivElement) {
		this._cursorElement = element;
		this._cursorArrowRight = element.querySelector('.arrow_right_white');
		this._cursorArrowLeft = element.querySelector('.arrow_left_white');
		this._cursorArrowRightSmall = element.querySelector('.arrow_right_small');
		this._cursorArrowLeftSmall = element.querySelector('.arrow_left_small');
		this._cursorPause = element.querySelector('.pause');
		this._cursorPlay = element.querySelector('.play');

		function getMobileOperatingSystem() {
			// @ts-ignore
			var userAgent = navigator.userAgent || navigator.vendor || window.opera;

			// Windows Phone must come first because its UA also contains "Android"
			if (/windows phone/i.test(userAgent)) {
				return 'Windows Phone';
			}

			if (/android/i.test(userAgent)) {
				return 'Android';
			}

			// iOS detection from: http://stackoverflow.com/a/9039885/177710
			if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
				return 'iOS';
			}

			return 'unknown';
		}

		var allowContinue = true;
		this._mobileOS = getMobileOperatingSystem();

		gsap.set([this._cursorArrowRight, this._cursorArrowLeft], { transformOrigin: '50% 50%' });

		/*	this._cursorArrowRightSmall = element.querySelector('.arrow_right_small');
			this._cursorArrowLeftSmall = element.querySelector('.arrow_left_small');
			this._cursorPause = element.querySelector('.pause');
			this._cursorPlay = element.querySelector('.play');
			this._cursorUpDown = element.querySelector('.up_down');
			this._cursorSide = element.querySelector('.side');
			this._cursorCloseX = element.querySelector('.close_x');
			this._cursorUp = element.querySelector('.up');*/
		if (this._mobileOS === 'unknown') {
			window.addEventListener('mousemove', (event: MouseEvent) => this.mouseMoveHandler(event));
			window.addEventListener('mousedown', (event: MouseEvent) => this.mouseClickHandler(event));
			window.addEventListener('mouseup', (event: MouseEvent) => this.mouseClickHandler(event));
			window.addEventListener('click', (event: MouseEvent) => this.mouseClickHandler(event));
		} else {
			this._cursorElement.style.display = 'none';
		}

		this.showCursorType('up');
	}

	private mouseMoveHandler(event: MouseEvent): void {
		var getX = event.clientX;
		var getY = event.clientY;

		gsap.set(this._cursorElement, { x: getX, y: getY });
		//this._cursorElement.style.left = event.clientX + 'px';
		//this._cursorElement.style.top = event.clientY + 'px';

		//document.body.style.cursor = 'pointer';

		if (Globals.CASE_OPEN_IS) {
			if (this._currentCursorType !== 'none') {
				Globals.CASE_OPEN_IS.getElement().style.cursor = 'none';
			} else {
				Globals.CASE_OPEN_IS.getElement().style.cursor = 'grab';
			}
		}
	}

	private mouseClickHandler = (event: MouseEvent): void => {
		if (Globals.CASE_OPEN_IS) {
			if (this._currentCursorType !== 'none') {
				Globals.CASE_OPEN_IS.getElement().style.cursor = 'none';
			} else {
				Globals.CASE_OPEN_IS.getElement().style.cursor = 'grab';
			}
		}
	};

	public showCursorType(type: string): void {
		//console.log('showCursorType : ' + type);

		if (type === 'side' || type === 'up' || type === 'up_down' || type === 'close_x') {
			type = 'none';
		}

		if (this._currentCursorType !== type) {
			this._cursorPause.style.display = 'none';
			this._cursorPlay.style.display = 'none';
			this._cursorArrowLeft.style.display = 'none';
			this._cursorArrowRight.style.display = 'none';
			this._cursorArrowLeftSmall.style.display = 'none';
			this._cursorArrowRightSmall.style.display = 'none';

			this._currentCursorType = type;

			if (type === 'arrow_right') {
				this._cursorArrowRight.style.display = 'block';
			} else if (type === 'arrow_left') {
				this._cursorArrowLeft.style.display = 'block';
			}
			if (type === 'arrow_right_small') {
				this._cursorArrowRightSmall.style.display = 'block';
			} else if (type === 'arrow_left_small') {
				this._cursorArrowLeftSmall.style.display = 'block';
			} else if (type === 'close_x') {
			} else if (type === 'side') {
			} else if (type === 'pause') {
				this._cursorPause.style.display = 'block';
			} else if (type === 'play') {
				this._cursorPlay.style.display = 'block';
			} else if (type === 'up_down') {
			} else if (type === 'up' || type === 'none') {
			}
		}
	}

	set isDragging(value: boolean) {
		this._isDragging = value;
	}

	get isDragging(): boolean {
		return this._isDragging;
	}

	set isHoveringItem(value: boolean) {
		this._isHoveringItem = value;
	}

	get isHoveringItem(): boolean {
		return this._isHoveringItem;
	}
}
