class EditorCore {
    constructor() {
        this.selection = null;
        this.content = null;
    }

    setSelection(selection) {
        this.selection = selection;
    }

    setContent(content) {
        this.content = content;
    }

    isCollapsed() {
        const { anchor, focus } = this.selection;
        if (
            anchor.path[0] === focus.path[0] &&
            anchor.path[1] === focus.path[1] &&
            anchor.offset === focus.offset
        ) {
            return true;
        }
        return false;
    }

    insertText(text) {
        if (!this.selection) {
            return;
        }
        // 选区闭合状态直接插入文字
        if (this.isCollapsed()) {
            const { path, offset } = this.selection.anchor;
            const [pIndex, wIndex] = path;
            const word = this.content[pIndex].words[wIndex];
            word.text = word.text.substring(0, offset) + text + word.text.substring(offset, word.text.length);
            this.selection.anchor.offset = offset + text.length;
            this.selection.focus.offset = offset + text.length;
        }
    }
}

export default EditorCore;