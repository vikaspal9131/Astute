// import * as vscode from 'vscode';
// import  Ollama  from 'ollama';


// export function activate(context: vscode.ExtensionContext) {




// 	console.log('Congratulations, your extension "enzo" is now active!');

// 	const disposable = vscode.commands.registerCommand('enzo.helloWorld', () => {
// 	  const panel = vscode.window.createWebviewPanel(
// 			'deepchat',
// 			'Deep Seek Chat',
// 			vscode.ViewColumn.One,
// 			{
// 				enableScripts:true
// 			}
// 		)
//     panel.webview.html = getWebviewContent();

// 		panel.webview.onDidReceiveMessage(async (message: any) => {

// 			if (message.command === 'chat'){

// 				const userPrompt = message.text
// 				let responseText = ''

// 				try{
// 					const streamResponse = await Ollama.chat({
// 						model:'deepseek-r1:latest',
// 						messages: [{ role: 'user', content: userPrompt }],  
// 						stream:true,
// 					})


// 					for await (const part of streamResponse){
// 						responseText += part.message.content
// 						panel.webview.postMessage({ command: 'chatResponse' ,  text: responseText})
// 					}

// 				}
// 				catch (err) {

// 				}


// 			}


			
// 		}) 
     






// 	});

	

// 	context.subscriptions.push(disposable);
// }

// function getWebviewContent() : string {
//    return `<!DOCTYPE html>
// <html lang="en">
// <head> 
//     <style>
//         body {
//             font-family: Arial, sans-serif;
//             display: flex;
//             justify-content: center;
//             align-items: center;
//             height: 100vh;
//             background: #1E1F24;
//             margin: 0;
//         }
//         .chat-container {
//             width: 60vw; 
//         }
//         .input-area {
//             display: flex;
//             justify-content: center;
//             align-items: center;
//             padding: 10px;
//             background: #24252A;
//             border-radius: 20px;
//         }
//         input {
//             width: 100%;
//             padding: 16px;
//             border: none;
//             border-radius: 5px;
//             outline: none;
//             background: #24252A;
//             color: rgb(189, 204, 186);
//             font-size: 19px;
//             resize: none;
//             overflow-wrap: break-word;
//             white-space: pre-wrap;
//         }
//         button { 
//             height: 50px;
//             width: 100px;
//             border: none;
//             background: #f2ff00;
//             color: rgb(93, 63, 63);
//             cursor: pointer;
//             border-radius: 5px;
//             margin-left: 5px;
//             font-size: 20px;
//         }
//         .res{
//             width: 100%;
//             height: 500px;
//             background-color: red;
//             margin-bottom: 30px;
//             padding: 20px;
//         }
//     </style>
// </head>
// <body>
//     <div class="chat-container">
//         <div class="res"></div> <!-- Response container -->
//         <div class="input-area">
//             <input id="prompt" type="text">
//             <button id="askBtn">Send</button>
//         </div>
//     </div>
// </body>

// <script>
//     const vscode = acquireVsCodeApi();

    
//     document.getElementById('askBtn').addEventListener('click', () => {
//         const text = document.getElementById('prompt').value;
//         vscode.postMessage({ command: 'chat', text }); 
//     });

//     // Listen for messages from the extension and update the response
//     window.addEventListener('message', event => {
//         const { command, text } = event.data;
//         if (command === 'chatResponse') {
//             document.getElementsByClassName('.res').innerText = text; 
//         }
//     });
// </script>
// </html>
// 		`
// }


// // This method is called when your extension is deactivated
// export function deactivate() {}



import * as vscode from 'vscode';
import Ollama from 'ollama';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "enzo" is now active!');

    const disposable = vscode.commands.registerCommand('enzo.helloWorld', () => {
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
                const userPrompt = message.text;
                let responseText = '';

                try {
                    const streamResponse = await Ollama.chat({
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

                } catch (err) {
									console.error('Error during Ollama.chat request:', err);
									panel.webview.postMessage({ command: 'chatResponse', text: 'Error: '  });
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
   <link rel="stylesheet" href="text.css">
   
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
    width: 50vw; 
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

  /* background: red;; */
}


button { 
    padding: 10px 20px;
    border: none;
    background: #0066ff;
    color: rgb(255, 253, 253);
    cursor: pointer;
    border-radius: 20px;
   
    margin-left: 5px;
    font-size: 20px;
}


.res{
  width: 100%;
  height: 400px;
  margin-bottom: 30px;
  padding: 20px;
  font-size: 20px;
  color: white;
}

.heading{
  color: white;
  text-align: center;
  
}
   </style>
</head>
<body>
    <div class="chat-container">
        <div class="res" id="response">
  
        </div>
        
        <div class="heading">
            <img src="" alt="">
            <h1>Welcome to DeepSeek Chat! ✨</h1>
            <p>Ask me anything, and I'll provide insightful responses  powered by DeepSeek AI. I’m here to assist you! 🚀</p>
        </div>
        <div class="input-area">
            <input id="prompt" type="text">
         
            <button id="askBtn">Send</button>
        </div>
    </div>
</body>

<script>
    const vscode = acquireVsCodeApi();
    document.getElementById('askBtn').addEventListener('click', () => {
        document.querySelector('.heading').style.display = "none";
        const text = document.getElementById('prompt').value;
        vscode.postMessage({ command: 'chat', text }); 
    });

    // Listen for messages from the extension and update the response
    window.addEventListener('message', event => {
        const { command, text } = event.data;
        if (command === 'chatResponse') {
            // Update the response container with the new text
            document.getElementById('response').innerText = text; 
        }
    });
</script>
</html>
`;
}

export function deactivate() {}
