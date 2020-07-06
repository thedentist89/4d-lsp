const { LanguageClient } = require("vscode-languageclient");

module.exports = {
  activate(context) {
    const executable = {
      command: "4d-server",
      args: ["--stdio"],
    };

    const serverOptions = {
      run: executable,
      debug: executable,
    };

    const clientOptions = {
      documentSelector: [
        {
          scheme: "file",
          language: "4d",
        },
      ],
    };

    const client = new LanguageClient(
      "4d-extension-id",
      "4D",
      serverOptions,
      clientOptions
    );

    context.subscriptions.push(client.start());
  },
};
