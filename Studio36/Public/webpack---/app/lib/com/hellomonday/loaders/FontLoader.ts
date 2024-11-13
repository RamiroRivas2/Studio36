/**
 * Proper preload web fonts so you will get the correct size of text fields when measuring them
 *
 * @author Torben Dalgaard (torben@hellomonday.com)
 *
 **/
export class FontLoader {
	private _loadedFonts;
	private _fonts;

	private _fontData = [];

	private _callback;

	private _interval;

	/**
	 *
	 * @param {Array} fonts
	 * @param {Function} callback
	 */
	public load = (fonts, callback) => {
		this._fonts = fonts;
		this._callback = callback;

		this._loadedFonts = 0;

		this.createTestNodes();

		this._interval = setInterval(this.checkNodes, 50);
	};

	private createTestNodes = () => {
		let i = 0;
		let l = this._fonts.length;
		let node;
		let width;

		for (i; i < l; i++) {
			node = document.createElement('span');

			// Characters that vary significantly among different fonts
			node.innerHTML = 'giItT1WQy@!-/#';

			// Visible - so we can measure it - but not on the screen
			node.style.position = 'absolute';
			node.style.left = '-10000px';
			node.style.top = '-10000px';

			// Large font size makes even subtle changes obvious
			node.style.fontSize = '300px';

			// Reset any font properties
			node.style.fontFamily = 'sans-serif';
			node.style.fontVariant = 'normal';
			node.style.fontStyle = 'normal';
			node.style.fontWeight = 'normal';
			node.style.letterSpacing = '0';
			document.body.appendChild(node);

			// Remember width with no applied web font
			width = node.offsetWidth;

			node.style.fontFamily = this._fonts[i];

			this._fontData.push({ node: node, width: width });
		}
	};

	private checkNodes = () => {
		let i = 0;
		let l = this._fontData.length;
		let node;
		let width;

		for (i; i < l; i++) {
			node = this._fontData[i].node;
			width = this._fontData[i].width;

			// Compare current width with original width
			if (node && node.offsetWidth === width) {
				return;
			}
		}

		clearInterval(this._interval);
		this.cleanup();

		this._callback();
	};

	private cleanup = () => {
		let i = 0;
		let l = this._fontData.length;
		let node;

		for (i; i < l; i++) {
			node = this._fontData[i].node;
			if (node.parentNode) {
				node.parentNode.removeChild(node);
			}
			node = null;
		}
	};
}
