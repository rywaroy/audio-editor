import * as is from './is';
import vnode from './vnode';

function emptyNodeAt(elm) {
    const id = elm.id ? '#' + elm.id : '';
    const classes = elm.getAttribute('class');
    const c = classes ? '.' + classes.split(' ').join('.') : '';

    return vnode(elm.tagName.toLowerCase() + id + c, {}, [], undefined, elm);
}

function isVnode(vnode) {
    return vnode.sel !== undefined;
}

function sameVnode(oldVnode, vnode) {
    return oldVnode.sel === vnode.sel;
}

function createData(elm, data) {
    if (data) {
        Object.keys(data).forEach((attr) => {
            if (attr === 'style') {
                for (let s in data['style']) {
                    elm.style[s] = data['style'][s];
                }
            } else if (attr === 'exc') {
                //
            } else if (attr === 'class') {
                if (data[attr]) {
                    elm.classList.add(data[attr]);
                }
            } else {
                elm.setAttribute(attr, data[attr]);
            }
        });
    }
}

function createElm(vnode) {
    const sel = vnode.sel;
    const data = vnode.data;
    const children = vnode.children;
    if (sel) {
        const sels = sel.split('.');
        const tag = sels.shift();
        const elm = document.createElement(tag);
        if (sels.length > 0) {
            elm.setAttribute('class', sels.join(' '));
        }
        createData(elm, data);

        vnode.elm = elm;

        if (is.array(children)) {
            for (let i = 0; i < children.length; ++i) {
                const ch = children[i];
                if (ch != null) {
                    elm.appendChild(createElm(ch));
                }
            }
        } else if (is.primitive(vnode.text)) {
            elm.appendChild(document.createTextNode(vnode.text));
        }
    } else {
        vnode.elm = document.createTextNode(vnode.text);
    }
    return vnode.elm;
}

// function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
//     for (; startIdx <= endIdx; ++startIdx) {
//         const ch = vnodes[startIdx];
//         if (ch != null) {
//             if (ch.sel) {
//                 const parent = ch.elm.parentNode;
//                 parent.removeChild(ch.elm);
//             } else {
//                 parentElm.removeChild(ch.elm);
//             }
//         }
//     }
// }

function patchParagraphs(oldVnode, vnode, mark) {
    const para = vnode.children;
    const oldPara = oldVnode.children;
    let i = 0;
    let j = 0;
    let start = -1;
    let end = -1;
    if (mark) {
        start = mark[0];
        end = mark[1];
    }
    while(i < oldPara.length && j < para.length) {
        const oldST = oldPara[i].data.exc.st;
        const st = para[j].data.exc.st;
        if (oldST < st) { // 删除段落
            oldPara[i].elm.remove();
            i++;
        } else if (oldST > st) { // 新增段落
            const newPara = createElm(para[j]);
            oldVnode.elm.insertBefore(newPara, oldPara[i].elm);
            j++;
        } else {
            if (i >= start && i <= end) {
                const newPara = createElm(para[j]);
                oldVnode.elm.insertBefore(newPara, oldPara[i].elm);
                oldPara[i].elm.remove();
            } else {
                patchClass(oldPara[i], para[j]);
                para[j].elm = oldPara[i].elm;
                patchSpeaker(oldPara[i].children[0], para[j].children[0]);
                patchWords(oldPara[i].children[1], para[j].children[1]);
            }
            i++;
            j++;
        }
    }

    if (i < oldPara.length) {
        for (; i < oldPara.length; i++) {
            if (oldPara[i]) {
                oldPara[i].elm.remove()
            }
        }
    }
    if (j < para.length) {
        for (; j < para.length; j++) {
            const newPara = createElm(para[j]);
            oldVnode.elm.appendChild(newPara)
        }
    }
}

function patchSpeaker(oldVnode, vnode) {
    vnode.elm = oldVnode.elm;
    const speaker = vnode.children;
    const oldSpeaker = oldVnode.children;
    if (oldVnode.children.length === 0 && vnode.children.length === 0) {
        return;
    }
    let i = 0;
    let j = 0;
    while(i < oldSpeaker.length && j < speaker.length) {
        const os =  oldSpeaker[i];
        const s = speaker[j];
        if (s.sel !== os.sel) {
            if (speaker.length > oldSpeaker.length) {
                oldVnode.elm.insertBefore(createElm(s), os.elm);
                j++;
            } else {
                os.elm.remove();
                i++;
            }
        } else {
            s.elm = os.elm;
            if (s.data.style && os.data.style) {
                if (s.data.style.color !== os.data.style.color) {
                    os.elm.style.color = s.data.style.color;
                }
            }
            if (s.text != os.text) {
                os.elm.innerText = s.text;
            }
            i++;
            j++;
        }
    }

    if (i < oldSpeaker.length) {
        for (; i < oldSpeaker.length; i++) {
            if (oldSpeaker[i]) {
                oldSpeaker[i].elm.remove()
            }
        }
    }
    if (j < speaker.length) {
        for (; j < speaker.length; j++) {
            const newPara = createElm(speaker[j]);
            oldVnode.elm.appendChild(newPara)
        }
    }
}

function patchWords(oldVnode, vnode) {
    vnode.elm = oldVnode.elm;
    const oldWords = oldVnode.children;
    const words = vnode.children;

    let i = 0;
    let j = 0;
    while(i < oldWords.length && j < words.length) {
        const oldST = oldWords[i].data.exc.st;
        const st = words[j].data.exc.st;

        if (oldST < st) { // 删除词
            oldWords[i].elm.remove();
            i++;
        } else if (oldST > st) { // 新增词
            const newWord = createElm(words[j]);
            oldVnode.elm.insertBefore(newWord, oldWords[i].elm);
            j++;
        } else {
            patchClass(oldWords[i], words[j]);
            words[j].elm = oldWords[i].elm;
            if (words[j].text !== oldWords[i].text) {
                oldWords[i].elm.innerText = words[j].text;
            }
            i++;
            j++;
        }
    }

    if (i < oldWords.length) {
        for (; i < oldWords.length; i++) {
            if (oldWords[i]) {
                oldWords[i].elm.remove()
            }
        }
    }
    if (j < words.length) {
        for (; j < words.length; j++) {
            const newWord = createElm(words[j]);
            oldVnode.elm.appendChild(newWord)
        }
    }

}

function patchClass(oldVnode, vnode) {
    const oldClass = oldVnode.data.class;
    const newClass = vnode.data.class;

    if (newClass && oldClass) {
        if (newClass !== oldClass) {
            oldVnode.elm.classList.remove(oldClass);
            oldVnode.elm.classList.add(newClass);
        }
    } else if (newClass && !oldClass) {
        oldVnode.elm.classList.add(newClass);
    } else if (!newClass && oldClass) {
        oldVnode.elm.classList.remove(oldClass);
    }
}

// export function onlyPatchSpeaker(oldVnode, vnode) {
//     vnode.elm = oldVnode.elm;
//     const para = vnode.children;
//     const oldPara = oldVnode.children;
//     for (let i = 0; i < para.length; i++) {
//         para[i].elm = oldPara[i].elm;
//         patchSpeaker(oldPara[i].children[0], para[i].children[0]);
//         para[i].children[1] = oldPara[i].children[1];
//     }
// }

export function patch(oldVnode, vnode) {
    if (!isVnode(oldVnode)) {
        oldVnode = emptyNodeAt(oldVnode);
    }

    if (sameVnode(oldVnode, vnode)) {
        vnode.elm = oldVnode.elm;
        patchParagraphs(oldVnode, vnode);
    } else {
        const elm = oldVnode.elm;
        createElm(vnode);
        elm.appendChild(vnode.elm);
    }
}

export function patchForce(element, oldVnode, vnode, mark) {
    if (mark[0] === mark[1]) {
        vnode.elm = oldVnode.elm;
        patchParagraphs(oldVnode, vnode, mark);
    } else {
        for (let i = element.childNodes.length - 1; i >= 0; i--) {
            element.removeChild(element.childNodes[i]);
        }
        oldVnode = emptyNodeAt(element); 
        const elm = oldVnode.elm;
        createElm(vnode);
        elm.appendChild(vnode.elm);
    }
}