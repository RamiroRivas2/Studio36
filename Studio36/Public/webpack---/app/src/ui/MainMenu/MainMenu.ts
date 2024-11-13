import { BurgerMenu } from './BurgerMenu';
import { gsap } from 'gsap';
import { Globals } from '../../data/Globals';
import { KeyboardControls } from '../../input/KeyboardControls';
import { LinkParser } from '../../../lib/com/hellomonday/utils/LinkParser';
import { MainFilter } from './MainFilter';
import { WindowManager } from '../../utils/WindowManager';
import { SplitText } from 'gsap/SplitText';

export class MainMenu {
	private _logo: HTMLDivElement;
	private _element: HTMLDivElement;

	private _logoTimeline: GSAPTimeline;
	private _lengthB1: number;
	private _lengthB2: number;
	private _lengthG2: number;

	private _letterB1;
	private _letterB2;
	private _letterB3;
	private _letterG1;
	private _letterG2;
	private _letterI;

	private _burgerMenu: BurgerMenu;

	private _hoveringBurger: boolean = false;
	private _burgerActive: boolean = false;

	private _items: NodeListOf<HTMLDivElement>;

	private _currentId: number = 999;

	private _positions: Array<number> = [0, 0, 0, 0, 0];

	private _supportsPassive: boolean;

	private _splitItems: Array<SplitText> = [];

	private _mainFilter: MainFilter;

	private _mobileButton: HTMLDivElement;
	private _mobileMenuOpen: boolean = false;

	private _menuSearch: HTMLDivElement;
	private _secondaryMenu: HTMLDivElement;
	private _innerSecondaryMenu: HTMLDivElement;
	private _mobileLine1: HTMLDivElement;
	private _mobileLine2: HTMLDivElement;
	private _mobileLine3: HTMLDivElement;
	private _mobileLine4: HTMLDivElement;

	private _keyboardControls: KeyboardControls;

	constructor(element: HTMLDivElement) {
		this._element = element;
		this._items = element.querySelectorAll('.item');

		this._keyboardControls = KeyboardControls.getInstance();

		this._mobileButton = element.querySelector('.mobileButton');
		this._mobileButton.addEventListener('click', this.onMobileFilterButtonClick);

		this._menuSearch = element.querySelector('.MenuSearch');
		this._mobileLine1 = element.querySelector('.line1');
		this._mobileLine2 = element.querySelector('.line2');
		this._mobileLine3 = element.querySelector('.line3');
		this._mobileLine3 = element.querySelector('.line3');
		this._mobileLine4 = element.querySelector('.line4');

		let l = this._items.length;

		for (let i = 0; i < l; i++) {
			// this._items[i].addEventListener('click', this.onItemClick);
			// LinkParser.getInstance().parse(this._items[i]);
			this._splitItems.push(new SplitText(this._items[i], { type: 'chars' }));
		}

		l = this._splitItems.length;

		for (let i = 0; i < l; i++) {
			gsap.set(this._splitItems[i].chars, { opacity: 0 });
		}

		this._logo = this._element.querySelector('.logo');
		this._logo.addEventListener('click', this.onLogoClick);

		// modern Chrome requires { passive: false } when adding event
		let supportsPassive = false;
		try {
			window.addEventListener(
				'test',
				null,
				Object.defineProperty({}, 'passive', {
					get: function() {
						supportsPassive = true;
					}
				})
			);
		} catch (e) {}

		this._supportsPassive = supportsPassive;
		this.disableInteractions();

		if (!Globals.IS_TOUCH_DEVICE) {
			this._logo.addEventListener('mouseover', this.onLogoOver);
			this._logo.addEventListener('mouseout', this.onLogoOut);
		}

		this._burgerMenu = new BurgerMenu(this._element.querySelector('.submenu'), this);
		Globals.BURGER_MENU = this._burgerMenu;

		this.initLogo();

		gsap.delayedCall(5, this.revealBurger);

		Globals.SCROLL_CONTROLLER.onUpdate.add(this.scrollUpdate);

		this._mainFilter = new MainFilter(this._element.querySelector('.mainFilter'), this._element.querySelector('.searchBg'));

		this.mobileMenuSetup();

		window.addEventListener('click', this.onWindowClick, true);
		window.addEventListener('touchmove', this.touchMove, true);

		//	this._secondaryMenu.addEventListener('click', this.dontClickThrough);
	}

	private onWindowClick = event => {
		if (this._mobileMenuOpen) {
			var menuWidth = this._secondaryMenu.offsetWidth;
			if (event.pageX < WindowManager.width - menuWidth) {
				this.closeMobileMenu();

				event.stopPropagation();
				event.preventDefault();
			}
		}
	};

	private touchMove = () => {
		if (this._mobileMenuOpen) {
			var menuWidth = this._secondaryMenu.offsetWidth;
			// @ts-ignore
			if (event.touches[0].pageX < WindowManager.width - menuWidth) {
				this.closeMobileMenu();
			}
		}
	};

	public resetFilter = () => {
		console.log('***** resetFilter');

		this._mainFilter.reset();
	};

	private mobileMenuSetup = () => {
		// Move search into the secondary nav
		//this._menuSearch.parentNode.removeChild(this._menuSearch);

		this._secondaryMenu = this._element.querySelector('.secondaryMenuBar');
		this._innerSecondaryMenu = this._secondaryMenu.querySelector('.inner');

		for (var i = 0; i < this._innerSecondaryMenu.children.length; i++) {
			var getChild = this._innerSecondaryMenu.children[i];
			if (getChild.classList.contains('itemHeadlineMobile')) {
				//@ts-ignore
				getChild._storeCount = i + 1;
				getChild.addEventListener('click', this.onMobileHeadlineItemClick);
			}
		}
	};

	private onMobileHeadlineItemClick = (e: MouseEvent) => {
		var target: HTMLDivElement = e.currentTarget as HTMLDivElement;
		//	var elementsIndex = Array.from(target.parentNode.children).indexOf(target);
		//@ts-ignore
		var getTarget = target.parentNode.children[target._storeCount] as HTMLDivElement;
		console.log(getTarget);
		console.log(target);
		var getPlus = target.querySelector('.plus');
		console.log(getPlus);

		if (getTarget.style.display != 'block') {
			getTarget.style.display = 'block';
			getPlus.innerHTML = '-';
		} else {
			getTarget.style.display = 'none';
			getPlus.innerHTML = '+';
		}
		console.log(this._secondaryMenu.offsetHeight);

		/*this._innerSecondaryMenu.style.height = this._secondaryMenu.offsetHeight + 'px';
		this._secondaryMenu.style.height = this._secondaryMenu.offsetHeight + 'px';*/
		e.stopPropagation();
	};

	private onMobileFilterButtonClick = () => {
		console.log('onMobileFilterButtonClick');
		//	this._mainFilter.toggleMobileMenu(true);

		if (this._mobileMenuOpen) {
			this.closeMobileMenu();
		} else {
			this._keyboardControls.disabled = true;
			this._mobileMenuOpen = true;
			this._secondaryMenu.style.pointerEvents = 'all';
			this._secondaryMenu.style.display = 'block';
			var getWidth = this._secondaryMenu.offsetWidth;
			gsap.set(this._secondaryMenu, { x: getWidth });

			gsap.killTweensOf(this._secondaryMenu);
			gsap.to(this._secondaryMenu, { duration: 0.2, x: 0, ease: 'power2.out' });

			gsap.to(this._mobileLine1, { duration: 0.2, rotation: 0, width: 12, y: 4, marginLeft: 0, opacity: 1, ease: 'power2.inOut' });
			gsap.to(this._mobileLine2, { duration: 0.2, rotation: 0, width: 12, y: 0, marginLeft: 0, opacity: 1, ease: 'power2.inOut' });
			gsap.to(this._mobileLine3, { duration: 0.2, rotation: 0, width: 12, y: -4, marginLeft: 0, opacity: 1, ease: 'power2.inOut' });
			gsap.to(this._mobileLine4, { duration: 0.2, rotation: 0, width: 12, y: -8, marginLeft: 0, opacity: 1, ease: 'power2.inOut' });
		}
	};

	public closeMobileMenu = () => {
		if (this._mobileMenuOpen) {
			Globals.MENU_SEARCH.hide();

			this._keyboardControls.disabled = false;

			this._mobileMenuOpen = false;
			this._secondaryMenu.style.pointerEvents = 'none';
			gsap.to(this._secondaryMenu, { duration: 0.2, x: '100vw', ease: 'power2.in', onComplete: this.mobileMenuClosed });

			gsap.to(this._mobileLine1, { duration: 0.2, rotation: 0, width: 12, marginLeft: 0, x: 0, opacity: 1, y: 0, ease: 'power2.inOut' });
			gsap.to(this._mobileLine2, { duration: 0.2, rotation: 0, width: 8, marginLeft: 2, opacity: 1, x: 0, y: 0, ease: 'power2.inOut' });
			gsap.to(this._mobileLine3, { duration: 0.2, rotation: 0, width: 6, marginLeft: 3, opacity: 1, x: 0, y: 0, ease: 'power2.inOut' });
			gsap.to(this._mobileLine4, { duration: 0.2, rotation: 0, width: 4, marginLeft: 4, opacity: 1, x: 0, y: 0, ease: 'power2.inOut' });
		}
	};

	private mobileMenuClosed = () => {
		this._secondaryMenu.style.display = 'none';
	};

	private preventDefault = e => {
		e.preventDefault();
	};

	private preventDefaultForScrollKeys = e => {
		this.preventDefault(e);
		return false;
	};

	private disableInteractions = () => {
		let wheelOpt = this._supportsPassive ? { passive: false } : false;
		let wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

		window.addEventListener('DOMMouseScroll', this.preventDefault, false); // older FF
		window.addEventListener(wheelEvent, this.preventDefault, wheelOpt); // modern desktop
		window.addEventListener('touchmove', this.preventDefault, wheelOpt); // mobile
		window.addEventListener('keydown', this.preventDefaultForScrollKeys, false);
	};

	private enableInteractions = () => {
		let wheelOpt = this._supportsPassive ? { passive: false } : false;
		let wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

		window.removeEventListener('DOMMouseScroll', this.preventDefault, false);
		window.removeEventListener(wheelEvent, this.preventDefault); //, wheelOpt);
		window.removeEventListener('touchmove', this.preventDefault); //, wheelOpt);
		window.removeEventListener('keydown', this.preventDefaultForScrollKeys, false);
	};

	public resize = () => {
		let l = this._items.length;

		for (let i = 0; i < l; i++) {
			this._positions[i] = (this._items[i].getBoundingClientRect() as DOMRect).x;
		}

		this._mainFilter.search.resize();

		if (Globals.MOBILE_LAYOUT) {
			if (this._menuSearch.parentNode !== this._secondaryMenu) {
				this._secondaryMenu.insertBefore(this._menuSearch, this._secondaryMenu.children[0]);
			}
		} else {
			var getFilter = this._element.querySelector('.mainFilter');
			if (document.location.pathname === '' || document.location.pathname === '/') {
				// @ts-ignore
				getFilter.style.opacity = '1';
			}

			if (this._menuSearch.parentNode !== getFilter) {
				getFilter.appendChild(this._menuSearch);
			}
		}
	};

	// private onItemClick = (e) => {
	// 	let id = parseInt(e.currentTarget.dataset.id);
	// 	let l = this._items.length;
	//
	// 	if (id === this._currentId) {
	// 		id = 999;
	// 		// TODO: remove hash
	// 	}
	//
	// 	for (let i = 0; i < l; i++) {
	// 		if (i === id) {
	// 			this._items[i].classList.add('highlight');
	// 		} else {
	// 			this._items[i].classList.remove('highlight');
	// 		}
	// 	}
	//
	// 	this._currentId = id;
	// }

	private initLogo = () => {
		this._letterB1 = this._logo.querySelector('.letter-b-1');
		this._letterB2 = this._logo.querySelector('.letter-b-2');
		this._letterB3 = this._logo.querySelector('.letter-b-3');
		this._letterI = this._logo.querySelector('.letter-i');
		this._letterG1 = this._logo.querySelector('.letter-g-1');
		this._letterG2 = this._logo.querySelector('.letter-g-2');

		this._lengthB1 = this._letterB1.getTotalLength();
		this._lengthB2 = this._letterB2.getTotalLength();
		this._lengthG2 = this._letterG2.getTotalLength();

		gsap.set(this._letterB1, { strokeDasharray: this._lengthB1 + 1 });
		gsap.set(this._letterB2, { strokeDasharray: this._lengthB2 + 1 });
		gsap.set(this._letterG2, { strokeDasharray: this._lengthG2 + 1 });

		this._logoTimeline = gsap.timeline({ paused: true });

		this._logoTimeline
			.fromTo(this._letterB1, { strokeDashoffset: 0 }, { duration: 0.3, ease: 'power2.inOut', strokeDashoffset: this._lengthB1 + 2 })
			.fromTo(this._letterB2, { strokeDashoffset: 0 }, { duration: 0.3, ease: 'power2.inOut', strokeDashoffset: this._lengthB2 + 2 }, '<')
			.to(this._letterB3, { duration: 0.2, ease: 'power2.inOut', overwrite: true, scale: 1, transformOrigin: '50% 50%', attr: { x2: 215.7 } }, '.2')

			.to(this._letterI, { duration: 0.2, ease: 'power2.out', scaleY: 0.3 }, '0.05')
			.to(this._letterI, { duration: 0.3, ease: 'power2.inOut', rotate: -90, transformOrigin: '50% 50%' }, '0.1')
			.to(this._letterI, { duration: 0.3, ease: 'power2.out', scaleY: 2.2 }, '0.2')

			.fromTo(this._letterG2, { strokeDashoffset: 0 }, { duration: 0.3, ease: 'power2.inOut', strokeDashoffset: this._lengthG2 + 2 }, '0')
			.to(this._letterG1, { duration: 0.2, ease: 'power2.out', scale: 1, overwrite: true, transformOrigin: '50% 50%', attr: { x1: 0 } }, '0.2');
	};

	private onLogoClick = () => {
		this._burgerMenu.toggle();

		// if (this._burgerMenu.open) {
		// 	this._logoTimeline.play();
		// } else {
		// 	this._logoTimeline.reverse();
		// }

		this.toggleTopBottomLines(this._burgerMenu.open);
	};

	public toggleTopBottomLines = (state: boolean) => {
		console.log('toggleTopBottomLines', state);
		if (state === true) {
			this._logoTimeline.play();
		} else {
			this._logoTimeline.reverse();
		}

		return;
		gsap.to(this._letterB3, {
			delay: state ? 0.1 : 0,
			// attr: {y1: state ? 100 : 88.26, y2: state ? 100 : 88.26},
			scale: state ? 0 : 1,
			// opacity: state ? 0 : 1,
			duration: 0.2,
			transformOrigin: '50% 50%',
			ease: 'power2.inOut'
		});

		gsap.to(this._letterG1, {
			delay: state ? 0.1 + 0.05 : 0 + 0.05,
			// attr: {y1: state ? -10 : 9.82, y2: state ? -10 : 9.82},
			// opacity: state ? 0 : 1,
			scale: state ? 0 : 1,
			duration: 0.2,
			transformOrigin: '50% 50%',
			ease: 'power2.inOut'
		});
	};

	private onLogoOver = () => {
		gsap.killTweensOf(this.revealBurger);
		this._hoveringBurger = true;
		this.toggleBurger(true);
	};

	private onLogoOut = () => {
		this._hoveringBurger = false;

		if (!this._burgerMenu.open) {
			this.toggleBurger(false);
		}
	};

	private toggleBurger = (state: boolean) => {
		if (state !== this._burgerActive) {
			this._burgerActive = state;

			if (this._burgerActive) {
				this._logoTimeline.play();
			} else {
				this._logoTimeline.reverse();
			}
		}
	};

	public scrollUpdate = () => {
		if (this.burgerOpen) {
			this.closeBurgerMenu();
		}

		if (!this._burgerMenu.open && !this._hoveringBurger) {
			this.toggleBurger(false);
		}

		// if (!this._mainFilter.search.collapsed) {
		// 	this._mainFilter.search.collapse();
		// }

		gsap.killTweensOf(this.revealBurger);
		gsap.delayedCall(3, this.revealBurger);
	};

	private revealBurger = () => {
		if (!this._burgerActive) {
			this.toggleBurger(true);
		}
	};

	public closeBurgerMenu = () => {
		if (this._burgerMenu.open) {
			this._burgerMenu.toggle(false);
			this.toggleTopBottomLines(this._burgerMenu.open);
		}
	};

	public displayLogo = () => {
		let logo = this._element.querySelector('.logo') as HTMLDivElement;
		logo.style.visibility = 'visible';

		this.enableInteractions();

		KeyboardControls.getInstance().enable();
	};

	public animateLabelsIn = () => {
		let l = this._splitItems.length;

		for (let i = 0; i < l; i++) {
			let k = this._splitItems[i].chars.length;

			for (let j = 0; j < k; j++) {
				gsap.to(this._splitItems[i].chars[j], { opacity: 1, delay: 0.03 * j, duration: 0.3 });
			}
		}
	};

	public fadeDown = () => {
		var getFilter = this._element.querySelector('.mainFilter');
		var getLogo = this._element.querySelector('.logo');

		gsap.to([getFilter, getLogo], { duration: 0.4, opacity: 0.1 });
		this._element.style.pointerEvents = 'none';
	};

	public fadeUp = () => {
		var getFilter = this._element.querySelector('.mainFilter');
		var getLogo = this._element.querySelector('.logo');

		gsap.to([getFilter, getLogo], { duration: 0.4, opacity: 1 });
		this._element.style.pointerEvents = 'all';
	};

	get burgerOpen() {
		return this._burgerMenu.open;
	}

	get positions(): Array<number> {
		return this._positions;
	}

	get filter() {
		return this._mainFilter;
	}

	get mobileButton() {
		return this._mobileButton;
	}

	get isMobileMenuOpen() {
		return this._mobileMenuOpen;
	}
}
