import { AbstractTemplate } from '../../templates/AbstractTemplate';
import { AbstractModule } from '../../../lib/com/hellomonday/templateManager/AbstractModule';
import { WindowManager } from '../../utils/WindowManager';
import { gsap } from 'gsap';
import * as Draggable from 'gsap/Draggable';
import { clamp, degreesToRadians } from '../../../lib/com/hellomonday/utils/MathUtils';
import { Globals } from '../../data/Globals';

export class ImageSlider extends AbstractModule {
	private _containers: NodeListOf<HTMLDivElement>;
	private _contentContainer: HTMLDivElement;
	private _captions: NodeListOf<HTMLDivElement>;
	private _captionContent: Array<HTMLParagraphElement> = [];
	private _maxCaptionHeight: number = 0;
	private _draggable;
	private _titles: NodeListOf<HTMLDivElement>;
	private _plus: NodeListOf<HTMLDivElement>;

	private _filters: string;

	constructor(element: HTMLElement, template: AbstractTemplate) {
		super(element, template);

		this._contentContainer = this.element.querySelector('.innerContainer');
		this._containers = this.element.querySelectorAll('.imageContainer');

		this._captions = this.element.querySelectorAll('.caption');
		this._titles = this.element.querySelectorAll('.title');
		this._plus = this.element.querySelectorAll('.plus');

		let m = this._containers.length;

		for (let p = 0; p < m; p++) {
			var currentContainer = this._containers[p];
			if (currentContainer.dataset.filters != '') {
				var getImage = currentContainer.querySelector('img');
				getImage.style.pointerEvents = 'all';
				getImage.style.cursor = 'pointer';
				getImage.addEventListener('click', this.clickImage);
			}
		}

		let l = this._titles.length;

		for (let i = 0; i < l; i++) {
			if (this._titles[i].dataset.active === 'true') {
				this._titles[i].style.cursor = 'pointer';
				// @ts-ignore
				this._titles[i]._open = false;
				// @ts-ignore
				this._titles[i]._id = i;
				this._titles[i].addEventListener('click', this.toggleCaption);
			}
		}

		this._draggable = Draggable.Draggable.create(this._contentContainer, {
			type: 'x',
			lockAxis: true,
			minimumMovement: 3,
			force3D: true,
			bounds: { minX: -10000, maxX: 0, minY: 0, maxY: 0 },
			throwProps: true,
			edgeResistance: 0.5,
			dragResistance: 0,
			overshootTolerance: 0.1,
			maxDuration: 0.5
		});

		this.initCaptions();
	}

	private clickImage = event => {
		var target = event.currentTarget.parentNode;
		//window.location.search = 'filter=' + target.dataset.filters;

		if (target.dataset.filters.indexOf('https://') > -1) {
			// External link
			window.open(target.dataset.filters, '_blank');
		} else {
			var getResults = target.dataset.filters.split(',');
			Globals.INITIAL_SEARCH_VALUE = getResults[0];
			if (getResults.length > 1) {
				Globals.INITIAL_SEARCH_VALUE_SECONDARY = getResults[1];
			}

			Globals.TEMPLATE_MANAGER.path('');
		}

		//window.location.href = window.location.origin +'/?filter=' + target.dataset.filters;
	};

	private toggleCaption = e => {
		e.currentTarget._open = !e.currentTarget._open;
		let open = e.currentTarget._open;
		let id = e.currentTarget._id;

		if (open === true) {
			this._captions[id].querySelector('p').style.display = 'block';
		} else {
			this._captions[id].querySelector('p').style.display = 'none';
		}

		gsap.to(this._plus[id], { rotation: open ? 45 : 0, duration: 0.3, transformOrigin: '50% 50%', ease: 'power2.out' });
		gsap.to(this._captions[id], { height: open ? '100%' : '0%', duration: 0.3, opacity: open ? 1 : 0, ease: 'power2.out' });

		this.resizeCaptions();
		// this.resize();
	};

	private initCaptions = () => {
		let l = this._captions.length;

		for (let i = 0; i < l; i++) {
			this._captionContent.push(this._captions[i].querySelector('.content'));
		}
	};

	private resizeCaptions = () => {
		let l = this._captionContent.length;
		let max = 0;

		for (let i = 0; i < l; i++) {
			let h = this._captionContent[i].getBoundingClientRect().height;

			if (h > max) {
				max = h;
			}
		}

		this._maxCaptionHeight = max;
		this.element.style.marginBottom = 90 + max + 'px';
	};

	resize() {
		super.resize();

		let scale = WindowManager.width / 1440;
		let width = clamp(506 * scale, 307, 506);
		let height;
		let l = this._containers.length;

		for (let i = 0; i < l; i++) {
			height = width * parseFloat(this._containers[i].dataset.ratio);
			gsap.set(this._containers[i], { width: width, height: height });
		}

		// l++;
		let bounds = this._contentContainer.getBoundingClientRect() as DOMRect;
		let diff = width * l + 20 * (l - 1) - bounds.width + bounds.x;

		this._draggable[0].applyBounds({ minX: -diff, maxX: 0, minY: 0, maxY: 0 });

		this.resizeCaptions();
	}

	kill() {
		super.kill();

		this._draggable[0].kill();

		let l = this._titles.length;

		for (let i = 0; i < l; i++) {
			if (this._titles[i].dataset.active === 'true') {
				this._titles[i].removeEventListener('click', this.toggleCaption);
			}
		}
	}
}
