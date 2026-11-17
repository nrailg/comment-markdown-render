import * as vscode from 'vscode';

const previewScheme = 'comment-markdown';
const previewCommand = 'commentMarkdown.openPreview';
const singleLine = /^\s*(?:\/\/|#|--|;+|%|')\s*md\b:?[ \t]?/;
const blockStart = /(\/\*+|"""|'''|\/-)\s*md\b:?[ \t]?/;
const blockEnds: Record<string, string> = { '/*': '*/', '"""': '"""', "'''": "'''", '/-': '-/' };

function commentAt(document: vscode.TextDocument, line: number) {
    if (line < 0 || line >= document.lineCount) { return; }
    const text = (index: number) => document.lineAt(index).text;
    if (singleLine.test(text(line))) {
        let first = line;
        let last = line;
        while (first > 0 && singleLine.test(text(first - 1))) { first--; }
        while (last + 1 < document.lineCount && singleLine.test(text(last + 1))) { last++; }
        const lines = [];
        for (let i = first; i <= last; i++) { lines.push(text(i).replace(singleLine, '')); }
        return { first, markdown: lines.join('\n') };
    }

    for (let first = line; first >= Math.max(0, line - 100); first--) {
        const match = blockStart.exec(text(first));
        if (match) {
            const isC = match[1].startsWith('/*');
            const end = blockEnds[isC ? '/*' : match[1]];
            const lines = [];
            for (let i = first; i < document.lineCount; i++) {
                let body = i === first ? text(i).slice(match.index + match[0].length) : text(i);
                const close = body.indexOf(end);
                if (close >= 0) { body = body.slice(0, close); }
                if (isC && i > first) { body = body.replace(/^\s*\*(?:[ \t]|$)/, ''); }
                lines.push(body);
                if (close >= 0) {
                    if (i < line) { return; }
                    return { first, markdown: lines.join('\n') };
                }
            }
            return;
        }
        if (first < line && Object.values(blockEnds).some(end => text(first).includes(end))) { return; }
    }
}

export function activate(context: vscode.ExtensionContext) {
    const changed = new vscode.EventEmitter<vscode.Uri>();
    context.subscriptions.push(changed,
        vscode.workspace.registerTextDocumentContentProvider(previewScheme, {
            onDidChange: changed.event,
            async provideTextDocumentContent(uri) {
                const { source, line } = JSON.parse(uri.query);
                const sourceUri = vscode.Uri.parse(source);
                if (sourceUri.scheme === previewScheme) { return ''; }
                const document = await vscode.workspace.openTextDocument(sourceUri);
                return commentAt(document, line)?.markdown ?? '';
            }
        }),
        vscode.workspace.onDidChangeTextDocument(({ document }) => {
            if (document.uri.scheme === previewScheme) { return; }
            for (const open of vscode.workspace.textDocuments) {
                if (open.uri.scheme === previewScheme && JSON.parse(open.uri.query).source === document.uri.toString()) {
                    changed.fire(open.uri);
                }
            }
        }),
        vscode.languages.registerHoverProvider('*', {
            provideHover(document, position) {
                if (document.uri.scheme === previewScheme) { return; }
                const comment = commentAt(document, position.line);
                if (!comment) { return; }
                const args = encodeURIComponent(JSON.stringify([document.uri.toString(), comment.first]));
                const link = new vscode.MarkdownString(`[Open Markdown Preview](command:${previewCommand}?${args})`);
                link.isTrusted = { enabledCommands: [previewCommand] };
                return new vscode.Hover(link);
            }
        }),
        vscode.commands.registerCommand(previewCommand, async (source?: string, line?: number) => {
            const editor = vscode.window.activeTextEditor;
            const document = source ? await vscode.workspace.openTextDocument(vscode.Uri.parse(source)) : editor?.document;
            const at = line ?? editor?.selection.active.line;
            const comment = document && at !== undefined && commentAt(document, at);
            if (!document || !comment || document.uri.scheme === previewScheme) {
                void vscode.window.showInformationMessage('Place the cursor inside an md comment to preview it.');
                return;
            }
            const preview = vscode.Uri.from({
                scheme: previewScheme,
                path: `${document.uri.path} (L${comment.first + 1}).md`,
                query: JSON.stringify({ source: document.uri.toString(), line: comment.first })
            });
            await vscode.commands.executeCommand('markdown.showPreviewToSide', preview);
        })
    );
}
