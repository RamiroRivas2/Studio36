import gsap from 'gsap';
import { Globals } from '../../data/Globals';
import { Signal } from '../../../lib/com/hellomonday/signals/Signal';
import { WindowManager } from '../../utils/WindowManager';

export class Intro {
	public completeSignal: Signal = new Signal();
	private _element: HTMLDivElement;
	private _logo: HTMLDivElement;
	private _bg: HTMLDivElement;
	private _letterContainer: HTMLDivElement;
	private _letters: NodeListOf<HTMLDivElement>;
	private _templateLayer;
	private _complete: boolean = false;

	private _getSVGI;
	private _getSVGStroke;

	constructor(element: HTMLDivElement) {
		this._element = element;
		this._logo = element.querySelector('.logoPlaceholder');
		this._bg = element.querySelector('.bg');
		this._letterContainer = element.querySelector('.letters');
		this._letters = this._letterContainer.querySelectorAll('.letter');

		let logoSvg = this._logo.querySelector('svg');
		this._getSVGI = logoSvg.querySelector('.letter-i');
		this._getSVGStroke = logoSvg.querySelector('.stroke');

		/*this._logo.style.top = window.innerHeight / 2 + 'px';
		this._letterContainer.style.top = window.innerHeight / 2 + 'px';*/

		gsap.to(this._logo, { duration: 0, opacity: 1 });
		gsap.to(this._letters, { stagger: 0.15 / 2, delay: 0.15, duration: 0, opacity: 1 });

		gsap.delayedCall(1, this.animate);

		window.addEventListener('resize', this.onResize);
		//this.animate();

		// gsap.set(Globals.TEMPLATE_LAYER, {y: 500});
		// gsap.set(Globals.FOOTER.element, {y: 500});
	}

	private animate = () => {
		if (this._getSVGStroke) {
			gsap.to(this._getSVGI, { fill: '#000000', duration: 0.3, delay: 1.55 });

			gsap.to(this._getSVGStroke, { stroke: '#000000', duration: 0.3, delay: 1.55 });
		}
		gsap.to(this._logo, { top: '18px', left: '30px', duration: 2, ease: 'power2.inOut' });

		gsap.to(this._bg, { top: '-100%', duration: 1, delay: 1, ease: 'power2.out' });

		// gsap.to(Globals.TEMPLATE_LAYER, {y: 0, duration: 1, delay: 1, ease: 'power2.out'});
		// gsap.to(Globals.FOOTER.element, {y: 0, duration: 1, delay: 1, ease: 'power2.out'});

		let positions = Globals.MAIN_MENU.positions;

		let l = this._letters.length;

		if (Globals.MOBILE_LAYOUT === true) {
			//gsap.to(this._letterContainer, { top: '10px', duration: 2, ease: 'power2.inOut' });
			gsap.to(this._letterContainer, { top: '-5px', duration: 2, ease: 'power2.inOut' });
			gsap.to(this._letterContainer, { opacity: 0, duration: 0.5, delay: 1.5, ease: 'power2.inOut' });

			console.log(window.location.href);
			var getHref = String(window.location.href);

			console.log('getHref : ' + getHref.indexOf('projects/'));

			if (Globals.TEMPLATE_MANAGER.getPath() !== '/' && String(window.location.href).indexOf('/projects/') === -1) {
				gsap.delayedCall(1.7, this.hideNav);
			}
		} else {
			gsap.to(this._letterContainer, { top: '18px', duration: 2, ease: 'power2.inOut' });
		}
		for (let i = 0; i < l; i++) {
			// if (i < l - 1) {

			var scaleWith = 0.5;

			let x = -((this._letters[i].getBoundingClientRect() as DOMRect).x - positions[i]);
			if (Globals.MOBILE_LAYOUT === true) {
				//console.log('mobile');
				x = WindowManager.width / 2 - 20 - i * 20; // + i * 3;
				if (i === l - 1) {
				}
				scaleWith = 0.2;
				//console.log(x);
			}
			//	if (Globals.MOBILE_LAYOUT === false) {
			gsap.to(this._letters[i], { x: x, duration: 2, scale: scaleWith, ease: 'power2.inOut' });
			gsap.to(this._letters[i], { opacity: 0, duration: 0.5, delay: 1.5 });
			//	}
			// } else {
			// 	gsap.to(this._letters[i], {opacity: 0, duration: 0.5});
			// }
		}

		gsap.delayedCall(1.7, Globals.MAIN_MENU.animateLabelsIn);

		gsap.delayedCall(2, Globals.MAIN_MENU.displayLogo);
		gsap.to(this._element, { opacity: 0, duration: 0.3, delay: 2, onComplete: this.kill });
	};

	private hideNav = () => {
		Globals.MAIN_FILTER.toggle(false);
	};

	private onResize = event => {
		/*if (Globals.MOBILE_LAYOUT === true) {
			gsap.to(this._letterContainer, { opacity: 0 });
		} else {
			gsap.to(this._letterContainer, { opacity: 1 });
		}*/
	};

	private kill = () => {
		this._complete = true;
		this.completeSignal.dispatch();

		Globals.TEMPLATE_LAYER.style.transform = 'unset';

		document.body.classList.remove('disable');
		this._element.parentNode.removeChild(this._element);
	};

	get complete() {
		return this._complete;
	}
}
