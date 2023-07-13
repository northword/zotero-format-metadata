export function registerPrompt() {
    ztoolkit.Prompt.register([
        {
            name: "Normal Command Test",
            label: "Plugin Template",
            callback(prompt) {
                ztoolkit.getGlobal("alert")("Command triggered!");
            },
        },
        {
            name: "Conditional Command Test",
            label: "Plugin Template",
            // The when function is executed when Prompt UI is woken up by `Shift + P`, and this command does not display when false is returned.
            when: () => {
                const items = ZoteroPane.getSelectedItems();
                return items.length > 0;
            },
            callback(prompt) {
                prompt.inputNode.placeholder = "Hello World!";
                const items = ZoteroPane.getSelectedItems();
                ztoolkit.getGlobal("alert")(
                    `You select ${items.length} items!\n\n${items
                        .map((item, index) => String(index + 1) + ". " + item.getDisplayTitle())
                        .join("\n")}`,
                );
            },
        },
    ]);
}
