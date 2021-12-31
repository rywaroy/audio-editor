export default function onCompositionEnd(e) {
    this.isComposing = false;
    const { offset, mark } = this.composition;
    const { anchor, focus } = this.editorCore.selection;
    anchor.offset = offset;
    focus.offset = offset;
    this.editorCore.insertText(e.data);
    if (mark) {
        this.updateForce(mark)
    } else {
        this.update();
    }
}