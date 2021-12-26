import vnode from './vnode';
import * as is from './is';

export default function h(sel, b, c) {
    let data = {};
    let children;
    let text;

    // 3个参数都有值
    if (c !== undefined) {
        // 第二个参数有值，作为 data
        if (b !== null) {
            data = b;
        }
        // 第三个参数是数组，作为children
        if (is.array(c)) {
            children = c;
        } else if (is.primitive(c)) {
            // 第三个参数是基础类型，转为 string 作为 text
            text = c.toString();
        } else if (c && c.sel) {
            // 第三个参数是 vnode 实例，作为 children 一员
            children = [c];
        }
    } else if (b !== undefined && b !== null) {
        // 只有2个参数，且 b 有值
        if (is.array(b)) {
            // 第二个参数是数组，作为children
            children = b;
        } else if (is.primitive(b)) {
            // 第二个参数是基础类型，转为 string 作为 text
            text = b.toString();
        } else if (b && b.sel) {
            // 第二个参数是 vnode 实例，作为 children 一员
            children = [b];
        } else {
            // 都不是，则作为 data 的值
            data = b;
        }
    }
    // children 有基础类型值，递归创建 vnode
    if (children !== undefined) {
        for (let i = 0; i < children.length; ++i) {
            if (is.primitive(children[i]))
                children[i] = vnode(
                    undefined,
                    undefined,
                    undefined,
                    children[i],
                    undefined,
                );
        }
    }

    return vnode(sel, data, children, text, undefined);
}
