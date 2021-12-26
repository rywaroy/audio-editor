import { useState } from 'react';

export default function TestComponent () {

    const [text, setText] = useState('一二三四五')
    const [num, setNum] = useState(2);


    const keydown = (ev) => {
        ev.preventDefault();

        setText(text.substring(0, num) + '1' + text.substring(num, text.length));
        setNum(num + 1);

        setTimeout(() => {
            const t = document.querySelector('.text-span');
            const range = window.document.createRange()
            range.setStart(t.childNodes[0], num + 1);
            range.setEnd(t.childNodes[0], num + 1);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        })
    }

    return (
        <div contentEditable suppressContentEditableWarning onKeyDown={keydown}>
            <span className="text-span">{text}</span>
        </div>
    )
}