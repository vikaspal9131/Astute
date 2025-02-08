import * as vscode from 'vscode';
import Ollama from 'ollama';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "enzo" is now active!');

    const disposable = vscode.commands.registerCommand('Astute.Astute', () => {
        const panel = vscode.window.createWebviewPanel(
            'deepchat',
            'Deep Seek Chat',
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );
        panel.webview.html = getWebviewContent();

        panel.webview.onDidReceiveMessage(async (message: any) => {
            if (message.command === 'chat') {
                const userPrompt = message.text.trim();
                let responseText = '';
        
                const isCode = (text: string) => {
                    const codePatterns = [
                        /(?:function|class|const|let|var|def|if|else|elif|for|while|switch|case|import|export|try|catch|finally|async|await)\s+\w+/, 
                        /\b(?:public|private|protected|static|void|int|float|double|string|return|new|this|extends|implements|throws)\b/, 
                        /(?:=>|=>\s*\{|\{\s*return|\(\s*\)\s*=>)/, 
                        /(?:\{\s*\n|\n\s*\})/, 
                        /(?:;|\{|\}|\(|\)|\[|\])/,
                        /(?:#include\s+<\w+\.h>|using\s+namespace\s+\w+)/, 
                        /(?:import\s+\w+|from\s+\w+\s+import)/, 
                        /(?:print\s*\(|console\.log\(|System\.out\.println\()/, 
                        /(?:\bmain\s*\(.*\)\s*\{)/, 
                        /(?:lambda\s+\w+:|map\(|filter\()/, 
                        /(?:<html>|<body>|<head>|<\/html>|<\/body>)/i, 
                        /(?:SELECT|UPDATE|DELETE|INSERT|CREATE|DROP|ALTER|JOIN)\s+\w+/i
                    ];
        
                    return codePatterns.some((pattern) => pattern.test(text));
                };
        
                try {
                    const modelMessages = [
                        { 
                            role: 'system', 
                            content: "'You are an expert AI code reviewer and enhancer. First, check if the input contains valid code. If code is detected, analyze it, identify issues, suggest improvements, and enhance it while following best practices. If no valid code is found, respond with: ' Sorry, I couldn't detect any code. Please provide a valid code snippet for review.' and do not proceed further.'"
                        }
                    ];
        
                    
                    if (!isCode(userPrompt)) {
                        modelMessages.push({ 
                            role: 'user', 
                            content: `The following might not be a direct code snippet, but assume the user wants to enhance or improve a coding-related input:\n\n"${userPrompt}"` 
                        });
                    } else {
                        modelMessages.push({ role: 'user', content: userPrompt });
                    }
        
                    const streamResponse = await Ollama.chat({
                        model: 'deepseek-r1:1.5b',
                        messages: modelMessages,
                        stream: true
                    });
        
                    for await (const part of streamResponse) {
                        responseText += part.message.content;
                        panel.webview.postMessage({ command: 'chatResponse', text: responseText });
                    }
        
                } catch (err) {
                    console.error('Error during Ollama.chat request:', err);
                    panel.webview.postMessage({ command: 'chatResponse', text: 'Error: ' });
                }
            }
        });
        
        
    });

    context.subscriptions.push(disposable);
}

function getWebviewContent(): string {
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
` ;
}

export function deactivate() {}
