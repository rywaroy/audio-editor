import { useMemo, useState, useCallback } from 'react';
import { createEditor, Transforms, Editor, Text, Selection, Range } from 'slate';
import { Slate, Editable, withReact } from '@/slate-react'

export default function IndexPage() {

  const editor = useMemo(() => withReact(createEditor()), [])

  const [value, setValue] = useState([
    {
      type: 'paragraph',
      children: [{ text: 'A line of text in a paragraph.' }],
    },
  ])

  const hundleClick = () => {
    // editor.insertText("and")
    console.log(editor)
  }

  const renderElement = useCallback(props => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />
      default:
        return <DefaultElement {...props} />
    }
  }, [])

  // 通过 useCallback 定义一个可以记忆的渲染叶子节点的函数
  const renderLeaf = useCallback(props => {
    return <Leaf {...props} />
  }, [])

  return (
    <div>
      <Slate editor={editor} value={value} onChange={value => setValue(value)}>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={event => {
          if (event.ctrlKey) {
						// 阻止插入 "`" 的默认行为。
            event.preventDefault()
            // 否则，把当前选择的 blocks 的类型设为 "code"
            // 确定当前选中的块是否为任意的代码块.
            switch (event.key) {
              // 当按下 "`" ，保留我们代码块存在的逻辑
              case '`': {
                event.preventDefault()
                const [match] = Editor.nodes(editor, {
                  match: n => n.type === 'code',
                })
                Transforms.setNodes(
                  editor,
                  { type: match ? 'paragraph' : 'code' },
                  { match: n => Editor.isBlock(editor, n) }
                )
                break
              }
  
              // 当按下 "B" ，加粗所选择的文本
              case 'b': {
                event.preventDefault()
                const [match] = Editor.nodes(editor, {
                  match: n => n.bold,
                })
                Transforms.setNodes(
                  editor,
                  { bold: !match },
                  // 应用到文本节点上，
                  // 如果所选内容仅仅是全部文本的一部分，则拆分它们。
                  { match: n => Text.isText(n), split: true }
                )
                break
              }

              case 'i': {
                event.preventDefault()
                Transforms.setNodes(
                  editor,
                  { i: true },
                  // 应用到文本节点上，
                  // 如果所选内容仅仅是全部文本的一部分，则拆分它们。
                  { match: n => Text.isText(n), split: true }
                )
                break
              }
            }
          }
        }}
        onMouseUp={event => {
          console.log(Range.isCollapsed(editor.selection!))
        }}
      />
    </Slate>
      <button onClick={hundleClick}>按钮</button>
    </div>
    
  )
}

const Leaf = props => {
  return (
    <span
      {...props.attributes}
      style={{ 
        fontWeight: props.leaf.bold ? 'bold' : 'normal',
        fontStyle: props.leaf.i ? 'oblique' : 'none'
      }}
    >
      {props.children}
    </span>
  )
}

const CodeElement = props => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  )
}

const DefaultElement = props => {
  return <p {...props.attributes}>{props.children}</p>
}