import CanvasRandomNotePlugin from "main";
import { Modal, Setting } from "obsidian";

class InsertModal extends Modal {
	plugin: CanvasRandomNotePlugin;
	confirmed: boolean = false;

	constructor(plugin: CanvasRandomNotePlugin) {
		super(plugin.app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h1", { text: "Canvas RandomNote Settings" });
		const settings = this.plugin.settings;

		new Setting(contentEl)
			.setName("Number of Notes")
			.setDesc("Number of notes to add to canvas")
			.addText((text) =>
				text.setValue(settings.numNotes).onChange(async (value) => {
					settings.numNotes = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(contentEl)
			.setName("Notes per row")
			.setDesc("Number of notes per row")
			.addText((text) =>
				text
					.setValue(settings.numNotesPerRow)
					.onChange(async (value) => {
						settings.numNotesPerRow = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(contentEl).setName("Note Width").addText((text) =>
			text.setValue(settings.noteWidth).onChange(async (value) => {
				settings.noteWidth = value;
				await this.plugin.saveSettings();
			})
		);

		new Setting(contentEl).setName("Note Height").addText((text) =>
			text.setValue(settings.noteHeight).onChange(async (value) => {
				settings.noteHeight = value;
				await this.plugin.saveSettings();
			})
		);

		new Setting(contentEl)
			.setName("Note Margin")
			.setDesc("Margin (horizontal and vertical) between notes")
			.addText((text) =>
				text.setValue(settings.noteMargin).onChange(async (value) => {
					settings.noteMargin = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(contentEl)
			.setName("X-anchor")
			.setDesc("X-coordinate of top-left corner of first note")
			.addText((text) =>
				text.setValue(settings.x).onChange(async (value) => {
					settings.x = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(contentEl)
			.setName("Y-anchor")
			.setDesc("Y-coordinate of top-left corner of first note")
			.addText((text) =>
				text.setValue(settings.y).onChange(async (value) => {
					settings.y = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Add Notes")
				.setCta()
				.onClick(() => {
					this.confirmed = true;
					this.close();
				})
		);
	}
}

export default InsertModal;
