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

    setCollapsedSelection(path, offset) {
        this.selection = { anchor: { path, offset }, focus: { path, offset } };
    }

    // 光标是否闭合
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

    // 光标是否在段首
    isStart() {
        if (!this.isCollapsed()) {
            return false;
        }
        const { anchor } = this.selection;
        const { path, offset } = anchor;

        if (path[1] === 0 && offset === 0) {
            return true;
        }
        return false;
    }

    // 光标是否在段尾
    isEnd() {
        if (!this.isCollapsed()) {
            return false;
        }
        const { anchor } = this.selection;
        const { path, offset } = anchor;
        const [pIndex, wIndex] = path;
        const len = this.content[pIndex].words.length;
        const lastWord = this.content[pIndex].words[len - 1];

        if (wIndex === len - 1 && offset === lastWord.text.length) {
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
        } else {
            // 先删除内容
            this.deleteBackward();
            this.insertText(text);
        }
    }

    // 前删
    deleteBackward() {
        if (!this.selection) {
            return;
        }
        if (this.isCollapsed()) {
            const { path, offset } = this.selection.anchor;
            const [pIndex, wIndex] = path;
            const word = this.content[pIndex].words[wIndex];
            // 文章开头，删除不做处理
            if (pIndex === 0 && wIndex === 0 && offset === 0) {
                return;
            }
            // 段落开头，合并段落
            if (this.isStart()) {
                this.mergeParagraph();
            } else if (offset === 0) { // 光标在词首，删除上一个词的末尾
                const preWord = this.content[pIndex].words[wIndex - 1];
                preWord.text = preWord.text.substring(0, preWord.text.length - 1);
                this.setCollapsedSelection([pIndex, wIndex - 1], preWord.text.length);
            } else if (offset === 1 && word.text.length === 1) { // 删除最后一个词
                if (this.content[pIndex].words.length === 1) { // 整段中最后一个词
                    const word = this.content[pIndex].words[wIndex];
                    word.text = '';
                    this.setCollapsedSelection([pIndex, 0], 0);
                } else {
                    const preWord = this.content[pIndex].words[wIndex - 1];
                    this.content[pIndex].words.splice(wIndex, 1);
                    this.setCollapsedSelection([pIndex, wIndex - 1], preWord.text.length);
                }
            } else { // 删词中内容
                word.text = word.text.substring(0, offset - 1) + word.text.substring(offset, word.text.length);
                this.selection.anchor.offset = offset - 1;
                this.selection.focus.offset = offset - 1;
            }
        } else { // 选区删除
            this.deleteContentBySelection();
        }
    }

    // 后删
    deleteForward() {
        if (!this.selection) {
            return;
        }
        if (this.isCollapsed()) {
            // 段落结尾，删除不做处理
            if (this.isEnd()) {
                return;
            }

            let { path, offset } = this.selection.anchor;
            let [pIndex, wIndex] = path;
            let word = this.content[pIndex].words[wIndex];

            // 词结尾, 光标定位在下个词的开头
            if (offset === word.text.length) {
                wIndex = wIndex + 1;
                offset = 0;
                word = this.content[pIndex].words[wIndex];
            }

            const preWord = this.content[pIndex].words[wIndex - 1];
            const nextWord = this.content[pIndex].words[wIndex + 1];

            // 如果词只有一个字，则删除该词
            if (word.text.length === 1) {
                // 光标设置成下一个词的开头
                if (nextWord) {
                    this.content[pIndex].words.splice(wIndex, 1);
                    this.setCollapsedSelection([pIndex, wIndex], 0);
                } else if (preWord) { // 删除的是最后一个词，光标设置成上一个词的结尾
                    this.content[pIndex].words.splice(wIndex, 1);
                    this.setCollapsedSelection([pIndex, wIndex - 1], preWord.text.length);
                } else { // 全段只剩最后一个词，不删除，设置空占位
                    word.text = '';
                    this.setCollapsedSelection([pIndex, 0], 0);
                }
            } else {
                word.text = word.text.substring(0, offset) + word.text.substring(offset + 1, word.text.length);
            }

            

            // 词结尾，删除下一个词的开头内容
            // if (offset === word.text.length) {
            //     const nextWord = this.content[pIndex].words[wIndex + 1];
            //     nextWord.text = nextWord.text.slice(1);
            //     // 光标设置成下一个词的开头
            //     this.setCollapsedSelection([pIndex, wIndex + 1], 0);
            // } else {
                
            // }


            // 删除的是最后一个词
            // if (wIndex === this.content[pIndex].words.length - 1) {
            //     // if (this.content[pIndex].words.length > wIndex) {
            //     //     
            //     //     this.setCollapsedSelection([pIndex, wIndex], 0);
            //     // } else { // 如果后面没有词，则设置成上一个词的结尾
            //     //     this.setCollapsedSelection([pIndex, wIndex - 1], this.content[pIndex].words[wIndex - 1].text.length);
            //     // }
            //     // 如果词只有一个字，则删除该词
            //     if (word.text.length === 1) {
            //         this.content[pIndex].words.splice(wIndex, 1);
            //         // 光标设置成上一个词的结尾
            //         this.setCollapsedSelection([pIndex, wIndex - 1], this.content[pIndex].words[wIndex - 1].text.length);
            //     } else {
            //         word.text = word.text.slice(0, word.text.length - 1);
            //     }

            // } else { // 删除的不是最后一个词
                
            // }

             
            // 文章开头，删除不做处理
            // if (pIndex === 0 && wIndex === 0 && offset === 0) {
            //     return;
            // }
            // // 段落开头，合并段落
            // if (this.isStart()) {
            //     this.mergeParagraph();
            // } else if (offset === 0) { // 光标在词首，删除上一个词的末尾
            //     const preWord = this.content[pIndex].words[wIndex - 1];
            //     preWord.text = preWord.text.substring(0, preWord.text.length - 1);
            //     this.setCollapsedSelection([pIndex, wIndex - 1], preWord.text.length);
            // } else if (offset === 1 && word.text.length === 1) { // 删除最后一个词
            //     if (this.content[pIndex].words.length === 1) { // 整段中最后一个词
            //         const word = this.content[pIndex].words[wIndex];
            //         word.text = '';
            //         this.setCollapsedSelection([pIndex, 0], 0);
            //     } else {
            //         const preWord = this.content[pIndex].words[wIndex - 1];
            //         this.content[pIndex].words.splice(wIndex, 1);
            //         this.setCollapsedSelection([pIndex, wIndex - 1], preWord.text.length);
            //     }
            // } else { // 删词中内容
            //     word.text = word.text.substring(0, offset - 1) + word.text.substring(offset, word.text.length);
            //     this.selection.anchor.offset = offset - 1;
            //     this.selection.focus.offset = offset - 1;
            // }
        } else { // 选区删除
            this.deleteContentBySelection();
        }
    }

    // 删除选取的内容
    deleteContentBySelection() {
        const { anchor, focus } = this.selection;
        const { path: anchorPath, offset: anchorOffset } = anchor;
        const { path: focusPath, offset: focusOffset } = focus;
        const [anchorPIndex, anchorWIndex] = anchorPath;
        const [focusPIndex, focusWIndex] = focusPath;

        // 删除后选区开始的文字
        const startText = this.content[anchorPIndex].words[anchorWIndex].text.slice(0, anchorOffset);
        // 删除后选区结尾的文字
        const endText = this.content[focusPIndex].words[focusWIndex].text.slice(focusOffset, this.content[focusPIndex].words[focusWIndex].text.length);

        if (anchorPIndex === focusPIndex && anchorWIndex === focusWIndex) { // 在同一个词中
            const txt = this.content[anchorPIndex].words[anchorWIndex].text;
            const newTxt = txt.slice(0, anchorOffset) + txt.slice(focusOffset);
            
            if (!newTxt) { // 没有字，删除该词
                this.content[anchorPIndex].words.splice(anchorWIndex, 1);
                // 光标重置到后一个词的开头
                this.setCollapsedSelection([focusPIndex, focusWIndex], 0);
            } else {
                this.content[anchorPIndex].words[anchorWIndex].text = newTxt;
                // 光标重置到 anchorOffset
                this.setCollapsedSelection([focusPIndex, focusWIndex], anchorOffset);
            }
        } else { // 在不同词中
            // 先修改开头和结尾的词
            this.content[anchorPIndex].words[anchorWIndex].text = startText;
            this.content[focusPIndex].words[focusWIndex].text = endText;

            // 在同一段中，不同词
            if (anchorPIndex === focusPIndex) {
                // 删除中间的词
                this.content[anchorPIndex].words.splice(anchorWIndex + 1, focusWIndex - anchorWIndex - 1);
                if (!endText) {
                    this.content[anchorPIndex].words.splice(anchorWIndex + 1, 1);
                }
                if (!startText) {
                    this.content[anchorPIndex].words.splice(anchorWIndex, 1);
                }
                this.setCollapsedSelection([focusPIndex, anchorWIndex], startText ? startText.length : 0);
            } else { // 不同段落
                // 句子内容删完，清除整句
                this.content[anchorPIndex].words = this.content[anchorPIndex].words.slice(0, startText ? anchorWIndex + 1 : anchorWIndex);
                this.content[focusPIndex].words = this.content[focusPIndex].words.slice(endText ? focusWIndex : focusWIndex + 1, this.content[focusPIndex].words.length);
                
                let pIndex = anchorPIndex + 1;
                let wIndex = 0;
                let offset = 0;
                let merge = true; // 是否合并段落

                // 中间多段删除
                if (focusPIndex - anchorPIndex > 1) {
                    this.content.splice(anchorPIndex + 1, focusPIndex - anchorPIndex - 1);
                }

                // 结尾段落全部删除
                if (this.content[anchorPIndex + 1].words.length === 0) {
                    this.content.splice(anchorPIndex + 1, 1);
                    // 光标定位在起始段落末尾
                    pIndex = anchorPIndex;
                    wIndex = this.content[anchorPIndex].words.length - 1;
                    offset = this.content[anchorPIndex].words[wIndex].text.length;
                    merge = false;
                }
                // 起始段落全部删除
                if (this.content[anchorPIndex].words.length === 0) {
                    this.content.splice(anchorPIndex, 1);
                    pIndex = anchorPIndex;
                    merge = false;
                }
                this.setCollapsedSelection([pIndex, wIndex], offset);

                // 合并段落
                if (merge) {
                    this.mergeParagraph();
                }
            }
        }
    }

    mergeParagraph() {
        const { path } = this.selection.anchor;
        const [pIndex] = path;
        const firstPara = this.content[pIndex - 1];
        const secondPara = this.content[pIndex];
        const newPara = JSON.parse(JSON.stringify(firstPara));

        newPara.pId = null;
        newPara.pTime[0] = firstPara.pTime[0];
        newPara.pTime[1] = secondPara.pTime[1];
        newPara.words = firstPara.words.concat(secondPara.words);
        this.content.splice(pIndex - 1, 2, newPara);

        const lastWordIndex = firstPara.words.length - 1;
        this.setCollapsedSelection([pIndex - 1, lastWordIndex], firstPara.words[lastWordIndex].text.length);
    }
}

export default EditorCore;