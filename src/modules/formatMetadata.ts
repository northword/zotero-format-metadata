import { config } from "../../package.json";

export default class FormatMetadata {
    getSelection() {
        const editpaneItemBox = document.activeElement;
        if (editpaneItemBox?.id == 'zotero-editpane-item-box' && editpaneItemBox.shadowRoot) {
            const textAreaElement = editpaneItemBox.shadowRoot.activeElement as HTMLInputElement|null;
            if (textAreaElement){
                const text = textAreaElement.value.substring(
                    textAreaElement.selectionStart!,
                    textAreaElement.selectionEnd!
                  );
                  if (text) {
                      //console.log(textAreaElement, text, textAreaElement.selectionStart, textAreaElement.selectionEnd);
                      return text;
                  }else{
                    console.log("[MetaFormat] 未选择待替换文本");
                  }
            }else{
                console.log("[MetaFormat] 焦点未在文本输入元素");
            }
        }else{
            console.log("[MetaFormat] 焦点未在可编辑区");
        }
    }
    
    sub(){
        const text = getSelection();
        
    }
    

}

