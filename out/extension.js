"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const ollama_1 = __importDefault(require("ollama"));
function activate(context) {
    console.log('Congratulations, your extension "enzo" is now active!');
    const disposable = vscode.commands.registerCommand('Astute.Astute', () => {
        const panel = vscode.window.createWebviewPanel('deepchat', 'Deep Seek Chat', vscode.ViewColumn.One, {
            enableScripts: true
        });
        panel.webview.html = getWebviewContent();
        panel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'chat') {
                const userPrompt = message.text;
                let responseText = '';
                try {
                    const streamResponse = await ollama_1.default.chat({
                        model: 'deepseek-r1:1.5b',
                        messages: [{ role: 'user', content: userPrompt }],
                        stream: true
                    });
                    // Handle the streaming response
                    for await (const part of streamResponse) {
                        responseText += part.message.content;
                        // Send each piece of the response to the webview
                        panel.webview.postMessage({ command: 'chatResponse', text: responseText });
                    }
                }
                catch (err) {
                    console.error('Error during Ollama.chat request:', err);
                    panel.webview.postMessage({ command: 'chatResponse', text: 'Error: ' });
                }
            }
        });
    });
    context.subscriptions.push(disposable);
}
function getWebviewContent() {
    return `<!DOCTYPE html>
<html lang="en">
<head> 
   
   <style>
     body {
    font-family: Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: #1E1F24;
    margin: 0;
}

.chat-container {
    width: 700px; 
    height: 90vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
   
 
}

.input-area {
    height: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    background: #24252A;
    border-radius: 40px;
    padding: 0px 20px;
}

input {
  width: 100%;
  border: none;
  border-radius: 5px;
  outline: none;
  background: #24252A;
  color: rgb(189, 204, 186);
  font-size: 19px;
  resize: none;  /* Prevents resizing, remove if you want users to resize */
  overflow-wrap: break-word; /* Ensures text wraps */
  white-space: pre-wrap;
  outline: none;
}

input:focus {
  outline: none !important;
  box-shadow: none !important;
}


button { 
    padding: 7px ;
    border: none;
    cursor: pointer;
    border-radius: 20px;
    margin-left: 5px;
    font-size: 20px;
    background: none;
    color: white;
    padding: 10px 20px;
    background:#336AEA;

}

button img{
  width: 30px;
}
.res {
  height: 80%;
  padding: 30px;
  margin-bottom: 30px;
  font-size: 20px;
  color: white; 
  overflow-y: auto; 
   
}

.heading{
  color: rgb(207, 198, 198);
  text-align: center;
  margin-bottom: 30px;
  line-height: 15px;
}

.res::-webkit-scrollbar {
  display: none;
}

img{
  width: 65px;
}

      
        
   </style>
   
</head>
<body>
    <div class="chat-container">
        <div class="res" id="response">
          
        </div>
        <div class="heading">
            <h1>Welcome to Astute Chat! ✨</h1>
            <p>  Ask me anything, and I'll provide insightful responses  powered by DeepSeek AI. I’m here to assist you! </p>
            
        </div>
        <div class="input-area">
            <input id="prompt" type="text" placeholder="Type your message" autocomplete="off" >
         
            <button id="askBtn">
               send
            </button>
        </div>
    </div>
</body>

<script>
    const vscode = acquireVsCodeApi();

    document.getElementById('prompt').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        document.getElementById('askBtn').click();  // Simulate button click
    }
});

    document.getElementById('askBtn').addEventListener('click', () => {
        document.querySelector('.heading').style.display = "none";
        const text = document.getElementById('prompt').value;
        vscode.postMessage({ command: 'chat', text }); 
    });

 
    window.addEventListener('message', event => {
        const { command, text } = event.data;
        if (command === 'chatResponse') {
          
            document.getElementById('response').innerText = text; 
        }
    });
</script>
</html>
`;
}
function deactivate() { }
//# sourceMappingURL=extension.js.map