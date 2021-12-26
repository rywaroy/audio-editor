export default function onKeyDown(e) {
    e.preventDefault();

    this.editorCore.insertText('123');
    this.update();
}