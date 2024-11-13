import { TemplateManager } from '../../lib/com/hellomonday/templateManager/TemplateManager';
import { MainMenu } from '../ui/MainMenu/MainMenu';
import { LinkParser } from '../../lib/com/hellomonday/utils/LinkParser';
import { Footer } from '../ui/Footer/Footer';
import { CaseController } from '../modules/CaseGridModule/components/CaseController';
import { Intro } from '../ui/Intro/Intro';
import { WindowManager } from '../utils/WindowManager';
import { ScrollController } from '../controllers/ScrollController';
import { CaseEntry } from '../modules/CaseGridModule/components/case/CaseEntry';
import { BurgerMenu } from '../ui/MainMenu/BurgerMenu';
import { MainFilter } from '../ui/MainMenu/MainFilter';
import { MenuSearch } from '../ui/MainMenu/MenuSearch';
import { GlobalCursor } from '../utils/GlobalCursor/GlobalCursor';

export class Globals {
	public static DEBUG: boolean = false;
	public static DEBUG_SHOW_STATS: boolean = false;

	public static IMAGEKIT_URL: string = 'https://images.big.dk/'; //'https://ik.imagekit.io/dlnx2cwu4w/';

	public static loadThroughImageKit = (url: string, width?: number, height?: number, ratio?: string) => {
		let newURL = url.replace('https://live-big-cms.pantheonsite.io/', Globals.IMAGEKIT_URL);
		//	newURL = url.replace('https://big-staging.herokuapp.com/', Globals.IMAGEKIT_URL);
		//	newURL = url.replace('https://big-prod.herokuapp.com/', Globals.IMAGEKIT_URL);

		if (newURL.indexOf('/') === 0) {
			newURL = Globals.IMAGEKIT_URL + newURL;
		}

		//https://ik.imagekit.io/dlnx2cwu4w/rest/of/the/path/image.jpg?tr=h-300,w-300
		if (height) {
			newURL = newURL + '?tr=h-' + height;
		}

		if (ratio) {
			newURL = newURL + ',ar-' + ratio;
		}
		return newURL;
	};

	public static CACHE_FRONTPAGE;

	public static GLOBAL_CURSOR: GlobalCursor;

	public static MAIN_DRAGABLE;
	public static IS_DRAGGING: boolean = false;

	public static PROGRESS_INDICATOR;

	public static DRAG_IS_OVER_DELTA: boolean = false;

	public static CASE_CONTROLLER_SCALE_VALUE: number = 1;

	public static MAIN_FILTER: MainFilter;
	public static MENU_SEARCH: MenuSearch;

	// Site is in Dark Mode?
	public static USE_NIGHTSHIFT: boolean = false;

	//@ts-ignore
	public static IS_TOUCH_DEVICE: boolean = 'ontouchstart' in window || ((window as any).DocumentTouch && document instanceof DocumentTouch);
	public static IS_IE: boolean = false;
	public static IS_WINDOWS: boolean = navigator.platform.toUpperCase().indexOf('WIN') > -1;
	public static IS_LINUX: boolean = navigator.platform.toUpperCase().indexOf('LINUX') > -1;
	public static MOBILE_OS: string = 'unknown';
	// @ts-ignore
	public static IS_FIREFOX = typeof InstallTrigger !== 'undefined';

	public static RESET_FILTER_AFTER_TRANSITION: boolean = true;

	public static SCROLL_CONTROLLER: ScrollController;

	public static SITE_WRAPPER: HTMLDivElement = document.getElementById('SiteWrapper') as HTMLDivElement;
	public static TEMPLATE_LAYER = document.getElementById('TemplateLayer') as HTMLDivElement;

	public static TEMPLATE_MANAGER: TemplateManager;

	public static OFFSET_OVERLAYS: boolean = false;

	public static MAX_WIDTH: number = 1680;
	public static MAX_HEIGHT: number = 1050;

	public static MAIN_MENU: MainMenu;
	public static BURGER_MENU: BurgerMenu;
	public static FOOTER: Footer;

	public static INITIAL_SEARCH_VALUE: string = null;
	public static INITIAL_SEARCH_VALUE_SECONDARY: string = null;

	public static IS_SHUFFLING: boolean = false;
	public static SHUFFLE_INFO_SCALE = { value: 1 };
	public static SHUFFLE_ANIM_TIME;
	public static SHUFFLE_CLOSE_DELAY;

	public static CASE_CONTROLLER: CaseController;
	public static INTRO: Intro;

	public static PROJECT_ANIMATION_EASE: string = 'power1.inOut';
	public static PROJECT_ANIMATION_SPEED: number = 1;

	public static MOBILE_LAYOUT: boolean = false;
	public static MOBILE_LAYOUT_FIRST_LOAD: boolean = false;

	public static CASE_OPEN: boolean = false;
	public static CASE_OPEN_IS: CaseEntry;

	public static FIRST_INIT: boolean = true;

	public static PROGRESS_BAR: HTMLDivElement;
}
