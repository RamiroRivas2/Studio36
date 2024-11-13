import {gsap} from 'gsap';
import {parseNumber} from "@tweakpane/core";

export class NewsArticle {

	private _element: HTMLDivElement;
	private _open: boolean = false;
	private _openPercent = {value: 0};
	private _content: HTMLDivElement;
	private _inner: HTMLDivElement;
	private _innerHeight;
	private _image;
	private _col2;

	private _mainText;
	private _headline;

	private _readMore;

	private _readMoreLabel: HTMLSpanElement;
	private _readMorePlus: HTMLSpanElement;

	private _active: boolean = true;

	private _externalLink: string;

	constructor(element: HTMLDivElement) {

		this._element = element;
		this._content = element.querySelector('.content');
		this._image = element.querySelector('img');
		this._headline = element.querySelector('.headline')
		this._mainText = element.querySelector('.mainText');
		this._col2 = element.querySelector('.col2')


		this._externalLink = this._element.dataset.externallink;


		//if (this._content) {
		this._inner = element.querySelector('.inner');
		this._readMore = this._element.querySelector('.readmore');

		this._readMoreLabel = this._element.querySelector('.readmore .label');
		this._readMorePlus = this._element.querySelector('.readmore .plus');
		//this._readMoreLabel.style.display = 'none';
		//this._readMorePlus.style.display = 'none';
//console.log('this._externalLink : ' + this._externalLink)
		// Auto open
		/*if (this._content) {
			this._readMoreLabel.style.display = 'none';
			this._readMorePlus.style.display = 'none';
			this.toggle(this._open, true);
		}*/
		//}
		this._element.addEventListener('click', this.onClick);
	}

	private onClick = () => {
	//	console.log('onclick')

		if (this._externalLink) {
			window.open(this._externalLink, '_blank');
		} else {
			this._col2.style.maxHeight = 'initial';
			this._readMore.style.display = 'none';
		}

		//if (this._mainText) {
		//this.toggle(!this._open);


		/*} else {

		}*/
	}

	public toggle = (state: boolean, fast?: boolean) => {
		this._open = state;
		var duration = 1;
		if (fast === true) {
			duration = 0;
		}

		gsap.to(this._openPercent, {value: this._open ? 1 : 0, onUpdate: this.update, duration: duration});

		this._readMoreLabel.innerText = this._open ? 'CLOSE FULL ARTICLE' : 'READ MORE';

		gsap.to(this._readMorePlus, {rotation: this._open ? 45 : 0, duration: 0.3});
	}

	private update = () => {
		gsap.set(this._content, {height: this._openPercent.value * this._innerHeight, opacity: this._openPercent.value});
	}

	public resize = () => {
		var getHeaderHeight = this._headline.offsetHeight;
	//	console.log('getHeaderHeight : ' + getHeaderHeight)

		var getTotalYGetContentHeight = this._mainText.offsetHeight;
		var imageHeight = this._image.offsetHeight;

	//	console.log('getTotalYGetContentHeight : ' + getTotalYGetContentHeight)
	//	console.log('imageHeight : ' + imageHeight)





		if (this._externalLink) {
			// If the External link is defined - we always show the read more button

		} else {
			if (getTotalYGetContentHeight + this._mainText.offsetTop > imageHeight) {
				this._readMore.style.visibility = 'visible';
				this._col2.style.maxHeight = getHeaderHeight + 160 + 'px';
			} else {
				this._readMore.style.visibility = 'hidden';
			}
		}


		if (this._content) {
			this._innerHeight = Math.round(this._inner.getBoundingClientRect().height);
			this.update();
		}
	}

	public kill = () => {
		this._element.removeEventListener('click', this.onClick);
	}

	get element() {
		return this._element;
	}

	get date() {
		let date = this._element.querySelector('.date').innerHTML;
		let temp = date.split(".");
		return new Date(parseNumber(temp[2]), parseNumber(temp[1]) - 1, parseNumber(temp[0])).valueOf();
	}

	get active() {
		return this._active;
	}

	set active(value: boolean) {
		this._active = value;
	}


}
