import h from '../dom/h';
import formatDuration from './formatDuration';

export default function contentToVnode() {
    const content = this.editorCore.content;
    const c = h('div', []);
    content.forEach((para, pIndex) => {
        const pc = createParaContainer.call(this, para, pIndex);
        const speaker = createSpeakerContainer();
        if (this.ifShowSpeakerRole) {
            const role = createSpeakerRole.call(this, para);
            speaker.children.push(role);
        }
        if (this.ifShowSpeakerTime) {
            const time = createSpeakerTime(para);
            speaker.children.push(time);
        }
        const p = createPara.call(this, para, pIndex);
        para.words.forEach((word, wIndex) => {
            const w = createWord.call(this, para, pIndex, word, wIndex);
            p.children.push(w);
        });
        pc.children.push(speaker);
        pc.children.push(p);
        c.children.push(pc);
    });

    return c;
}

function createParaContainer(para, pIndex) {
    const data = {
        exc: {
            st: para.pTime[0],
            et: para.pTime[1],
            path: [pIndex, 0],
        },
        class: '',
    }
    if (this.currentTime * 1000 >= para.pTime[1]) {
        data.class = 'active';
    }
    const pc = h('div.para', data , []);

    return pc;
}

function createSpeakerContainer() {
    const speaker = h('div.caption-content-editor-speaker', { contenteditable: false }, []);

    return speaker;
}

function createSpeakerRole(para) {
    const role = h('span', { style: { color: 'red' } }, para.roleName || '设置说话人');
    
    return role;
}

function createSpeakerTime(para) {
    const time = h('span.caption-content-editor-time', formatDuration(para.pTime[0]));

    return time;
}

function createPara(para, pIndex) {
    const data = {
        exc: {
            st: para.pTime[0],
            et: para.pTime[1],
            path: [pIndex, 0],
        },
    };
    const p = h('p.editor-paragraph', data ,[]);

    return p;
}

function createWord(para, pIndex, word, wIndex) {
    const data = {
        exc: {
            st: word.time[0], 
            et: word.time[1], 
            path: [pIndex, wIndex]
        },
        class: '',
    };
    const time = this.currentTime * 1000;
    if (
        time < para.pTime[1] &&
        time >= para.pTime[0] &&
        time >= word.time[0]
    ) {
        data.class = 'active';
    }
    const w = h('span.editor-vad', data, word.text);

    return w;
}