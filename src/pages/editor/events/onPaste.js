export default function onPaste(e) {
    e.preventDefault();
    let paste = (e.clipboardData || window.clipboardData).getData('text');
    paste = paste.replace(/<[^>]*>/, '');
    paste = paste.replace(/\n/, '');
    if (!this.editorCore.isCollapsed()) {
        this.editorCore.deleteBackward();
    }
    this.editorCore.insertText(paste);
    this.update();
}