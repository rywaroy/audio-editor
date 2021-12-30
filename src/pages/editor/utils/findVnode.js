export default function findVnode(element, vnode) {
    let vn = null;

    const dfs = (e, v) => {
        if (v.elm === e) {
            vn = v;
        } else {
            if (v.children) {
                for (let i = 0; i < v.children.length; i++) {
                    dfs(e, v.children[i]);
                }
            }
        }
    }
    dfs(element, vnode);

    return vn;
}

export function findPath(element, vnode) {
    const vn = findVnode(element, vnode);
    let path = null;

    if (vn && vn.data && vn.data.exc && vn.data.exc.path) {
        path = vn.data.exc.path;
    }

    return path;
}

export function findTime(element, vnode) {
    const vn = findVnode(element, vnode);
    const time = [];

    if (vn && vn.data && vn.data.exc) {
        time[0] = vn.data.exc.st;
        time[1] = vn.data.exc.et;
    }

    return time;
}