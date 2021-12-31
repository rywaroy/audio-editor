export default function onCompositionStart(e) {
    if (!this.editorCore.isCollapsed()) {
        const { anchor, focus } = this.editorCore.selection;
        this.composition.mark = [anchor.path[0], focus.path[0]];
        this.editorCore.deleteContentBySelection();
    } else {
        this.composition.mark = null;
    }
    const { anchor } = this.editorCore.selection;
    const { offset } = anchor;
    this.composition.offset = offset;
}