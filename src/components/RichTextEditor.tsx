import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import CodeBlock from '@tiptap/extension-code-block'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import { Markdown } from 'tiptap-markdown'
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  SquareCode,
  CheckSquare,
  Table as TableIcon
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  simpleMode?: boolean
  disableHtml?: boolean
  markdownMode?: boolean
}

const FormattingButton = ({ 
  onClick, 
  active, 
  children,
  title
}: {
  onClick: (e: React.MouseEvent) => void
  active?: boolean
  children: React.ReactNode
  title: string
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onClick(e)
  }

  return (
    <button
      onClick={handleClick}
      title={title}
      className={`p-2 rounded hover:bg-gray-100 ${active ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}
    >
      {children}
    </button>
  )
}

export const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder,
  simpleMode = false,
  disableHtml = false,
  markdownMode = false
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start typing...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'list-disc pl-4',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'list-decimal pl-4',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'pl-4',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start',
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 p-2 rounded font-mono',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Markdown.configure({
        html: !disableHtml,
        transformCopiedText: true,
        transformPastedText: true,
        bulletListMarker: '*',
        linkify: true,
        breaks: true,
      }),
    ],
    content: markdownMode ? value : convertMarkdownToHtml(value),
    onUpdate: ({ editor }) => {
      const content = markdownMode 
        ? editor.storage.markdown.getMarkdown() 
        : disableHtml 
          ? editor.getText() 
          : editor.getHTML()
      onChange(content)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[100px]',
      },
    },
    editable: true,
  })

  if (!editor) return null

  // Helper function to convert markdown to HTML for initial content
  function convertMarkdownToHtml(markdown: string): string {
    if (!markdown) return ''
    // Enhanced conversion that handles task lists and tables
    return markdown
      // Headers
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      // Text formatting
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Lists
      .replace(/^\* (.*$)/gm, '<ul><li>$1</li></ul>')
      .replace(/^1\. (.*$)/gm, '<ol><li>$1</li></ol>')
      // Task lists
      .replace(/^- \[ \] (.*$)/gm, '<ul data-type="taskList"><li data-type="taskItem" data-checked="false">$1</li></ul>')
      .replace(/^- \[x\] (.*$)/gm, '<ul data-type="taskList"><li data-type="taskItem" data-checked="true">$1</li></ul>')
      // Tables (simple support)
      .replace(/^\|(.+)\|$/gm, (match, content) => {
        const cells = content.split('|').map(cell => `<td>${cell.trim()}</td>`).join('')
        return `<table><tr>${cells}</tr></table>`
      })
  }

  const addTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run()
  }

  return (
    <div className="min-h-[150px] w-full rounded-md border border-input bg-background">
      <div className="border-b p-2 flex gap-1 flex-wrap">
        <FormattingButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </FormattingButton>
        
        <FormattingButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </FormattingButton>
        
        <FormattingButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Align left"
        >
          <AlignLeft className="w-4 h-4" />
        </FormattingButton>
        
        <FormattingButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Align center"
        >
          <AlignCenter className="w-4 h-4" />
        </FormattingButton>
        
        <FormattingButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Align right"
        >
          <AlignRight className="w-4 h-4" />
        </FormattingButton>
        
        <FormattingButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </FormattingButton>
        
        <FormattingButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </FormattingButton>
        
        <FormattingButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </FormattingButton>
        
        <FormattingButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet list"
        >
          <List className="w-4 h-4" />
        </FormattingButton>
        
        <FormattingButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered list"
        >
          <ListOrdered className="w-4 h-4" />
        </FormattingButton>
        
        <FormattingButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          active={editor.isActive('taskList')}
          title="Task list"
        >
          <CheckSquare className="w-4 h-4" />
        </FormattingButton>
        
        <FormattingButton
          onClick={() => addTable()}
          active={editor.isActive('table')}
          title="Insert table"
        >
          <TableIcon className="w-4 h-4" />
        </FormattingButton>
        
        <FormattingButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          title="Code block"
        >
          <SquareCode className="w-4 h-4" />
        </FormattingButton>
      </div>
      <div className="px-3 py-2">
        <EditorContent editor={editor} />
      </div>
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex gap-1 bg-white p-1 rounded shadow border">
            <FormattingButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </FormattingButton>
            <FormattingButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </FormattingButton>
          </div>
        </BubbleMenu>
      )}
    </div>
  )
}