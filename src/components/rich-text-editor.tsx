"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Code,
    Image as ImageIcon,
    Table as TableIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Highlighter,
    Palette,
    Undo,
    Redo,
    Minus,
    Upload,
} from "lucide-react";
import { useCallback, useRef } from "react";

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

const COLORS = [
    "#000000", "#434343", "#666666", "#999999",
    "#EF4444", "#F97316", "#EAB308", "#22C55E",
    "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899",
];

const HIGHLIGHT_COLORS = [
    "#FEF9C3", "#FEF3C7", "#DCFCE7", "#DBEAFE",
    "#EDE9FE", "#FCE7F3", "#FEE2E2", "#F1F5F9",
];

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
                blockquote: { HTMLAttributes: { class: "border-l-4 border-primary/30 pl-4 italic text-muted-foreground" } },
                codeBlock: { HTMLAttributes: { class: "bg-muted rounded-lg p-4 font-mono text-sm" } },
            }),
            Underline,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Highlight.configure({ multicolor: true }),
            TextStyle,
            Color,
            Image.configure({ inline: false, allowBase64: true }),
            Table.configure({ resizable: true }),
            TableRow,
            TableCell,
            TableHeader,
            Placeholder.configure({ placeholder: placeholder || "Start writing your story..." }),
        ],
        content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "prose prose-lg max-w-none focus:outline-none min-h-[500px] px-0 py-4",
            },
        },
    });

    const handleImageUpload = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file || !editor) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                editor.chain().focus().setImage({ src: base64 }).run();
            };
            reader.readAsDataURL(file);
            e.target.value = "";
        },
        [editor]
    );

    const addImageFromUrl = useCallback(() => {
        if (!editor) return;
        const url = prompt("Enter image URL:");
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    const addTable = useCallback(() => {
        if (!editor) return;
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }, [editor]);

    if (!editor) return null;

    return (
        <div className="flex flex-col flex-1">
            {/* Toolbar */}
            <div className="sticky top-16 z-[5] bg-background/95 backdrop-blur border-b border-border/40 px-2 py-1.5 flex flex-wrap items-center gap-0.5">
                {/* Text Formatting */}
                <ToolbarGroup>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        active={editor.isActive("bold")}
                        title="Bold"
                    >
                        <Bold className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        active={editor.isActive("italic")}
                        title="Italic"
                    >
                        <Italic className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        active={editor.isActive("underline")}
                        title="Underline"
                    >
                        <UnderlineIcon className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        active={editor.isActive("strike")}
                        title="Strikethrough"
                    >
                        <Strikethrough className="h-4 w-4" />
                    </ToolbarButton>
                </ToolbarGroup>

                <ToolbarDivider />

                {/* Headings */}
                <ToolbarGroup>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        active={editor.isActive("heading", { level: 1 })}
                        title="Heading 1"
                    >
                        <Heading1 className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        active={editor.isActive("heading", { level: 2 })}
                        title="Heading 2"
                    >
                        <Heading2 className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        active={editor.isActive("heading", { level: 3 })}
                        title="Heading 3"
                    >
                        <Heading3 className="h-4 w-4" />
                    </ToolbarButton>
                </ToolbarGroup>

                <ToolbarDivider />

                {/* Lists & Block */}
                <ToolbarGroup>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        active={editor.isActive("bulletList")}
                        title="Bullet List"
                    >
                        <List className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        active={editor.isActive("orderedList")}
                        title="Ordered List"
                    >
                        <ListOrdered className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        active={editor.isActive("blockquote")}
                        title="Quote"
                    >
                        <Quote className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        active={editor.isActive("codeBlock")}
                        title="Code Block"
                    >
                        <Code className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        title="Divider"
                    >
                        <Minus className="h-4 w-4" />
                    </ToolbarButton>
                </ToolbarGroup>

                <ToolbarDivider />

                {/* Alignment */}
                <ToolbarGroup>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign("left").run()}
                        active={editor.isActive({ textAlign: "left" })}
                        title="Align Left"
                    >
                        <AlignLeft className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign("center").run()}
                        active={editor.isActive({ textAlign: "center" })}
                        title="Align Center"
                    >
                        <AlignCenter className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign("right").run()}
                        active={editor.isActive({ textAlign: "right" })}
                        title="Align Right"
                    >
                        <AlignRight className="h-4 w-4" />
                    </ToolbarButton>
                </ToolbarGroup>

                <ToolbarDivider />

                {/* Colors */}
                <ToolbarGroup>
                    <div className="relative group">
                        <ToolbarButton title="Text Color">
                            <Palette className="h-4 w-4" />
                        </ToolbarButton>
                        <div className="absolute top-full left-0 mt-1 bg-background border border-border/60 rounded-xl shadow-xl p-2.5 hidden group-hover:grid grid-cols-4 gap-1.5 z-50 min-w-[140px]">
                            {COLORS.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => editor.chain().focus().setColor(color).run()}
                                    className="w-6 h-6 rounded-full border border-border/40 hover:scale-125 transition-transform cursor-pointer shadow-sm"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                            <button
                                onClick={() => editor.chain().focus().unsetColor().run()}
                                className="col-span-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground mt-1 py-0.5 cursor-pointer"
                            >
                                Reset Color
                            </button>
                        </div>
                    </div>
                    <div className="relative group">
                        <ToolbarButton title="Highlight">
                            <Highlighter className="h-4 w-4" />
                        </ToolbarButton>
                        <div className="absolute top-full left-0 mt-1 bg-background border border-border/60 rounded-xl shadow-xl p-2.5 hidden group-hover:grid grid-cols-4 gap-1.5 z-50 min-w-[140px]">
                            {HIGHLIGHT_COLORS.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
                                    className="w-6 h-6 rounded-full border border-border/40 hover:scale-125 transition-transform cursor-pointer shadow-sm"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                            <button
                                onClick={() => editor.chain().focus().unsetHighlight().run()}
                                className="col-span-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground mt-1 py-0.5 cursor-pointer"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </ToolbarGroup>

                <ToolbarDivider />

                {/* Media & Table */}
                <ToolbarGroup>
                    <ToolbarButton onClick={handleImageUpload} title="Upload Image">
                        <Upload className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={addImageFromUrl} title="Image from URL">
                        <ImageIcon className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={addTable} title="Insert Table">
                        <TableIcon className="h-4 w-4" />
                    </ToolbarButton>
                </ToolbarGroup>

                <ToolbarDivider />

                {/* Undo / Redo */}
                <ToolbarGroup>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        title="Undo"
                    >
                        <Undo className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        title="Redo"
                    >
                        <Redo className="h-4 w-4" />
                    </ToolbarButton>
                </ToolbarGroup>
            </div>

            {/* Editor Content */}
            <div className="flex-1 px-0 py-4">
                <EditorContent editor={editor} />
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    );
}

/* ─── sub-components ─── */

function ToolbarButton({
    onClick,
    active,
    disabled,
    children,
    title,
}: {
    onClick?: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                active
                    ? "bg-primary/10 text-primary"
                    : disabled
                    ? " text-muted-foreground/30 cursor-not-allowed"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
        >
            {children}
        </button>
    );
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
    return <div className="flex items-center gap-0.5">{children}</div>;
}

function ToolbarDivider() {
    return <div className="w-px h-5 bg-border/50 mx-1" />;
}
