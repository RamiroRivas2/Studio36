import {TemplateManager} from '../../lib/com/hellomonday/templateManager/TemplateManager';
import {ModuleFactory} from '../../lib/com/hellomonday/templateManager/ModuleFactory';
import {LinkParser} from '../../lib/com/hellomonday/utils/LinkParser';
import gsap from 'gsap';
import {Globals} from "../data/Globals";
import {AbstractModule} from "../../lib/com/hellomonday/templateManager/AbstractModule";

export class AbstractTemplate {
	public path: string = null;
	protected initial = false;
	public element: HTMLElement;

	private _container: HTMLElement;
	protected modules: Array<AbstractModule> = [];
	private _templateManager: TemplateManager;

	private _transitionSpeed = 0.5;

	constructor(element: HTMLElement, templateManager: TemplateManager) {

		this.element = element;
		//console.log('document.location.pathname : ' + document.location.pathname)
		if (document.location.pathname === '' || document.location.pathname === '/') {
			Globals.CACHE_FRONTPAGE = this.element.parentNode.cloneNode(true);
		//	console.log(Globals.CACHE_FRONTPAGE)
		}


		this._container = element.querySelector('.innerContainer');
		this._templateManager = templateManager;
	}

	private buildModules() {

		let moduleData = this.element.querySelectorAll('[data-module]');

		LinkParser.getInstance().parseNodeList(this.element.querySelectorAll('a:not(.noparse)'));

		let i = 0;
		let l = moduleData.length;
		let module;
		let moduleName: string;

		for (i; i < l; i++) {
			moduleName = moduleData[i].getAttribute('data-module');

			if (moduleName) {

				module = ModuleFactory.create(moduleName, moduleData[i], this);

				if (module) {
					this.modules.push(module);
				}
			}
		}
	}


	public templateIn() {

		//console.log('templateIn()')
		if (!this._templateManager.isInitial()) {
			Globals.TEMPLATE_LAYER.appendChild(this.element);
		}

		this.buildModules();
		this.resize();


		// Find current template - and previous template
		var previousPath = '/' + Globals.TEMPLATE_MANAGER.prevPath;
		var currentPath = Globals.TEMPLATE_MANAGER.getPath();

		var getPreviousPathCount = Globals.BURGER_MENU.getMenuItemCount(previousPath);
		var getCurrentPathCount = Globals.BURGER_MENU.getMenuItemCount(currentPath);

		var newXPos = 0;
		var newYPos = this.element.offsetHeight;
		var newYPosFooter = window.innerHeight;
		if (getPreviousPathCount > getCurrentPathCount) {
			newYPos = newYPos * -1;
			newYPosFooter = newYPosFooter * -1;
		} else {
		}

	//	console.log('IN previousPath : ' + previousPath)
	//	console.log('IN currentPath : ' + currentPath)
		if (previousPath === '/' || previousPath === '/home') {
			newYPos = 0;
			newXPos = window.innerWidth * -1;
		} else if (currentPath === '/' || currentPath === '/home') {
			newYPos = 0;
			newXPos = window.innerWidth;
		}

		if (currentPath === '/' || currentPath === '/home') {

		} else {
			this._container.style.overflow = 'clip';
			this.element.style.height = '100vh';
		}

		var duration = this._transitionSpeed;
		if (newXPos !== 0) {
			duration  = window.innerWidth / 1000;
			if (duration > this._transitionSpeed) {
				duration = this._transitionSpeed;
			}
		}

		gsap.set(this.element, {opacity: 1, x: newXPos * 1.3, y: newYPos});

		gsap.to(Globals.FOOTER.element, {opacity: 1, duration: duration});
		gsap.set(window, {scrollTo: {y: 0, autoKill: false}, overwrite: true});

		//console.log(' ----- anim in ')
		gsap.to(this.element, {
			delay: 0.1,
			duration: duration,
			opacity: 1,
			x: 0,
			y: 0,
			ease: 'power2.out',
			onComplete: () => this.templateInComplete()
		});


		// gsap.killTweensOf(this.templateOutComplete);
		// gsap.killTweensOf(this.templateInComplete);
		// gsap.delayedCall(0.3, this.templateInComplete);
	};

	public templateInComplete = () => {
		this._container.style.overflow = 'unset';
		this.element.style.height = 'unset';
		this.element.style.transform = 'unset';
		this._templateManager.nextTemplate();
	};

	public templateOut(newPath, speed) {

		let l = this.modules.length;

		for (let i = 0; i < l; i++) {
			this.modules[i].kill();
		}

		// Find current template - and previous template
		var previousPath = '/' + Globals.TEMPLATE_MANAGER.prevPath;
		var currentPath = Globals.TEMPLATE_MANAGER.getPath();

		var getPreviousPathCount = Globals.BURGER_MENU.getMenuItemCount(previousPath);
		var getCurrentPathCount = Globals.BURGER_MENU.getMenuItemCount(currentPath);

		var newXPos = 0;
		var newYPos = 0;
		var newYPosFooter = window.innerHeight;
		if (getPreviousPathCount > getCurrentPathCount) {
			newYPos = this.element.offsetHeight;
		} else {
			newYPos = this.element.offsetHeight * -1;
			newYPosFooter = newYPosFooter * -1;
			//gsap.set(this.element, {opacity: 1, x: -window.innerWidth});
		}

		//console.log('OUT currentPath : ' + currentPath)
	//	console.log('OUT previousPath : ' + previousPath)
		if (currentPath === '/' || currentPath === '/home') {
			newYPos = 0;
			newXPos = window.innerWidth * -1;
		} else if (previousPath === '/' || previousPath === '/home') {
			newYPos = 0;
			newXPos = window.innerWidth;
		}
		/*	else if (currentPath === '/projects') {
				newYPos = 0;
				newXPos = window.innerWidth * -1;
			}*/

		var getWindowScrollYPosition = window.scrollY;
		//console.log('offset Y : ' + getWindowScrollYPosition);


		// - parseInt(this._container.style.marginBottom)

		gsap.set(window, {scrollTo: {y: 0, autoKill: false}, overwrite: true});

		if (previousPath === '/' || previousPath === '/home') {
			this.element.style.overflow = 'clip';
			this.element.style.width = '100vw';
		} else {
			gsap.set(this.element.children, {y: -getWindowScrollYPosition});
			this.element.style.overflow = 'clip';
			this.element.style.height = '100vh';
		}

		//gsap.to(Globals.FOOTER.element, {duration: 1, opacity: 0});

		var duration = this._transitionSpeed;
		if (newXPos !== 0) {
			duration  = window.innerWidth / 1000;
			if (duration > this._transitionSpeed) {
				duration = this._transitionSpeed;
			}
		}


		gsap.to(this.element, {
			opacity: 1,
			x: newXPos * 1.3,
			y: newYPos,
			ease: 'power2.in',
			duration: duration,
			onComplete: () => this.templateOutComplete()
		});

		gsap.to(Globals.FOOTER.element, {
			opacity: 0,
			duration: duration,
			ease: 'power2.in'
		});

		// gsap.killTweensOf(this.templateOutComplete);
		// gsap.killTweensOf(this.templateInComplete);
		// gsap.delayedCall(0.3, this.templateOutComplete);

		Globals.FIRST_INIT = false;
	};

	public templateOutComplete = () => {

		Globals.TEMPLATE_LAYER.removeChild(this.element);

		this.kill();

		this._templateManager.nextTemplate();
	};

	public resize() {

		let l = this.modules.length;

		for (let i = 0; i < l; i++) {
			this.modules[i].resize();
		}
	};

	public kill() {

		let l = this.modules.length;

		for (let i = 0; i < l; i++) {
			this.modules[i].kill();
		}

	};

}
