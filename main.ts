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
import InsertModal from "src/InsertModal";

export default class CanvasRandomNotePlugin extends Plugin {
	settings: PluginSettings;

	activeFileIsCanvas = (file: TFile) => {
		return file.extension === "canvas";
	};

	getContentsOfActiveFile = async (file: TFile) => {
		const contents = await this.app.vault.cachedRead(file);
		return contents;
	};

	handleEmptyCanvas = () => {
		return {
			nodes: [],
			edges: [],
		};
	};

	parseCanvasContents = (contents: string) => {
		const canvas = JSON.parse(contents) as Canvas;
		console.log(canvas);
		if (Object.keys(canvas).length === 0) {
			return this.handleEmptyCanvas();
		}
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
		const { numNotesPerRow, noteWidth, noteHeight, noteMargin, x, y } =
			this.settings;
		const grid = buildGrid(
			notes.length,
			parseInt(numNotesPerRow),
			parseInt(noteWidth),
			parseInt(noteHeight),
			parseInt(noteMargin),
			parseInt(x),
			parseInt(y)
		);
		const fileNodes = grid.map((node, index) => {
			const fileNode: FileNode = {
				id: md5(filenames[index]),
				x: node.x,
				y: node.y,
				width: parseInt(noteWidth),
				height: parseInt(noteHeight),
				color: "",
				type: "file",
				file: `${filenames[index]}`,
			};
			return fileNode;
		});
		canvasContents.nodes.push(...fileNodes);
		return canvasContents;
	};

	awaitModal = async (app: App): Promise<boolean> => {
		return new Promise((resolve, reject) => {
			try {
				const modal = new InsertModal(this);
				modal.onClose = () => {
					resolve(modal.confirmed);
				};
				modal.open();
			} catch (e) {
				reject();
			}
		});
	};

	addNotesHandler = async (
		getNotesFn: (quantity: number) => Promise<TFile[]>
	) => {
		try {
			const activeFile = this.app.workspace.getActiveFile();
			if (activeFile && this.activeFileIsCanvas(activeFile)) {
				const contents = await this.getContentsOfActiveFile(activeFile);
				let canvasContents = this.parseCanvasContents(contents);
				const confirmed = await this.awaitModal(this.app);
				if (!confirmed) {
					return;
				}
				const randomNotes = await getNotesFn(
					parseInt(this.settings.numNotes)
				);
				canvasContents = this.buildFileNodeGrid(
					randomNotes,
					canvasContents
				);
				this.writeCanvasContents(canvasContents, activeFile);
			} else {
				new Notice("No active canvas file.", 5000);
			}
		} catch (e) {
			console.error(e);
			new Notice(
				"An unexpected error has occurred. It's possible the Obsidian app is out of sync with the canvas file contents. Wait a few moments before running commands.",
				5000
			);
		}
	};

	async onload() {
		await this.loadSettings();

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
