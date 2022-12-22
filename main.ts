import { App, Notice, Plugin, TFile } from "obsidian";
import { CanvasData, CanvasFileData } from "obsidian/canvas";
import { DEFAULT_SETTINGS, PluginSettings, SearchView } from "src/types";
import { buildGrid, randomElements } from "src/util";
import md5 from "md5";
import InsertModal from "src/InsertModal";

export default class CanvasRandomNotePlugin extends Plugin {
	settings: PluginSettings;

	activeFileIsCanvas = (file: TFile) => {
		return file.extension === "canvas";
	};

	getCanvasContents = async (file: TFile): Promise<CanvasData> => {
		const fileContents = await this.app.vault.read(file);
		if (!fileContents) {
			return this.handleEmptyCanvas();
		}
		const canvasData = JSON.parse(fileContents) as CanvasData;
		return canvasData;
	};

	handleEmptyCanvas = () => {
		const data: CanvasData = {
			nodes: [],
			edges: [],
		};
		return data;
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

	buildFileNodeGrid = (notes: TFile[], canvasData: CanvasData) => {
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
			const fileNode: CanvasFileData = {
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
		canvasData.nodes = canvasData.nodes.concat(fileNodes);
		return canvasData;
	};

	writeCanvasFile = async (file: TFile, canvasData: CanvasData) => {
		const fileContents = JSON.stringify(canvasData);
		await this.app.vault.modify(file, fileContents);
	};

	awaitModal = async (): Promise<boolean> => {
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
				let canvasContents = await this.getCanvasContents(activeFile);
				const confirmed = await this.awaitModal();
				if (!confirmed) {
					return;
				}
				const randomNotes = await getNotesFn(
					parseInt(this.settings.numNotes)
				);
				const newContents = this.buildFileNodeGrid(
					randomNotes,
					canvasContents
				);
				await this.writeCanvasFile(activeFile, newContents);
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
