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
	elemMargin: number
): { x: number; y: number }[] {
	const grid: { x: number; y: number }[] = [];
	for (let i = 0; i < numberElems; i++) {
		const row = Math.floor(i / numberElemsPerRow);
		const col = i % numberElemsPerRow;
		grid.push({
			x: col * (elemWidth + elemMargin),
			y: row * (elemHeight + elemMargin),
		});
	}
	return grid;
}
