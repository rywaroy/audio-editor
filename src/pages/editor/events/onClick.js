import { findTime } from "../utils/findVnode";

export default function onClick(e) {
    if (e.target.classList.contains('editor-vad')) {
        const time = findTime(e.target, this.vnode);
        this.currentTime = time[0] / 1000;
        this.update();
    }
}