export class Resizer {

	constructor() {

	}

	public static getOverscaleToFit = (imageWidth: number, imageHeight: number, targetWidth: number, targetHeight: number) => {
		let fitValues = Resizer.getFitInside(imageWidth, imageHeight, targetWidth, targetHeight);
		let imgW = fitValues.width;
		let imgH = fitValues.height;
		let ratio;
		let overscaleOffset;

		if (imgW < targetWidth) {
			ratio = imgH / imgW;

			overscaleOffset = targetWidth - imgW;

			imgW = imgW + overscaleOffset;
			imgH = imgH + (overscaleOffset * ratio);
		} else if (imgH < targetHeight) {
			ratio = imgW / imgH;

			overscaleOffset = targetHeight - imgH;

			imgW = imgW + (overscaleOffset * ratio);
			imgH = imgH + overscaleOffset;
		}

		return {
			width: imgW,
			height: imgH
		};
	};

	public static getFitInside = (imageWidth: number, imageHeight: number, targetWidth: number, targetHeight: number) => {
		let maxW = targetWidth;
		let maxH = targetHeight;
		let curW = imageWidth;
		let curH = imageHeight;
		let ratio = curH / curW;
		let newW;
		let newH;

		curW = maxW;
		curH = maxW * ratio;

		newW = curW;
		newH = curH;

		if (curW > maxW) {
			newW = maxW;
			newH = maxW * ratio;

			if (newH > maxH) {
				newH = maxH;
				newW = maxH / ratio;
			}
		} else if (curH > maxH) {
			newH = maxH;
			newW = maxH / ratio;

			if (newW > maxW) {
				newW = maxW;
				newH = maxH * ratio;
			}
		}

		return {
			width: newW,
			height: newH
		};
	};
}

