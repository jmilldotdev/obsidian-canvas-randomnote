export function randomElements<T>(arr: T[], quantity: number): T[] {
	const result = new Array(quantity);
	let len = arr.length;
	const taken = new Array(len);
	if (quantity > len) return arr;
	while (quantity--) {
		const x = Math.floor(Math.random() * len);
		result[quantity] = arr[x in taken ? taken[x] : x];
		taken[x] = --len in taken ? taken[len] : len;
	}
	return result;
}

export function buildGrid(
	numberElems: number,
	numberElemsPerRow: number,
	elemWidth: number,
	elemHeight: number,
	elemMargin: number,
	xAnchor: number,
	yAnchor: number
): { x: number; y: number }[] {
	const grid = [];
	let x = xAnchor;
	let y = yAnchor;
	for (let i = 0; i < numberElems; i++) {
		grid.push({ x, y });
		x += elemWidth + elemMargin;
		if ((i + 1) % numberElemsPerRow === 0) {
			x = xAnchor;
			y += elemHeight + elemMargin;
		}
	}
	return grid;
}
