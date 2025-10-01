import * as vscode from 'vscode';
import Ollama from 'ollama';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "Astute Chat" is active');

    const disposable = vscode.commands.registerCommand('Astute.Astute', () => {
        const panel = vscode.window.createWebviewPanel(
            'deepchat',
            'Astute Chat',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        panel.webview.html = getWebviewContent();

        panel.webview.onDidReceiveMessage(async (message: any) => {
            if (message.command === 'chat') {
                const userPrompt = message.text.trim();
                if (!userPrompt) return;

                let responseText = '';

                try {
                    const streamResponse = await Ollama.chat({
                        model: 'deepseek-r1:1.5b',
                        messages: [{ role: 'user', content: userPrompt }],
                        stream: true
                    });

                    for await (const part of streamResponse) {
                        responseText += part.message.content;
                        panel.webview.postMessage({ command: 'chatResponse', text: responseText });
                    }

                } catch (err) {
                    console.error(err);
                    panel.webview.postMessage({ command: 'chatResponse', text: 'Oops! Something went wrong.' });
                }
            }
        });
    });

    context.subscriptions.push(disposable);
}

function getWebviewContent(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head> 
   <style>
     body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #1E1F24; margin: 0; }
     .chat-container { width: 700px; height: 90vh; display: flex; flex-direction: column; background: #2A2B30; border-radius: 10px; overflow: hidden; }
     .messages { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
     .message { max-width: 70%; padding: 10px 15px; border-radius: 15px; color: #fff; word-wrap: break-word; white-space: pre-wrap; }
     .user { background: #336AEA; align-self: flex-end; }
     .ai { background: #4E5059; align-self: flex-start; }
     .input-area { display: flex; padding: 10px; background: #24252A; }
     input { flex: 1; padding: 10px 15px; border-radius: 20px; border: none; outline: none; background: #1E1F24; color: #fff; font-size: 16px; }
     button { margin-left: 10px; padding: 0 20px; border-radius: 20px; border: none; background: #336AEA; color: white; font-size: 16px; cursor: pointer; }
     .messages::-webkit-scrollbar { display: none; }
   </style>
</head>
<body>
    <div class="chat-container">
        <div class="messages" id="messages"></div>
        <div class="input-area">
            <input id="prompt" type="text" placeholder="Type a message..." />
            <button id="sendBtn">Send</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const messagesContainer = document.getElementById('messages');
        const input = document.getElementById('prompt');

        let currentAiMessageDiv = null;

        function addMessage(text, sender) {
            if (sender === 'ai') {
                // Streaming: update existing AI bubble if exists
                if (!currentAiMessageDiv) {
                    currentAiMessageDiv = document.createElement('div');
                    currentAiMessageDiv.className = 'message ai';
                    currentAiMessageDiv.innerText = '';
                    messagesContainer.appendChild(currentAiMessageDiv);
                }
                currentAiMessageDiv.innerText = text;
            } else {
                // User message
                const div = document.createElement('div');
                div.className = 'message user';
                div.innerText = text;
                messagesContainer.appendChild(div);
                // Reset AI bubble for next response
                currentAiMessageDiv = null;
            }
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        document.getElementById('sendBtn').addEventListener('click', () => {
            const text = input.value.trim();
            if (!text) return;
            addMessage(text, 'user');
            input.value = '';
            vscode.postMessage({ command: 'chat', text });
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') document.getElementById('sendBtn').click();
        });

        window.addEventListener('message', event => {
            const { command, text } = event.data;
            if (command === 'chatResponse') addMessage(text, 'ai');
        });
    </script>
</body>
</html>
`;
}

export function deactivate() {}
