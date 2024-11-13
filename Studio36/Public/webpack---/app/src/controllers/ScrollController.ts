import { Signal } from '../../lib/com/hellomonday/signals/Signal';

export class ScrollController {
	private _updateSignal: Signal = new Signal();
	private _disableScroll: boolean = false;

	constructor() {
		window.addEventListener('scroll', this.onScroll);
	}

	private onScroll = e => {
		/*	console.log(e)
		console.log('this._disableScroll : ' + this._disableScroll)*/
		/*if (this._disableScroll === true) {
			e.preventDefault();
		}
		else {*/
		this._updateSignal.dispatch(e);
		//}
	};

	get onUpdate() {
		return this._updateSignal;
	}

	public disableScroll = () => {
		this._disableScroll = true;
	};

	public enabledScroll = () => {
		this._disableScroll = false;
	};
}
