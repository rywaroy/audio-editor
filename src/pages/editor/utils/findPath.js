export default function findPath(element, vnode) {
    let path = null;

    const dfs = (e, v) => {
        if (v.elm === e) {
            if (v.data && v.data.exc && v.data.exc.path) {
                path = v.data.exc.path;
            }
        } else {
            if (v.children) {
                for (let i = 0; i < v.children.length; i++) {
                    dfs(e, v.children[i]);
                }
            }
        }
    }
    dfs(element, vnode);

    return path;
}
