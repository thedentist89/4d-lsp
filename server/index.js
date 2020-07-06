#!/usr/bin/env node

const {
  DiagnosticSeverity,
  TextDocuments,
  createConnection,
  CompletionItemKind,
} = require("vscode-languageserver");

const { __ENTITIES: commands } = require("./COMMANDS.data.json");

const { TextDocument } = require("vscode-languageserver-textdocument");

const connection = createConnection();
const documents = new TextDocuments(TextDocument);

connection.onInitialize(() => ({
  capabilities: {
    textDocumentSync: documents.syncKind,
    completionProvider: {
      resolveProvider: false,
      triggerCharacters: ["."],
    },
  },
}));

connection.onCompletion((textDocumentPosition) => {
  // The pass parameter contains the position of the text document in
  // which code complete got requested. For the example we ignore this
  // info and always provide the same completion items.
  return commands.map((command) => ({
    label: command.name,
    kind: CompletionItemKind.Function,
    data: command.ID,
  }));
});

const getBlacklisted = (text) => {
  const regex = new RegExp(`;`, "gi");
  const results = [];
  while ((matches = regex.exec(text)) && results.length < 100) {
    results.push({
      value: matches[0],
      index: matches.index,
    });
  }
  return results;
};

const blacklistToDiagnostic = (textDocument) => ({ index, value }) => ({
  severity: DiagnosticSeverity.Error,
  range: {
    start: textDocument.positionAt(index),
    end: textDocument.positionAt(index + value.length),
  },
  message: `${value} is forbiden`,
  source: "Semicolns",
});

const getDiagnostics = (textDocument) =>
  getBlacklisted(textDocument.getText()).map(
    blacklistToDiagnostic(textDocument)
  );

documents.onDidChangeContent((change) => {
  connection.sendDiagnostics({
    uri: change.document.uri,
    diagnostics: getDiagnostics(change.document),
  });
});

documents.listen(connection);
connection.listen();
