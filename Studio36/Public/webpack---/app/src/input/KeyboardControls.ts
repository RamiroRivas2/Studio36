import {Signal} from "../../lib/com/hellomonday/signals/Signal";
import {gsap} from "gsap";

export class KeyboardControls extends Signal {

	public static KEY_UP: string = 'KEY_UP';
	public static KEY_DOWN: string = 'KEY_DOWN';

	private static instance: KeyboardControls;

	private _enabledButtons: Array<string> = ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft', 'Enter', 'Space', ''];

	private _disabled: boolean = false;

	constructor() {
		super();
	}

	public enable = () => {
		document.addEventListener('keydown', this.keyDown, false);
		document.addEventListener('keyup', this.keyUp, false);
	}

	private keyDown = (e) => {
		if (this._disabled) {
			return;
		}

		let l = this._enabledButtons.length;

		for (let i = 0; i < l; i++) {
			if (e.key === this._enabledButtons[i] || e.keyCode === 32) {
				e.preventDefault();
				break;
			}
		}

		this.dispatch(KeyboardControls.KEY_DOWN, e.key, e.keyCode);
	}

	private keyUp = (e) => {
		if (this._disabled) {
			return;
		}

		let l = this._enabledButtons.length;

		for (let i = 0; i < l; i++) {
			if (e.key === this._enabledButtons[i] || e.keyCode === 32) {
				e.preventDefault();
				break;
			}
		}

		this.dispatch(KeyboardControls.KEY_UP, e.key, e.keyCode);
	}

	public static getInstance(): KeyboardControls {
		if (!KeyboardControls.instance) {
			KeyboardControls.instance = new KeyboardControls();
		}

		return KeyboardControls.instance;
	}

	get disabled() {
		return this._disabled;
	}

	set disabled(value: boolean) {
		this._disabled = value;
	}
}
