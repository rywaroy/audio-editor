import Hotkeys from '../utils/hotkeys';

export default function onKeyDown(e) {
    if (Hotkeys.isRedo(e)) {
        e.preventDefault();
        this.redoHistory();
    }

    if (Hotkeys.isUndo(e)) {
        e.preventDefault();
        this.undoHistory();
    }
}