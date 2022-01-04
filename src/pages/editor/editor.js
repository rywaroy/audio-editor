import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import EditorCore from './core';
import Event from './utils/event';
import { patch, patchForce } from './dom/patch';
import { findPath, findWordElementByPath } from './utils/findVnode';
import contentToVnode from './utils/contentToVnode';
import { onKeyDown, onBeforeInput, onClick, onCompositionStart, onCompositionUpdate, onCompositionEnd, onPaste } from './events';

export default class Editor extends Event {
    constructor(element) {
        super();
        this.editorCore = new EditorCore();
        this.element = element;
        this.currentTime = 0;
        this.ifShowSpeakerRole = false;
        this.ifShowSpeakerTime = false;
        this.isComposing = false;
        this.composition = {
            mark: null,
            offset: null,
        };
        this.history = [];
        this.historyCache = [];

        this.bind();
        this.onSelectionChange = debounce(throttle(this.onSelectionChange, 100), 0);
        this.contentToVnode = contentToVnode.bind(this);
        this.setHistory = debounce(this.setHistory, 300);
    }

    bind() {
        document.addEventListener('selectionchange', this.onSelectionChange.bind(this));
        this.element.addEventListener('keydown', onKeyDown.bind(this));
        this.element.addEventListener('beforeinput', onBeforeInput.bind(this));
        this.element.addEventListener('click', onClick.bind(this));
        this.element.addEventListener('compositionstart', onCompositionStart.bind(this));
        this.element.addEventListener('compositionupdate', onCompositionUpdate.bind(this));
        this.element.addEventListener('compositionend', onCompositionEnd.bind(this));
        this.element.addEventListener('paste', onPaste.bind(this));
    }

    onSelectionChange() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && !this.isComposing) {
            const range = selection.getRangeAt(0);
            const { startContainer, startOffset, endContainer, endOffset } = range;
            const startDom = startContainer.nodeType === 3 ? startContainer.parentNode : startContainer;
            const endDom = endContainer.nodeType === 3 ? endContainer.parentNode : endContainer;

            const startPath = findPath(startDom, this.vnode);
            const endPath = findPath(endDom, this.vnode);
            if (startPath && endPath) {
                this.editorCore.setSelection({
                    anchor: { path: startPath, offset: startOffset },
                    focus: { path: endPath, offset: endOffset },
                });
            }
        }
    }

    setContent(content) {
        this.editorCore.setContent(content);   
        this.vnode = this.contentToVnode();
        patch(this.element, this.vnode);
        this.setHistory(content);
        this.emit('onChange', this.editorCore.content);
    }

    update() {
        const vnode = this.contentToVnode();
        patch(this.vnode, vnode);
        this.vnode = vnode;
        this.emit('onChange', this.editorCore.content, this.vnode);
        this.resetRange();
    }

    resetRange() {
        if (this.editorCore.selection) {
            const range = document.createRange();
            const { anchor, focus } = this.editorCore.selection;
            const start = findWordElementByPath(anchor.path, this.vnode);
            range.setStart(start, anchor.offset);
            if (this.editorCore.isCollapsed()) {
                range.setEnd(start, anchor.offset);
            } else {
                const end = findWordElementByPath(focus.path, this.vnode);
                range.setEnd(end, focus.offset);
            }
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else {
            this.element.blur();
        }
    }

    // updateContent(content) {
    //     this.editorCore.setContent(content);
    //     const vnode = this.contentToVnode();
    //     patch(this.vnode, vnode);
    //     this.vnode = vnode;
    //     this.emit('onChange', this.editorCore.content, this.vnode);
    // }

    updateSpeaker(ifShowSpeakerRole, ifShowSpeakerTime) {
        this.ifShowSpeakerRole = ifShowSpeakerRole;
        this.ifShowSpeakerTime = ifShowSpeakerTime;
        
        const vnode = this.contentToVnode();
        patch(this.vnode, vnode);
        this.vnode = vnode;
        this.emit('onChange', this.editorCore.content, this.vnode);
    }

    // 强制更新段落
    updateForce(mark) {
        const vnode = this.contentToVnode();
        patchForce(this.element, this.vnode, vnode, mark);
        this.vnode = vnode;
        this.emit('onChange', this.editorCore.content, this.vnode);
        this.resetRange();
    }

    setHistory() {
        if (this.history.length >= 12) {
            this.history.shift();
        }
        let selection = null;
        if (this.editorCore.selection) {
            selection = JSON.stringify(this.editorCore.selection);
        }
        this.history.push({
            selection,
            result: JSON.stringify(this.editorCore.content),
        });
        this.historyCache = [];
    }

    // 回撤
    undoHistory() {
        if (this.history.length > 1) {
            this.historyCache.push(this.history.pop());
            const { result, selection } = this.history[this.history.length - 1];
            this.editorCore.setContent(JSON.parse(result));
            if (selection) {
                this.editorCore.setSelection(JSON.parse(selection));
            } else {
                this.editorCore.setSelection(null);
            }
            this.update();
        }
    }

    // 返回
    redoHistory() {
        if (this.historyCache.length > 0) {
            const data = this.historyCache.pop();
            const { result, selection } = data;
            this.editorCore.setContent(JSON.parse(result));
            if (selection) {
                this.editorCore.setSelection(JSON.parse(selection));
            } else {
                this.editorCore.setSelection(null);
            }
            this.history.push(data);
            this.update();
        }
    }
}
