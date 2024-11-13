import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import * as ScrollToPlugin from 'gsap/ScrollToPlugin';
import { SplitText } from 'gsap/SplitText';
import 'lazysizes';
import { FontLoader } from '../lib/com/hellomonday/loaders/FontLoader';
import { ModuleFactory } from '../lib/com/hellomonday/templateManager/ModuleFactory';
import { TemplateManager } from '../lib/com/hellomonday/templateManager/TemplateManager';
import { LinkParser } from '../lib/com/hellomonday/utils/LinkParser';
import { ScrollController } from './controllers/ScrollController';
import { Globals } from './data/Globals';
import { KeyboardControls } from './input/KeyboardControls';
import { CaseGridModule } from './modules/CaseGridModule/CaseGridModule';
import { EmplyModule } from './modules/EmplyModule/EmplyModule';
import { ImageGallery } from './modules/ImageGallery/ImageGallery';
import { ImageSlider } from './modules/ImageSlider/ImageSlider';
import { AboutTemplate } from './templates/AboutTemplate';
import { CareersTemplate } from './templates/CareersTemplate';
import { DefaultTemplate } from './templates/DefaultTemplate';
import { DesignTemplate } from './templates/DesignTemplate';
import { ErrorTemplate } from './templates/ErrorTemplate';
import { EthicalTemplate } from './templates/EthicalTemplate';
import { NewsTemplate } from './templates/NewsTemplate';
import { PeopleTemplate } from './templates/PeopleTemplate';
import { Footer } from './ui/Footer/Footer';
import { Intro } from './ui/Intro/Intro';
import { MainMenu } from './ui/MainMenu/MainMenu';
import { GlobalCursor } from './utils/GlobalCursor/GlobalCursor';
import { WindowManager } from './utils/WindowManager';

const modules = {
	CaseGridModule,
	EmplyModule,
	ImageSlider,
	ImageGallery
};

class Main {
	private _fontLoader: FontLoader = new FontLoader();

	constructor() {
		//@ts-ignore
		gsap.registerPlugin(InertiaPlugin, SplitText, Draggable, ScrollToPlugin);

		//gsap.registerPlugin(ScrollToPlugin, InertiaPlugin, Draggable, SplitText);

		WindowManager.getInstance();

		Globals.GLOBAL_CURSOR = new GlobalCursor(document.body.querySelector('#GlobalCursor'));

		function getMobileOperatingSystem() {
			//@ts-ignore
			var userAgent = navigator.userAgent || navigator.vendor || window.opera;

			// Windows Phone must come first because its UA also contains "Android"
			if (/windows phone/i.test(userAgent)) {
				return 'Windows Phone';
			}

			if (/android/i.test(userAgent)) {
				return 'Android';
			}

			// iOS detection from: http://stackoverflow.com/a/9039885/177710
			if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
				return 'iOS';
			}

			return 'unknown';
		}

		Globals.MOBILE_OS = getMobileOperatingSystem();

		if (!Globals.IS_TOUCH_DEVICE) {
			KeyboardControls.getInstance();
			document.body.classList.add('desktop');
		} else {
			document.body.classList.add('touch');
		}

		// Temp PW protection
		/*	if (document.location.host.indexOf('stackpathcdn.com') >= 0) {
			let person = prompt('Enter password', '');

			if (person === 'blaze6391Manual') {
			} else {
				return;
			}
		}*/

		let hours = new Date().getHours();

		/*	if (hours >= 20 || hours <= 7) {
			document.body.classList.add('nightshift');
			Globals.USE_NIGHTSHIFT = true;
		}
*/
		Globals.TEMPLATE_MANAGER = new TemplateManager();
		LinkParser.getInstance(Globals.TEMPLATE_MANAGER);

		Globals.SCROLL_CONTROLLER = new ScrollController();
		Globals.MAIN_MENU = new MainMenu(document.body.querySelector('.MainMenu'));
		Globals.FOOTER = new Footer(document.body.querySelector('.Footer'));

		//Register all modules:
		ModuleFactory.registerModules(modules);

		gsap.to(Globals.SITE_WRAPPER, { opacity: 1 });

		this._fontLoader.load(['Everett'], this.loadRoot);
	}

	private loadRoot = () => {
		if (window.location.pathname.indexOf('/projects/') > -1) {
			//console.log('loading root');
			var gotoFirstInit = this.initSite;
			var xhr = new XMLHttpRequest();
			xhr.open('GET', '/', true);
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4 && xhr.status === 200) {
					var parser = new DOMParser();
					var doc = parser.parseFromString(xhr.responseText, 'text/html');
					var casesDiv = doc.querySelector('.cases');
					var currentCasesDiv = document.querySelector('.cases');
					currentCasesDiv.innerHTML = casesDiv.innerHTML;
					//	console.log('--- getting data');
					gotoFirstInit();
				}
			};
			xhr.send();
		} else {
			//console.log('just continue');
			this.initSite();
		}
	};

	private initSite = () => {
		this.resize();

		Globals.INTRO = new Intro(document.body.querySelector('.Intro'));

		// Add Templates
		Globals.TEMPLATE_MANAGER.addTemplate('DefaultTemplate', DefaultTemplate);
		Globals.TEMPLATE_MANAGER.addTemplate('ErrorTemplate', ErrorTemplate);
		Globals.TEMPLATE_MANAGER.addTemplate('NewsTemplate', NewsTemplate);
		Globals.TEMPLATE_MANAGER.addTemplate('PeopleTemplate', PeopleTemplate);
		Globals.TEMPLATE_MANAGER.addTemplate('DesignTemplate', DesignTemplate);
		Globals.TEMPLATE_MANAGER.addTemplate('AboutTemplate', AboutTemplate);
		Globals.TEMPLATE_MANAGER.addTemplate('EthicalTemplate', EthicalTemplate);

		Globals.TEMPLATE_MANAGER.addTemplate('CareersTemplate', CareersTemplate);

		Globals.TEMPLATE_MANAGER.init(Globals.TEMPLATE_LAYER, 'home');

		WindowManager.signalResize.add(this.resize);
		this.resize();
	};

	public resize = () => {
		Globals.MOBILE_LAYOUT = WindowManager.width < 1025; //768
		if (WindowManager.height < 600) {
			//Globals.MOBILE_LAYOUT = true;
		}

		Globals.FOOTER.resize();
		Globals.TEMPLATE_MANAGER.resize();
		Globals.MAIN_MENU.resize();
	};
}

window.onload = () => {
	(window as any).Main = new Main();
};
