export default function onBeforeInput(e) {
    e.preventDefault();
    const { inputType: type, data } = e;

    if (type === 'insertCompositionText' || type === 'deleteCompositionText') {
        return;
    }
    switch (type) {
        case 'insertFromDrop':
        case 'insertFromPaste':
        case 'insertFromYank':
        case 'insertReplacementText':
        case 'insertText': {
            // 插入文字
            if (typeof data === 'string') {
                this.editorCore.insertText(e.data);
                this.update();
            }
            break;
        }

        case 'insertLineBreak':
        case 'insertParagraph': {
            // 换行
            this.editorCore.splitParagraph();
            this.update();
            break;
        }

        
        case 'deleteContent':
        case 'deleteContentForward': {
            // 前删
            this.editorCore.deleteForward();
            this.update();
            break;
        }

        case 'deleteByCut':
        case 'deleteSoftLineBackward':
        case 'deleteContentBackward': {
            // 后删
            this.editorCore.deleteBackward();
            this.update();
            break;
        }
    }
}
