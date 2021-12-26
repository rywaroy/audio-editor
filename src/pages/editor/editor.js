import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import EditorCore from './editorCore';
import Event from './utils/event';
import h from './editorDom/h';
import { patch } from './editorDom/patch';
import findPath from './utils/findPath';
import { onKeyDown } from './events';

const formatDuration = time => {
    let timeFormatted,
        timeSF = 0,
        timeMF = 0,
        timeHF = 0
    time = parseInt(time / 1000)
    let timeS = time % 60
    let timeM = Math.floor(time / 60) % 60
    let timeH = Math.floor(time / 60 / 60)

    timeS < 10 ? (timeSF = '0' + timeS) : (timeSF = '' + timeS)
    timeM < 10 ? (timeMF = '0' + timeM) : (timeMF = '' + timeM)
    timeH < 10 ? (timeHF = '0' + timeH) : (timeHF = '' + timeH)

    timeFormatted = timeHF + ':' + timeMF + ':' + timeSF

    return timeFormatted
}

export default class Editor extends Event {
    constructor(element) {
        super();
        this.editorCore = new EditorCore();
        this.element = element;
        this.ifShowSpeakerRole = false;
        this.ifShowSpeakerTime = false;
        this.bind();
        this.onSelectionChange = debounce(throttle(this.onSelectionChange, 100), 0);
    }

    bind() {
        document.addEventListener('selectionchange', this.onSelectionChange.bind(this));
        this.element.addEventListener('keydown', onKeyDown.bind(this));
    }

    onSelectionChange() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const { startContainer, startOffset, endContainer, endOffset } = range;
            const startDom = startContainer.nodeType === 3 ? startContainer.parentNode : startContainer;
            const endDom = endContainer.nodeType === 3 ? endContainer.parentNode : endContainer;

            const startPath = findPath(startDom, this.vnode);
            const endPath = findPath(endDom, this.vnode);

            this.editorCore.setSelection({
                anchor: { path: startPath, offset: startOffset },
                focus: { path: endPath, offset: endOffset },
            });
        }
    }

    setContent(content) {
        this.editorCore.setContent(content);   
        this.vnode = this.contentToVnode(content);
        patch(this.element, this.vnode);
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
        const range = document.createRange();
        const { anchor, focus } = this.editorCore.selection;
        const start = this.findWordElementByPath(anchor.path);
        range.setStart(start, anchor.offset);
        if (this.editorCore.isCollapsed()) {
            range.setEnd(start, anchor.offset);
        } else {
            const end = this.findWordElementByPath(focus.path);
            range.setEnd(end, focus.offset);
        }
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    findWordElementByPath(path) {
        const [pIndex, wIndex] = path;
        return this.vnode.children[pIndex].children[1].children[wIndex].elm.childNodes[0];
    }

    updateContent(content) {
        this.editorCore.setContent(content);
        const vnode = this.contentToVnode(content);
        patch(this.vnode, vnode);
        this.vnode = vnode;
        this.emit('onChange', this.editorCore.content, this.vnode);
    }

    updateSpeaker(ifShowSpeakerRole, ifShowSpeakerTime) {
        this.ifShowSpeakerRole = ifShowSpeakerRole;
        this.ifShowSpeakerTime = ifShowSpeakerTime;
        
        const vnode = this.contentToVnode();
        patch(this.vnode, vnode);
        this.vnode = vnode;
        this.emit('onChange', this.editorCore.content, this.vnode);
    }

    contentToVnode() {
        const content = this.editorCore.content;
        const c = h('div', []);
        content.forEach((para, pIndex) => {
            const pc = h('div.para', {
                exc: {
                    st: para.pTime[0],
                    path: [pIndex, 0],
                }
            } , []);
            const speaker = h('div.caption-content-editor-speaker', { contenteditable: false }, []);
            if (this.ifShowSpeakerRole) {
                const role = h('span', { style: { color: 'red' } }, para.roleName);
                speaker.children.push(role);
            }
            if (this.ifShowSpeakerTime) {
                const time = h('span.caption-content-editor-time', formatDuration(para.pTime[0]))
                speaker.children.push(time);
            }
            const p = h('p.editor-paragraph', {
                exc: {
                    st: para.pTime[0],
                    path: [pIndex, 0],
                }
            } ,[]);
            para.words.forEach((word, wIndex) => {
                const w = h('span.editor-vad', {
                    exc: {
                        st: word.time[0], 
                        et: word.time[0], 
                        path: [pIndex, wIndex]
                    }
                }, word.text);
                p.children.push(w);
            });
            pc.children.push(speaker);
            pc.children.push(p);
            c.children.push(pc);
        });
    
        return c;
    }
}
