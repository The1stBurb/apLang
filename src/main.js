import { createApp } from 'vue'
import App from './comps/App.vue'
import './main.css';

import { global } from './index.js';


createApp(App).mount('#app')

function waitForElement(selector, callback) {
  // Check if the element already exists
  const existingElement = document.querySelector(selector);
  if (existingElement) {
    callback(existingElement);
    return;
  }

  // Watch for future changes to the DOM
  const observer = new MutationObserver((mutations, obs) => {
    const element = document.querySelector(selector);
    if (element) {
      obs.disconnect(); // Stop watching once found to save memory
      callback(element);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}
function syncConsoleTheme() {
    const editorEl = document.getElementById("editor");
    const consoleEl = document.getElementById("console");
    
    // Read active theme styles from the Ace container
    const styles = window.getComputedStyle(editorEl);
    
    consoleEl.style.backgroundColor = styles.backgroundColor;
    consoleEl.style.color = styles.color;
    consoleEl.style.fontFamily = styles.fontFamily;
    consoleEl.style.fontSize = styles.fontSize;
}

waitForElement("#editor", ()=>{
    const editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai", syncConsoleTheme);
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/javascript");
    editor.setValue(`func makeAdder (offset) {

  func add (x, y) -> x + y + (offset);


  ret add;
}

for(let i = 0; i < 3; i=i+1){
    const adder = makeAdder(i, 0);
    print('12 + 5 + i =', adder(12, 5), 'i:',i)
    print('i:', i)
}
const adder = makeAdder(1);

print(adder(5,6))
print(makeAdder()(10, 2))
print(makeAdder()(2,3))
print(input('yes?'))`, -1);
    global.editor = editor;

    // const consoleView = ace.edit("console");
    // consoleView.setTheme("ace/theme/monokai"); // Match the theme
    // consoleView.setReadOnly(true);             // Prevent user typing
    // consoleView.setHighlightActiveLine(false);
    // consoleView.setShowPrintMargin(false);
    // consoleView.renderer.setShowGutter(false); // Hide line numbers
    // global.console = consoleView;

});