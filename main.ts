import { App, Modal, Notice, Plugin, TFile } from "obsidian";
import SettingsTab from "src/SettingsTab";
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
		// Use fs
		const contents = await this.app.vault.cachedRead(file);
		console.log(contents);
		return contents;
	};

	parseCanvasContents = (contents: string) => {
		const canvas = JSON.parse(contents) as Canvas;
		console.log(canvas);
		return canvas;
	};

	addDummyFileNode = (canvasContents: Canvas) => {
		const dummyNode: FileNode = {
			id: "dummy",
			x: 0,
			y: 0,
			width: 400,
			height: 500,
			color: "",
			type: "file",
			file: "201901250999.md",
		};
		canvasContents.nodes.push(dummyNode);
		return canvasContents;
	};

	writeCanvasContents = async (canvasContents: Canvas, file: TFile) => {
		await this.app.vault.modify(file, JSON.stringify(canvasContents));
	};

	handlegetRandomNotes = async (quantity: number): Promise<TFile[]> => {
		const markdownFiles = this.app.vault.getMarkdownFiles();

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

	async onload() {
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "canvas-randomnote-add-notes",
			name: "Add Notes to Canvas",
			callback: async () => {
				// Conditions to check
				const activeFile = this.app.workspace.getActiveFile();
				if (activeFile && this.activeFileIsCanvas(activeFile)) {
					const contents = await this.getContentsOfActiveFile(
						activeFile
					);
					let canvasContents = this.parseCanvasContents(contents);
					console.log(canvasContents);
					const randomNotes =
						await this.handlegetRandomNotesFromSearch(5);
					console.log(randomNotes);
					canvasContents = this.buildFileNodeGrid(
						randomNotes,
						canvasContents
					);
					await this.writeCanvasContents(canvasContents, activeFile);
					await this.getContentsOfActiveFile(activeFile);

					return true;
				}
			},
		});

		this.addSettingTab(new SettingsTab(this.app, this));
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
