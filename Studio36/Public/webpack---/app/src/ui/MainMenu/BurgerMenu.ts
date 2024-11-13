import { gsap } from 'gsap';
import { LinkParser } from '../../../lib/com/hellomonday/utils/LinkParser';
import { Globals } from '../../data/Globals';
import { MainMenu } from './MainMenu';

export class BurgerMenu {
	private _element: HTMLDivElement;
	private _mainMenu: MainMenu;
	private _container: HTMLDivElement;

	private _open: boolean = false;

	private _items: NodeListOf<HTMLAnchorElement>;

	constructor(element: HTMLDivElement, mainMenu: MainMenu) {
		this._element = element;
		this._mainMenu = mainMenu;

		this._container = this._element.querySelector('.container');
		gsap.set(this._container, { x: -150, display: 'block' });

		this._items = this._container.querySelectorAll('.menuItem');

		let l = this._items.length;

		for (let i = 0; i < l; i++) {
			this._items[i].addEventListener('mouseover', this.itemOver);
			this._items[i].addEventListener('mouseout', this.itemOut);

			if (this._items[i].classList.contains('contact')) {
				//LinkParser.getInstance().parse(this._items[i], this.scrollToFooter);
				this._items[i].addEventListener('click', this.scrollToFooter);
			} else {
				LinkParser.getInstance().parse(this._items[i]);
				this._items[i].addEventListener('click', this.clickMenuItem);
			}
		}

		window.addEventListener('click', this.onWindowClick, true);
	}

	private onWindowClick = event => {
		if (this._open) {
			var menuWidth = this._element.offsetWidth;
			if (event.pageX > menuWidth) {
				this.toggle(false);
				Globals.MAIN_MENU.toggleTopBottomLines(false);
				event.stopPropagation();
				event.preventDefault();
			}
		}
	};

	private clickMenuItem = event => {
		let target = event.currentTarget;
		let hrefPath = target.getAttribute('href');
		let currentPath = Globals.TEMPLATE_MANAGER.getPath();
		//console.log(hrefPath);
		//console.log(currentPath);

		if (hrefPath === currentPath) {
			if (currentPath === '/') {
				Globals.MENU_SEARCH.removeExistingTerm();
				Globals.MAIN_FILTER.removeCurrentFilter();
				if (Globals.CASE_CONTROLLER) {
					Globals.CASE_CONTROLLER.onFilterUpdate({ filters: [], sort: 'standard', sortDirection: 'desc' });
				}
			} else {
				gsap.to(window, { duration: 1, scrollTo: 0 });
			}
		}
	};

	private scrollToFooter = () => {
		gsap.to(window, {
			scrollTo: { y: Globals.FOOTER.element.offsetTop - 70, autoKill: false },
			overwrite: true,
			duration: 0.5,
			ease: 'power2.out'
		});

		this._mainMenu.closeBurgerMenu();
	};

	private itemOver = e => {
		if (!this._open) {
			return;
		}

		gsap.to(e.currentTarget, { opacity: 1, duration: 0.3 });
	};

	private itemOut = e => {
		gsap.to(e.currentTarget, { opacity: this._open ? 0.5 : 0, duration: 0.3 });
	};

	public toggle = (overwrite?: boolean) => {
		this._open = overwrite || !this._open;
		gsap.to(this._container, { duration: 0.3, x: this._open ? 0 : -150, ease: 'power2.out' });

		let l = this._items.length;

		for (let i = 0; i < l; i++) {
			gsap.killTweensOf(this._items[i]);
			gsap.to(this._items[i], { delay: this._open ? 0 : 0.2, opacity: this._open ? 0.5 : 0, duration: 0.3 });
		}

		gsap.set(this._element, { display: this._open ? 'block' : 'none', delay: this.open ? 0 : 0.3 });
	};

	public getMenuItemCount = path => {
		var returnNumber = -1;
		for (var i = 0; i < this._items.length; i++) {
			var currentItem = this._items[i];
			var getPath = currentItem.getAttribute('href');
			if (getPath === path) {
				returnNumber = i;
			}
		}
		return returnNumber;
	};

	get open() {
		return this._open;
	}
}
