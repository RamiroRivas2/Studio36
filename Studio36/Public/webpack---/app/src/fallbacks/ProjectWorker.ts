import { clamp } from '../../lib/com/hellomonday/utils/MathUtils';

export class ProjectWorker {
	public onmessage: Function;

	public postMessage = (params: Array<any>) => {
		var e = { data: params };
		var y = e.data[0];
		var scale = e.data[1];
		var scaledY = e.data[2];
		var scrollCenter = e.data[3];
		var halfHeight = e.data[4];
		var entryFullHeight = e.data[5];
		var mainInfoHeight = e.data[6];
		var state = e.data[7];
		var id = e.data[8];
		var fullHeight = e.data[9];
		var centerPercent = e.data[10];

		var bottom = y + entryFullHeight; //(halfHeight + 30);
		var scaledBottom = scaledY + entryFullHeight - 40; // -40 is for mobile, because we add the icon/title on top of the project entry
		var top = y + entryFullHeight; //scaledBottom + (entryFullHeight * scale);
		var displayState = top >= -400 && scaledY <= fullHeight + 50; // - 60;

		var entryCenterPercent = (scrollCenter + entryFullHeight * 0.5 - bottom) / (entryFullHeight + 60);
		var clampedCenterPercent = clamp(entryCenterPercent, 0, 1);
		var offset;

		if (state === 'CLOSED') {
			offset = clamp(entryFullHeight * scale - mainInfoHeight, 0, Infinity) * clampedCenterPercent;
		}
		if (state === 'OPEN') {
			offset = clamp(entryFullHeight * scale - mainInfoHeight, 0, Infinity) * clampedCenterPercent;
		}
		if (state === 'LOCKED') {
			offset = clamp(entryFullHeight * scale - mainInfoHeight, 0, Infinity) * centerPercent;
		}

		let json = JSON.stringify({
			id: id,
			bottom: bottom,
			scaledBottom: scaledBottom,
			displayState: displayState,
			y: y,
			scale: scale,
			offset: offset,
			entryCenterPercent: entryCenterPercent,
			clampedCenterPercent: clampedCenterPercent,
			scrollCenter: scrollCenter
		});

		this.onmessage({ data: json });
	};

	public terminate() {}
}
