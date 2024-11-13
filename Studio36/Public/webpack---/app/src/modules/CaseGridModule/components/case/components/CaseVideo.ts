import { AbstractCaseBlock } from './AbstractCaseBlock';
import { gsap } from 'gsap';
import { CaseEntry } from '../CaseEntry';
import { Globals } from '../../../../../data/Globals';

export class CaseVideo extends AbstractCaseBlock {
	// private _ratio: number;

	private _video: HTMLVideoElement;
	private _hasBeenInView: boolean = false;

	private _currentTimeDisplay: HTMLSpanElement;
	private _totalTimeDisplay: HTMLSpanElement;

	private _highlight: HTMLDivElement;

	private _controls: boolean = false;

	private _progressBar: HTMLDivElement;
	private _seekPercent: number = 0;

	private _paused: boolean = true;
	private _videoPaused: boolean = true;

	private _ratio: number = 2;

	private _belongsToCaseEntry: CaseEntry;

	private _soundOn: boolean = false;
	private _soundButtonElement;
	private _soundOnImage;
	private _soundOffImage;

	private _isInView: boolean = false;
	private _storeHeight: number = 0;

	private _videoSizeHasBeenSet: boolean = false;

	constructor(element: HTMLDivElement, type: string, belongsToCaseEntry: CaseEntry) {
		super(element, type);

		this._belongsToCaseEntry = belongsToCaseEntry;
		this._controls = false; //element.dataset.controls === 'true';

		this._soundButtonElement = document.createElement('div');

		this._soundOffImage = new Image();
		this._soundOffImage.src = '/assets/images/video/sound_off@2.png';
		this._soundOffImage.width = 43;
		this._soundOffImage.height = 27;
		this._soundOffImage.style.width = 43 + 'px';
		this._soundOffImage.style.height = 27 + 'px';
		this._soundOffImage.style.opacity = 1;
		this._soundButtonElement.appendChild(this._soundOffImage);

		this._soundOnImage = new Image();
		this._soundOnImage.src = '/assets/images/video/sound_on@2.png';
		this._soundOnImage.width = 43;
		this._soundOnImage.height = 27;
		this._soundOnImage.style.width = 43 + 'px';
		this._soundOnImage.style.height = 27 + 'px';
		this._soundOnImage.style.opacity = 0;
		this._soundButtonElement.appendChild(this._soundOnImage);

		this._soundButtonElement.style.position = 'absolute';
		this._soundButtonElement.style.top = 20 + 'px';
		this._soundButtonElement.style.right = 20 + 'px';
		this._soundButtonElement.style.width = 43 + 'px';
		this._soundButtonElement.style.height = 27 + 'px';
		element.appendChild(this._soundButtonElement);
		this._soundButtonElement.style.cursor = 'pointer';

		this._soundButtonElement.addEventListener('click', this.toggleSound);

		this._video = element.querySelector('video');
		this._video.addEventListener('loadedmetadata', this.metaDataLoaded);
		//this._video.addEventListener('play', this.metaDataLoaded);

		this._video.addEventListener('click', this.togglePlayPause);
		this._video.addEventListener('mousemove', this.mouseMove);
		this._video.addEventListener('mouseleave', this.mouseLeave);

		var getSource = this._video.querySelector('source');
		getSource.src = getSource.dataset.src;

		/*	if (element.dataset.controls === 'true') {
			this._currentTimeDisplay = element.querySelector('.current');
			this._totalTimeDisplay = element.querySelector('.total');
			this._highlight = element.querySelector('.highlight');
			this._progressBar = element.querySelector('.progressBar');

			this._progressBar.addEventListener('click', this.seek);

			this._player.on('timeupdate', this.timeUpdate);
			this._player.on('seeked', this.seeked);
			this._player.on('ended', this.videoEnded);
		}*/

		//setInterval(this.getSize, 1000)
	}

	private mouseLeave = e => {
		Globals.GLOBAL_CURSOR.isHoveringItem = false;
	};

	private mouseMove = e => {
		if (this._paused === false && Globals.GLOBAL_CURSOR.isDragging === false) {
			Globals.GLOBAL_CURSOR.isHoveringItem = true;
			//console.log('this._videoPaused : ' + this._videoPaused);
			if (this._videoPaused === true) {
				Globals.GLOBAL_CURSOR.showCursorType('play');
			} else {
				Globals.GLOBAL_CURSOR.showCursorType('pause');
			}
		}
	};

	private togglePlayPause = event => {
		if (this._paused === false) {
			//console.log('togglePlayPause: ' + this._videoPaused);
			if (this._videoPaused === true) {
				this._video.play();
				Globals.GLOBAL_CURSOR.showCursorType('pause');
				this._videoPaused = false;
			} else {
				this._video.pause();
				Globals.GLOBAL_CURSOR.showCursorType('play');
				this._videoPaused = true;
			}

			//	event.stopPropagation();
		}
	};

	private toggleSound = event => {
		if (this._paused === false) {
			if (this._soundOn === true) {
				this.turnOffSound();
			} else {
				this.turnOnSound();
			}

			//event.stopPropagation();
		}
	};

	private turnOffSound = () => {
		this._soundOn = false;
		this._video.muted = true;
		this._soundOnImage.style.opacity = 0;
	};

	private turnOnSound = () => {
		this._soundOn = true;
		this._video.muted = false;
		this._soundOnImage.style.opacity = 1;
	};

	private metaDataLoaded = event => {
		/*console.log(event);
		console.log(this._video.videoWidth);
		console.log(this._video.videoHeight);*/

		var ratio = this._video.videoWidth / this._video.videoHeight;
		/*	console.log('ratio : ' + ratio);
		console.log('this._video.videoWidth : ' + this._video.videoWidth);
		console.log('this._video.videoHeight : ' + this._video.videoHeight);*/

		this._ratio = ratio;

		/*	if (isNaN(this._ratio)) {
			var ratio = this._video.videoWidth / this._video.videoHeight;
			//		console.log('NEW ratio : ' + ratio);
			this._ratio = ratio;
		}*/

		if (this._ratio !== 0 && isNaN(this._ratio) === false) {
			this.resize(this._storeHeight);
			this._belongsToCaseEntry.videoLoadedResize();
		}

		//alert(event);
		//if (isNaN(this._ratio) && this._videoSizeHasBeenSet === false) {
		//	this._videoSizeHasBeenSet = true;

		//}
	};

	private getSize = () => {
		//@ts-ignore
		//console.log('this._player.width : ' + this._player.videoWidth());
		//@ts-ignore
		//console.log('this._player.height : ' + this._player.videoHeight());
	};

	/*	private timeUpdate = e => {
		console.log(this._player.width);
		let currentTime = Math.round(this._player.currentTime());
		let duration = Math.round(this._player.duration());

		let min = Math.floor(currentTime / 60);
		let sec = currentTime - min * 60;

		this._currentTimeDisplay.innerText = (min < 10 ? '0' + min : min + '') + ':' + (sec < 10 ? '0' + sec : sec + '');

		min = Math.floor(duration / 60);
		sec = duration - min * 60;
		this._totalTimeDisplay.innerText = (min < 10 ? '0' + min : min + '') + ':' + (sec < 10 ? '0' + sec : sec + '');

		gsap.to(this._highlight, { width: (currentTime / duration) * 100 + '%', duration: 1 });
	};*/

	/*private seeked = e => {
		// let currentTime = this._player.currentTime();
		// let duration = this._player.duration();
		//
		// if (!isNaN(currentTime) && !isNaN(duration)) {
		// 	this._scrubber.percent = currentTime / duration;
		// }
		//
		// this._scrubber.triggerSnap();
	};*/

	/*private videoEnded = data => {
		this._highlight.style.width = '0';

		// this._scrubber.toggle(false);
		// this.pauseVideo();
		//
		// this.togglePlayButton(true);
		//
		// TweenMax.to(this._posterImage, 0.5, { opacity: 1 });
	};*/

	// @ts-ignore
	public resize = (height: number): void => {
		this._storeHeight = height;
		this.element.style.paddingLeft = Math.round(height * this._ratio) + 'px'; // (height * this._ratio)
		this.element.style.width = this.element.style.paddingLeft;
	};

	public isInView = (height, state) => {
		if (this._hasBeenInView === false) {
			// First time it gets into view

			this._hasBeenInView = false;
		}
		this._isInView = true;
		//this._video.currentTime = 0;
		if (state === 'LOCKED') {
			this.resume();
		}
	};

	public outOfView = () => {
		this._isInView = false;
		//	console.log('outofview');
		//	this._player.currentTime(0);
		this.pause();
		this.turnOffSound();
	};

	public pause = () => {
		//console.log('pause');

		if (this._paused === false) {
			this._paused = true;

			this._video.play().then(() => {
				this._video.pause();
			});
		}
	};

	public resume = () => {
		if (this._isInView === true) {
			this._paused = false;

			if (this._videoPaused === true) {
				this._videoPaused = false;
				if (!this._controls) {
					this._video
						.play()
						.then(() => {})
						.catch(error => {});
				}
			}
		}
	};
}
