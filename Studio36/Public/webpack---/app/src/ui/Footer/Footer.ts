import { gsap } from 'gsap';
import { Globals } from '../../data/Globals';
import { WindowManager } from '../../utils/WindowManager';
import { FooterItem } from './FooterItem';

export class Footer {
	private _element: HTMLDivElement;
	private _backToTopButton: HTMLDivElement;

	private _container: HTMLDivElement;
	private _containerW: number;

	private _totalHeight: number;

	private _items: Array<FooterItem> = [];
	private _content: NodeListOf<HTMLDivElement>;

	private _activeButton: number = 999;

	private _mobile: boolean = false;

	private _observer: IntersectionObserver;

	constructor(element: HTMLDivElement) {
		this._element = element;

		this._container = element.querySelector('.items');

		this._backToTopButton = element.querySelector('.backToTop');
		this._backToTopButton.addEventListener('click', this.backToTop);

		let itemData = element.querySelectorAll('.items .item');
		this._content = element.querySelectorAll('.items .content');

		let l = itemData.length;

		for (let i = 0; i < l; i++) {
			let item = new FooterItem(itemData[i] as HTMLDivElement, this);
			this._items.push(item);
		}

		//this._observer = new IntersectionObserver(this.onObserved);
		//this._observer.observe(element);
	}

	private onObserved = e => {
		//this.updateButtons(e[0].isIntersecting ? 1 : 999);
	};

	public updateButtons = (id: number) => {
		if (id !== this._activeButton) {
			this._activeButton = id;

			let l = this._items.length;

			for (let i = 0; i < l; i++) {
				if (i === id) {
					this._items[i].expand();
				} else {
					this._items[i].collapse();
				}
			}
		}
	};

	private backToTop = () => {
		if (Globals.CASE_CONTROLLER) {
			Globals.CASE_CONTROLLER.setSnapId(0);
			Globals.CASE_CONTROLLER.snap(0, 2);
		} else {
			gsap.to(window, {
				scrollTo: { y: 0, autoKill: true },
				overwrite: true,
				duration: 2,
				ease: 'power2.inOut'
			});
		}
	};

	public resize = () => {
		this._mobile = WindowManager.width < 1024;

		this._containerW = Math.round(this._container.getBoundingClientRect().width);

		let l = this._items.length;

		for (let i = 0; i < l; i++) {
			this._items[i].mobile = this._mobile;
			this._items[i].resize(this._containerW);
		}

		// this.update();
	};

	public update = () => {
		this.setHeight();

		let containerInnerW = this._containerW - this._items[0].width - this._items[1].width - this._items[2].width - this._items[3].width - this._items[4].width - 100;
		let spacing = Math.round(containerInnerW / 3);

		let x = spacing + this._items[0].width;

		gsap.set(this._items[1].element, {
			x: this._mobile ? 0 : x
		});

		x += spacing + this._items[1].width - this._items[0].labelWidth + this._items[2].width;

		gsap.set(this._items[2].element, {
			x: this._mobile ? 0 : x
		});

		var newX = this._mobile ? 0 : this._containerW - this._items[3].labelWidth - 100;
		if (this._items[4].width > 0) {
			newX = newX - this._items[4].width;
		}
		gsap.set(this._items[3].element, {
			x: this._mobile ? 0 : newX
		});

		var label4Position = this._mobile ? 0 : this._containerW - this._items[4].labelWidth + 50;
		//console.log('label4Position : ' + label4Position);
		gsap.set(this._items[4].element, {
			x: label4Position
		});
	};

	public setHeight = () => {
		let l = this._items.length;
		let tallest = 0;

		for (let i = 0; i < l; i++) {
			if (this._items[i].contentHeight > tallest) {
				tallest = this._items[i].contentHeight;
			}
		}

		this._totalHeight = tallest + 40;

		this._element.style.height = this._mobile ? 'unset' : this._totalHeight + 'px';
	};

	get element() {
		return this._element;
	}

	get totalHeight() {
		return 350; // this._totalHeight;
	}
}
