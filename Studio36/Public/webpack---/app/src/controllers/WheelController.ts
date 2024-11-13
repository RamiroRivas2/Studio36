import * as NormalizeWheel from '../../lib/com/akella/normalize-wheel';
import { Signal } from '../../lib/com/hellomonday/signals/Signal';
import { Globals } from '../data/Globals';

export class ViewPort {
	public top: number;
	public bottom: number;
	public width: number;
	public height: number;
}

export class WheelController {
	public onScroll: Signal = new Signal();

	public onDragUpdate: Signal = new Signal();

	private _active: boolean = true;
	private _eventType;

	private _touchPressed: boolean = false;
	private _touchStartY: number = 0;

	private _mouseDrag: boolean = false;

	private _dragStarted: boolean = false;
	private _dragActive: boolean = true;
	private _dragged: boolean = false;

	private _dragLength: number = 0;
	private _initialDragPosition: number = 0;

	private _timeSinceDragStarted: number = 0;
	private _timeStarted: number = 0;

	private _drag = { value: 0 };

	private _previousDelta: number;

	constructor() {
		//if (Globals.IS_TOUCH_DEVICE) {
		//var getTemplate = document.body.querySelector('.DefaultTemplate')
		window.addEventListener('touchstart', this.tap, { passive: false });
		window.addEventListener('touchmove', this.drag, { passive: false });
		window.addEventListener('touchend', this.release, { passive: false });
		//	} else {
		this._mouseDrag = true;
		window.addEventListener('mousedown', this.tap);
		window.addEventListener('mousemove', this.drag);
		window.addEventListener('mouseup', this.release);

		if (Globals.IS_FIREFOX) {
			this._eventType = NormalizeWheel.getEventType();
			window.addEventListener(this._eventType, this.onWheel, { passive: false });
		} else {
			window.addEventListener('wheel', this.onWheel, { passive: false });
		}
		//	}
	}

	private tap = e => {
		//console.log('this._dragActive : ' + this._dragActive);
		if (this._dragActive === false) {
			return;
		}

		// if (Globals.IS_TOUCH_DEVICE) {
		// 	e.stopPropagation();
		// 	e.preventDefault();
		// }
		this._touchStartY = this.ypos(e);

		var isMouseWithinLimits = false;
		if (this._touchStartY < 120 || this._touchStartY > window.innerHeight - 120) {
			isMouseWithinLimits = true;
		}

		if (Globals.CASE_OPEN === false || (Globals.CASE_OPEN === true && isMouseWithinLimits === true)) {
			this._timeSinceDragStarted = 0;
			this._timeStarted = new Date().getTime();

			this._touchPressed = true;
			this._initialDragPosition = this._touchStartY;
		}
	};

	private drag = e => {
		if (!this._dragActive) {
			return;
		}

		// if (Globals.IS_TOUCH_DEVICE) {
		// 	e.stopPropagation();
		// 	e.preventDefault();
		// }

		let y;
		let delta;

		if (this._touchPressed) {
			y = this.ypos(e);
			delta = this._touchStartY - y;

			this._previousDelta = delta;

			if (delta > 10 || delta < -10) {
				if (!this._dragStarted) {
					Globals.GLOBAL_CURSOR.showCursorType('up_down');
					//	Globals.MAIN_DRAGABLE.disable();
					//	Globals.MAIN_DRAGABLE.dragEnd();
					//	Globals.MAIN_DRAGABLE.enable();
					//Globals.MAIN_DRAGABLE.endDrag();
					Globals.IS_DRAGGING = true;
					Globals.DRAG_IS_OVER_DELTA = true;

					this._dragStarted = true;
					this._dragged = true;
					this.onDragUpdate.dispatch('dragStart');
				}

				this._touchStartY = y;

				//this.onScroll.dispatch(this._mouseDrag ? delta * 5 : delta * 5);
				this.onScroll.dispatch(this._mouseDrag ? delta * 7.5 : delta * 7.5);
			}
		}
	};

	private release = e => {
		this._touchPressed = false;
		/*	console.log('******************')
		var dragTime = new Date().getTime() - this._timeStarted;
		console.log('dragTime : ' + dragTime);
		var dragDistance = this._initialDragPosition - this._touchStartY;
		console.log('dragDistance : ' + dragDistance);

		console.log('this._previousDelta : ' + this._previousDelta)
		this._drag.value = this._previousDelta;
		//gsap.to(this._drag, {value: 0, ease: 'power2.out', duration: 0.7, onUpdate: this.dispatchOnThrow});*/
		//Globals.DRAG_IS_OVER_DELTA = false;

		Globals.IS_DRAGGING = false;

		if (this._dragStarted) {
			this._dragStarted = false;
			this.onDragUpdate.dispatch('dragEnd');
			//	console.log('wheel controller dispatch drag end');
			Globals.GLOBAL_CURSOR.showCursorType('up');
		}
	};

	private dispatchOnThrow = () => {
		console.log('dispatch');

		this.onScroll.dispatch(this._drag.value * 5, true);
	};

	private ypos = e => {
		if (e.targetTouches && e.targetTouches.length >= 1) {
			return e.targetTouches[0].clientY;
		}

		return e.clientY;
	};

	private onWheel = (e: WheelEvent) => {
		if (!this._active) {
			return;
		}

		e.stopImmediatePropagation();
		e.stopPropagation();
		e.preventDefault();

		let evt = { deltaY: 0, deltaX: 0 };

		if (Globals.IS_FIREFOX) {
			let normalized = NormalizeWheel(e);
			//@ts-ignore
			evt.deltaY = normalized.pixelY * 2 * -1;
			evt.deltaX = normalized.pixelX * 2 * -1;
		} else {
			//@ts-ignore
			evt.deltaY = (e.wheelDeltaY || e.deltaY * -1) * 0.5;
			//@ts-ignore
			evt.deltaX = (e.wheelDeltaX || e.deltaX * -1) * 0.5;
		}
		//console.log('dispath');
		this.onScroll.dispatch(evt.deltaY * -1, false, evt.deltaX);
	};

	public kill = () => {
		if (Globals.IS_TOUCH_DEVICE) {
			window.removeEventListener('touchstart', this.tap);
			window.removeEventListener('touchmove', this.drag);
			window.removeEventListener('touchend', this.release);
		} else {
			this._mouseDrag = true;
			window.removeEventListener('mousedown', this.tap);
			window.removeEventListener('mousemove', this.drag);
			window.removeEventListener('mouseup', this.release);

			if (Globals.IS_FIREFOX) {
				this._eventType = NormalizeWheel.getEventType();
				window.removeEventListener(this._eventType, this.onWheel);
			} else {
				window.removeEventListener('wheel', this.onWheel);
			}
		}
	};

	get dragActive() {
		return this._dragActive;
	}

	set dragActive(state: boolean) {
		if (state === this._dragActive) {
			return;
		}

		//console.log('WheelController active: ' + state);
		this._dragActive = state;
	}

	get dragged() {
		let dragged = this._dragged;
		this._dragged = false;

		return dragged;
	}

	public isDragging = () => {
		return this._dragStarted;
	};
}
