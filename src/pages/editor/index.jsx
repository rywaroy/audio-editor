import { useMemo, useEffect, useState } from 'react';
import Editor from './editor';
import Mock from 'mockjs';

// const list = [];
// let index = 0;

// for (let i = 0; i < 150; i++) {
//     const p = {};
//     p.words = [];
//     p.roleName = '说话人';
//     index += 1000;
//     p.pTime = [index];
//     for (let j = 0; j < 400; j++) {
//         const w = {
//             time: [index],
//             text: Mock.Random.cword() + Mock.Random.cword(),
//         }
//         index += 1000;
//         w.time[1] = index;
//         p.words.push(w);
//     }
//     p.pTime[1] = index;
//     list.push(p);
// }

const content = [
    {
        roleName: '说话人',
        pTime: [0, 4000],
        words: [
            { text: '这是', time: [0, 1000] },
            { text: '第一', time: [1000, 2000] },
            { text: '段', time: [2000, 3000] },
            { text: '话。', time: [3000, 4000] },
        ],
    },
    {
        roleName: '说话人',
        pTime: [4000, 8000],
        words: [
            { text: '这是12345', time: [4000, 5000] },
            { text: '第二', time: [5000, 6000] },
            { text: '段', time: [6000, 7000] },
            { text: '话。', time: [7000, 8000] },
        ],
    },
    {
        roleName: '说话人',
        pTime: [8000, 12000],
        words: [
            { text: '这是', time: [8000, 9000] },
            { text: '第三', time: [9000, 10000] },
            { text: '段', time: [10000, 11000] },
            { text: '话。', time: [11000, 12000] },
        ],
    },
    {
        roleName: '说话人',
        pTime: [12000, 16000],
        words: [
            { text: '这是', time: [12000, 13000] },
            { text: '第四', time: [13000, 14000] },
            { text: '段', time: [14000, 15000] },
            { text: '话。', time: [15000, 16000] },
        ],
    },
];

const newContent = [
    {
        roleName: '说话人1',
        pTime: [0, 4000],
        words: [
            { text: '这是', time: [0, 1000] },
            { text: '第一', time: [1000, 2000] },
            { text: '段', time: [2000, 3000] },
            { text: '话。', time: [3000, 4000] },
            
        ],
    },
    {
        roleName: '说话人',
        pTime: [4000, 8000],
        words: [
            { text: '这是', time: [4000, 5000] },
            { text: '第二', time: [5000, 6000] },
            { text: '段', time: [6000, 7000] },
            { text: '话。', time: [7000, 8000] },
        ],
    },
    // {
    //     roleName: "说话人",
    //     pTime: [8000, 12000],
    //     words: [
    //         { text: '这是', time: [8000, 9000] },
    //         { text: '第三', time: [9000, 10000] },
    //         { text: '段', time: [10000, 11000] },
    //         { text: '话。', time: [11000, 12000] },
    //     ]
    // },
    // {
    //     roleName: "说话人",
    //     pTime: [12000, 16000],
    //     words: [
    //         { text: '这是', time: [12000, 13000] },
    //         { text: '第四', time: [13000, 14000] },
    //         { text: '段', time: [14000, 15000] },
    //         { text: '话。', time: [15000, 16000] },
    //     ]
    // },
];

export default function EditorComponent() {
    const [json, setJson] = useState('');
    const [ifShowSpeakerRole, setRole] = useState(false);
    const [ifShowSpeakerTime, setTime] = useState(false);
    const [editor, setEditor] = useState(null);

    useEffect(() => {
        // console.log(document.getElementById('editor'))
        //
        // console.log(JSON.stringify(editor.content, null, 4))
        // patch(, contentToVnode(editor.content));
        const editor = new Editor(document.getElementById('editor'));
        editor.on('onChange', (content, vnode) => {
            setJson(JSON.stringify(content, null, 4));
            console.log(vnode);
        });
        editor.setContent(content);
        setEditor(editor);
        // document.getElementById('btn').addEventListener('click', () => {
        //     editor.updateContent(newContent);
        // })

        // setTimeout(() => {
        //     const list2 = JSON.parse(JSON.stringify(list));
        //     list2[0].words[2].text = list2[0].words[2].text.slice(0 ,1);
        //     editor.updateContent(list2);
        // }, 8000)
    }, []);

    const change = () => {
        // editor.updateContent(newContent);
        const list2 = JSON.parse(JSON.stringify(list));
        // list2[0].roleName = '说话人';
        list2[0].words[2].text = list2[0].words[2].text.slice(0 ,1);
        console.time('t');
        editor.updateContent(list2);
        console.timeEnd('t');
    };

    const changeRole = () => {
        const showRole = !ifShowSpeakerRole;
        setRole(showRole);
        // console.time('t');
        editor.updateSpeaker(showRole, ifShowSpeakerTime);
        // console.timeEnd('t');
        // setTimeout(() => {
        //     console.timeEnd('t');
        // }, 0)
    };

    const changeTime = () => {
        const showTime = !ifShowSpeakerTime;
        setTime(showTime);
        editor.updateSpeaker(ifShowSpeakerRole, showTime);
    };

    return (
        <div>
            <div id="editor" className="task-editor-area" contentEditable></div>
            <pre className="pre">{json}</pre>
            <button id="btn" onClick={change}>
                按钮
            </button>
            <button id="role" onClick={changeRole}>
                说话人
            </button>
            <button id="time" onClick={changeTime}>
                时间
            </button>
            <p>sdfs</p>
        </div>
    );
}
