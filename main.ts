import { App, Modal, Notice, Plugin, TFile } from "obsidian";
import {
	DEFAULT_SETTINGS,
	PluginSettings,
	Canvas,
	FileNode,
	SearchView,
} from "src/types";
import { buildGrid, randomElements } from "src/util";
import md5 from "md5";

export default class CanvasRandomNotePlugin extends Plugin {
	settings: PluginSettings;

	activeFileIsCanvas = (file: TFile) => {
		return file.extension === "canvas";
	};

	getContentsOfActiveFile = async (file: TFile) => {
		const contents = await this.app.vault.cachedRead(file);
		console.log(contents);
		return contents;
	};

	parseCanvasContents = (contents: string) => {
		const canvas = JSON.parse(contents) as Canvas;
		console.log(canvas);
		return canvas;
	};

	writeCanvasContents = async (canvasContents: Canvas, file: TFile) => {
		await this.app.vault.modify(file, JSON.stringify(canvasContents));
	};

	handlegetRandomNotes = async (quantity: number): Promise<TFile[]> => {
		const markdownFiles = this.app.vault.getMarkdownFiles();

		if (!markdownFiles.length) {
			new Notice("No files available.", 5000);
			return [];
		}

		if (markdownFiles.length < quantity) {
			new Notice(
				"Not enough files available. Using all available options.",
				5000
			);
		}

		const notes = await this.getRandomNotes(markdownFiles, quantity);
		return notes;
	};

	handlegetRandomNotesFromSearch = async (
		quantity: number
	): Promise<TFile[]> => {
		const searchView = this.app.workspace.getLeavesOfType("search")[0]
			?.view as SearchView;

		if (!searchView) {
			new Notice("The core search plugin is not enabled", 3000);
			return [];
		}

		const searchResults = searchView.dom.getFiles();

		if (!searchResults.length) {
			new Notice("No search results available", 3000);
			return [];
		}

		if (searchResults.length < quantity) {
			new Notice(
				"Not enough search results available. Using all available options.",
				3000
			);
		}

		const notes = await this.getRandomNotes(searchResults, quantity);
		return notes;
	};

	getRandomNotes = async (
		files: TFile[],
		quantity: number
	): Promise<TFile[]> => {
		const markdownFiles = files.filter((file) => file.extension === "md");

		if (!markdownFiles.length) {
			new Notice("No files available.", 5000);
			return [];
		}

		const notes = randomElements(markdownFiles, quantity);
		return notes;
	};

	buildFileNodeGrid = (notes: TFile[], canvasContents: Canvas) => {
		const filenames = notes.map((note) => note.path);
		const grid = buildGrid(notes.length, 3, 400, 500, 50);
		const fileNodes = grid.map((node, index) => {
			const fileNode: FileNode = {
				id: md5(filenames[index]),
				x: node.x,
				y: node.y,
				width: 400,
				height: 500,
				color: "",
				type: "file",
				file: `${filenames[index]}`,
			};
			return fileNode;
		});
		canvasContents.nodes.push(...fileNodes);
		return canvasContents;
	};

	addNotesHandler = async (
		getNotesFn: (quantity: number) => Promise<TFile[]>
	) => {
		const activeFile = this.app.workspace.getActiveFile();
		if (activeFile && this.activeFileIsCanvas(activeFile)) {
			const contents = await this.getContentsOfActiveFile(activeFile);
			let canvasContents = this.parseCanvasContents(contents);
			const randomNotes = await getNotesFn(5);
			canvasContents = this.buildFileNodeGrid(
				randomNotes,
				canvasContents
			);
			this.writeCanvasContents(canvasContents, activeFile);
		} else {
			new Notice("No active canvas file.", 5000);
		}
	};

	async onload() {
		this.addCommand({
			id: "canvas-randomnote-add-notes",
			name: "Add Notes to Canvas",
			callback: async () => {
				this.addNotesHandler(this.handlegetRandomNotes);
			},
		});
		this.addCommand({
			id: "canvas-randomnote-add-notes-from-search",
			name: "Add Notes to Canvas from Search",
			callback: async () => {
				this.addNotesHandler(this.handlegetRandomNotesFromSearch);
			},
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
