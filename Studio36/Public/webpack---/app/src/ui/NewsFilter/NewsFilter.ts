import { NewsArticle } from '../../templates/components/NewsArticle';
import { gsap } from 'gsap';

export class NewsFilter {
	private _element: HTMLDivElement;
	private _blocks: NodeListOf<HTMLDivElement>;
	private _items: NodeListOf<HTMLDivElement>;

	private _articles: Array<NewsArticle>;

	private _killed: boolean = false;

	private _currentId: number = 0;

	private _values: Array<string> = ['NEWS', 'EVENTS', 'AWARDS', 'LECTURE', 'MEDIA', 'IDEAS'];

	private _itemContainer: HTMLDivElement;

	constructor(element: HTMLDivElement, articles: Array<NewsArticle>, parentElement: HTMLElement) {
		this._element = element;
		this._articles = articles;
		this._items = this._element.querySelectorAll('.filterItem');

		this._itemContainer = parentElement.querySelector('.items');

		let l = this._items.length;

		for (let i = 0; i < l; i++) {
			this._items[i].dataset.id = i + '';
			this._items[i].addEventListener('click', this.onItemClick);
		}
	}

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

			this.updateActiveArticles();
		}
	};

	private updateActiveArticles = () => {
		let l = this._articles.length;

		for (let i = 0; i < l; i++) {
			if (this._currentId === 0) {
				this.show(i);
			} else {
				let category = this._articles[i].element.dataset.category.toUpperCase();

				if (this._values[this._currentId] === category) {
					this.show(i);
				} else {
					this._articles[i].active = false;
					// gsap.to(this._articles[i].element, {
					// 	opacity: 0,
					// 	duration: 0.2,
					// 	// x: 100,
					// 	onComplete: this.hide,
					// 	onCompleteParams: [this._articles[i].element]
					// });

					this.hide(this._articles[i].element);
				}
			}
		}
	};

	private show = (id: number) => {
		this._articles[id].element.style.display = 'flex';
		this._articles[id].active = true;

		// if (!this._articles[id].active) {
		// 	this._articles[id].active = true;
		// 	this._articles[id].element.style.display = 'flex';
		// 	// gsap.set(this._articles[id].element, {x: -100, opacity: 0});
		// 	gsap.set(this._articles[id].element, {opacity: 0});
		// }
		//
		// gsap.to(this._articles[id].element, {opacity: 1, duration: 0.2});//, x: 0});
	};

	private hide = (element: HTMLDivElement) => {
		element.style.display = 'none';
	};

	private onItemClick = e => {
		let id = parseInt(e.currentTarget.dataset.id);
		this.update(id);

		let diff = (this._itemContainer.getBoundingClientRect() as DOMRect).y - this._element.offsetTop;
		let y = Math.round(window.scrollY + diff);

		gsap.to(window, {
			scrollTo: { y: y, autoKill: true },
			overwrite: true,
			duration: 0.5,
			ease: 'power2.out'
		});
	};

	public kill = () => {
		this._killed = true;

		let l = this._items.length;

		for (let i = 0; i < l; i++) {
			this._items[i].removeEventListener('click', this.onItemClick);
		}
	};
}
