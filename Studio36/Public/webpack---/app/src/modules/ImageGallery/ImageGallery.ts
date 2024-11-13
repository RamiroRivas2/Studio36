import { AbstractTemplate } from '../../templates/AbstractTemplate';
import { AbstractModule } from '../../../lib/com/hellomonday/templateManager/AbstractModule';
import { WindowManager } from '../../utils/WindowManager';
import { gsap } from 'gsap';
import * as Draggable from 'gsap/Draggable';
import { clamp, degreesToRadians } from '../../../lib/com/hellomonday/utils/MathUtils';

export class ImageGallery extends AbstractModule {
	private _imageContainer: HTMLDivElement;

	private _images: NodeListOf<HTMLDivElement>;
	private _content: HTMLDivElement;
	private _imageCount: number;
	private _draggable;
	private _containerWidth: number;
	private _captions: NodeListOf<HTMLDivElement>;
	private _count: HTMLDivElement;

	private _showingImageX = 0;
	private _timePerImage = 1;

	constructor(element: HTMLElement, template: AbstractTemplate) {
		super(element, template);

		this._imageContainer = element.querySelector('.images');
		this._content = element.querySelector('.content');

		this._captions = element.querySelectorAll('.caption');

		this._images = element.querySelectorAll('.imgContainer');
		this._imageCount = this._images.length;

		this._count = element.querySelector('.count');

		if (this._imageCount > 1) {
			this._draggable = Draggable.Draggable.create(this._content, {
				type: 'x',
				lockAxis: true,
				minimumMovement: 3,
				// snap: this.snap,
				force3D: true,
				// onDrag: this.draggableUpdate,
				// onThrowUpdate: this.draggableUpdate,
				onThrowComplete: this.dragEnd,
				// onDragStart: this.dragStart,
				// onDragEnd: this.dragEnd,
				// onThrowComplete: this.throwComplete,
				bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
				throwProps: true,
				edgeResistance: 0.5,
				dragResistance: 0, //System.IS_TOUCH_DEVICE ? 0 : 0.4,
				overshootTolerance: 0.1,
				maxDuration: 0.5
			});
		} else {
			this._count.style.display = 'none';
		}
	}

	private dragEnd = () => {
		let x = 0;

		if (this._draggable && this._draggable[0]) {
			x = Math.round(Math.abs(clamp(this._draggable[0].x, -Infinity, 0)));
		}

		let snapId = Math.round(x / this._containerWidth);

		gsap.to(this._content, { x: -((this._containerWidth + 20) * snapId), duration: 0.3, ease: 'power2.inOut' });

		let l = this._captions.length;

		for (let i = 0; i < l; i++) {
			gsap.to(this._captions[i], { opacity: snapId === i ? 1 : 0, duration: 0.3, delay: snapId === i ? 0.2 : 0 });
		}

		let id = snapId + 1;
		let current = id + '';
		if (id < 10) {
			current = '0' + id;
		}

		let total = this._imageCount + '';
		if (this._imageCount < 10) {
			total = '0' + total;
		}

		this._count.innerText = current + ' — ' + total;
	};

	resize() {
		super.resize();

		let bounds = this._imageContainer.getBoundingClientRect();

		let l = this._images.length;

		for (let i = 0; i < l; i++) {
			gsap.set(this._images[i], { x: (bounds.width + 20) * i });
		}
		if (this._draggable && this._draggable[0]) {
			this._draggable[0].applyBounds({ minX: -((bounds.width + 20) * (l - 1)), maxX: 0, minY: 0, maxY: 0 });
		}
		this._containerWidth = Math.round(bounds.width);

		this.dragEnd();
	}

	kill() {
		super.kill();
		if (this._draggable && this._draggable[0]) {
			this._draggable[0].kill();
		}
	}
}
