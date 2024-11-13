import { gsap } from 'gsap';
import { WindowManager } from '../../utils/WindowManager';

export class PeoplePagination {
	private _element: HTMLDivElement;
	private _blocks: NodeListOf<HTMLDivElement>;
	private _items: NodeListOf<HTMLDivElement>;

	private _killed: boolean = false;

	private _currentId: number = 0;

	private _blockPositions: Array<number> = [0, 0, 0, 0, 0, 0, 0];

	constructor(element: HTMLDivElement, blocks: NodeListOf<HTMLDivElement>) {
		this._element = element;
		this._blocks = blocks;

		//	document.body.appendChild(this._element);
		this._items = this._element.querySelectorAll('.item');

		let l = this._items.length;

		for (let i = 0; i < l; i++) {
			this._items[i].dataset.id = i + 0 + '';
			this._items[i].addEventListener('click', this.onItemClick);
		}
	}

	public hide = (index: number) => {
		if (this._items[index]) {
			this._items[index].style.display = 'none';
		}
	};

	public update = (id: number) => {
		if (id !== this._currentId) {
			this._currentId = id;

			let l = this._items.length;

			for (let i = 0; i < l; i++) {
				if (i === this._currentId) {
					this._items[i].classList.add('active');
				} else {
					this._items[i].classList.remove('active');
				}
			}
		}
	};

	private onItemClick = e => {
		this._currentId = parseInt(e.currentTarget.dataset.id);

		gsap.to(window, {
			scrollTo: { y: this._blockPositions[this._currentId] - WindowManager.halfHeight / 2 + 160, autoKill: false },
			overwrite: true,
			duration: 1,
			ease: 'power2.out'
		});
	};

	public resize = (headlineHeight: number) => {
		let l = this._blocks.length;

		for (let i = 0; i < l; i++) {
			this._blockPositions[i] = Math.round(this._blocks[i].offsetTop + headlineHeight - WindowManager.halfHeight);
		}
	};

	public kill = () => {
		//document.body.removeChild(this._element);

		this._killed = true;
		// gsap.killTweensOf(this.checkScrollPos);
	};
}
