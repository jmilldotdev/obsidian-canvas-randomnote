import CanvasRandomNotePlugin from "main";
import { App, PluginSettingTab, Setting } from "obsidian";

class SettingsTab extends PluginSettingTab {
	plugin: CanvasRandomNotePlugin;

	constructor(app: App, plugin: CanvasRandomNotePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Canvas RandomNote settings:" });

		new Setting(containerEl)
			.setName("Default Width")
			.setDesc("Default width of inserted notes")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.defaultWidth)
					.onChange(async (value) => {
						this.plugin.settings.defaultWidth = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Default Height")
			.setDesc("Default height of inserted notes")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.defaultHeight)
					.onChange(async (value) => {
						this.plugin.settings.defaultHeight = value;
						await this.plugin.saveSettings();
					})
			);
	}
}

export default SettingsTab;
