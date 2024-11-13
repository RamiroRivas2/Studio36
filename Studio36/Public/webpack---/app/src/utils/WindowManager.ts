import { Signal } from '../../lib/com/hellomonday/signals/Signal';
import {Globals} from "../data/Globals";
import {clamp} from "../../lib/com/hellomonday/utils/MathUtils";

export class WindowManager {
	public static signalResize: Signal = new Signal();
	public static width: number;
	public static height: number;
	public static halfWidth: number;
	public static halfHeight: number;
	public static documentWidth: number;
	public static documentHeight: number;
	public static scaleFactor: number;

	public static contentAreaHeight: number;
	public static contentAreaCenterY: number;

	public static halfContentAreaHeight: number;

	private static previousHeight: number;
	private static instance: WindowManager;

	private constructor() {
		window.addEventListener('resize', (event: Event) => this.resizeHandler(event));
		this.resizeHandler();
	}

	public static getInstance(): WindowManager {
		if (!WindowManager.instance) {
			WindowManager.instance = new WindowManager();
		}

		return WindowManager.instance;
	}

	public static aspectRatio(): number {
		return WindowManager.width / WindowManager.height;
	}

	public static isRetina = () => {

		let mediaQuery = '(-webkit-min-device-pixel-ratio: 1.5),\
            (min--moz-device-pixel-ratio: 1.5),\
            (-o-min-device-pixel-ratio: 3/2),\
            (min-resolution: 1.5dppx)';

		return window.devicePixelRatio > 1 || (window.matchMedia && window.matchMedia(mediaQuery).matches);
	};

	public sendFakeResizeEvent(): void {
		this.resizeHandler();
	}

	private resizeHandler(event?: Event): void {
		WindowManager.width = window.innerWidth;
		WindowManager.height = window.innerHeight;

		WindowManager.halfWidth = Math.round(WindowManager.width * 0.5);
		WindowManager.halfHeight = Math.round(WindowManager.height * 0.5);

		WindowManager.documentWidth = document.documentElement.clientWidth;
		WindowManager.documentHeight = document.documentElement.clientHeight;

		WindowManager.contentAreaHeight = WindowManager.height - 80 - 140;
		WindowManager.contentAreaCenterY = 80 + Math.round(WindowManager.contentAreaHeight * 0.5);

		WindowManager.halfContentAreaHeight = Math.round(WindowManager.contentAreaHeight * 0.5);

		// let scaleW = WindowManager.width / Globals.MAX_WIDTH;
		// let scaleH = WindowManager.height / Globals.MAX_HEIGHT;
		//
		// WindowManager.scaleFactor = clamp(Math.min(scaleW, scaleH), 0, 1);

		let scaleW = WindowManager.width / 712;
		let scaleH = WindowManager.contentAreaHeight / 890;
		WindowManager.scaleFactor = clamp(Math.min(scaleW, scaleH), 0, 1);

		WindowManager.previousHeight = WindowManager.height;

		WindowManager.signalResize.dispatch(WindowManager.width, WindowManager.height);
	}
}
