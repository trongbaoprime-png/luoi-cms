"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextAlign } from "@tiptap/extension-text-align";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { Underline } from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Table as TableIcon,
  ImageIcon,
  Link as LinkIcon,
  Minus,
  Palette,
  Code,
  Maximize2,
  Minimize2,
  MoveLeft,
  MoveRight,
  Sliders,
  Sparkles,
} from "lucide-react";

interface CkEditorModuleProps {
  value: string;
  onChange: (data: string) => void;
  onOpenMediaPicker?: () => void;
}

const COLOR_PRESETS = [
  { name: "Đen", hex: "#1c1917" },
  { name: "Teal", hex: "#0d9488" },
  { name: "Đỏ Rose", hex: "#e11d48" },
  { name: "Xanh Dương", hex: "#2563eb" },
  { name: "Xanh Lá", hex: "#16a34a" },
  { name: "Cam Amber", hex: "#d97706" },
  { name: "Xám Tối", hex: "#475569" },
];

// Custom Image Extension with width, alignment & button effect support
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute("width") || element.style.width || null,
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return {
            width: attributes.width,
            style: `width: ${attributes.width}; max-width: 100%; height: auto;`,
          };
        },
      },
      alignment: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-align") || "center",
        renderHTML: (attributes) => {
          const align = attributes.alignment || "center";
          let alignStyle = "display: block; margin: 1rem auto;";
          if (align === "left") alignStyle = "display: block; margin: 1rem auto 1rem 0;";
          if (align === "right") alignStyle = "display: block; margin: 1rem 0 1rem auto;";
          return {
            "data-align": align,
            style: alignStyle,
          };
        },
      },
      effect: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-effect") || null,
        renderHTML: (attributes) => {
          if (!attributes.effect) return {};
          const effClass = `cta-${attributes.effect}`;
          return {
            "data-effect": attributes.effect,
            class: `rounded-2xl my-4 object-cover shadow-md transition-all max-w-full ${effClass}`,
          };
        },
      },
    };
  },
});

export default function CkEditorModule({ value, onChange, onOpenMediaPicker }: CkEditorModuleProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      CustomImage.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-2xl my-4 object-cover shadow-md transition-all max-w-full",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#0d9488] font-semibold underline hover:text-[#0f766e]",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse border border-stone-300 my-4 w-full text-sm",
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-stone-300 bg-stone-100 p-2 font-bold text-left",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-stone-300 p-2",
        },
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync value if changed externally (e.g. inserting image or AI generation)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!isMounted || !editor) {
    return (
      <div className="p-12 bg-stone-50 border border-stone-200 rounded-2xl text-center text-xs font-semibold text-stone-400">
        Đang nạp trình soạn thảo cao cấp đầy đủ tính năng...
      </div>
    );
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Nhập đường dẫn liên kết (URL):", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const handleCustomImageWidth = () => {
    const currentWidth = editor.getAttributes("image").width || "300px";
    const customWidth = window.prompt("Nhập kích thước chiều rộng ảnh (VD: 280px hoặc 70%):", currentWidth);
    if (customWidth) {
      editor.chain().focus().updateAttributes("image", { width: customWidth }).run();
    }
  };

  const isImageActive = editor.isActive("image");
  const currentImageEffect = editor.getAttributes("image").effect || "";

  return (
    <div className="rich-editor-wrapper bg-white rounded-b-2xl shadow-xs">
      {/* Comprehensive Rich Toolbar - Sticky Fixed Header */}
      <div className="bg-stone-100/95 backdrop-blur-md p-2 border-b border-stone-300 flex flex-wrap items-center justify-between gap-1.5 sticky top-[108px] z-20 shadow-xs">
        <div className="flex flex-wrap items-center gap-1">
          {/* Headings Dropdown */}
          <select
            value={
              editor.isActive("heading", { level: 1 })
                ? "h1"
                : editor.isActive("heading", { level: 2 })
                ? "h2"
                : editor.isActive("heading", { level: 3 })
                ? "h3"
                : editor.isActive("heading", { level: 4 })
                ? "h4"
                : "p"
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val === "p") editor.chain().focus().setParagraph().run();
              else if (val === "h1") editor.chain().focus().toggleHeading({ level: 1 }).run();
              else if (val === "h2") editor.chain().focus().toggleHeading({ level: 2 }).run();
              else if (val === "h3") editor.chain().focus().toggleHeading({ level: 3 }).run();
              else if (val === "h4") editor.chain().focus().toggleHeading({ level: 4 }).run();
            }}
            className="px-2.5 py-1 text-xs font-bold border border-stone-300 rounded-lg bg-white text-stone-800 focus:outline-none"
          >
            <option value="p">Đoạn văn (Normal)</option>
            <option value="h1">Thẻ H1 (Tiêu đề chính)</option>
            <option value="h2">Thẻ H2 (Tiêu đề lớn)</option>
            <option value="h3">Thẻ H3 (Tiêu đề phụ)</option>
            <option value="h4">Thẻ H4 (Tiêu đề nhỏ)</option>
          </select>

          <span className="w-px h-5 bg-stone-300 mx-1" />

          {/* Basic Formatting */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg text-stone-700 transition-colors ${
              editor.isActive("bold") ? "bg-stone-300 font-bold text-stone-900 shadow-xs" : "hover:bg-stone-200"
            }`}
            title="In đậm (Bold - Ctrl+B)"
          >
            <Bold size={15} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg text-stone-700 transition-colors ${
              editor.isActive("italic") ? "bg-stone-300 text-stone-900 shadow-xs" : "hover:bg-stone-200"
            }`}
            title="In nghiêng (Italic - Ctrl+I)"
          >
            <Italic size={15} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded-lg text-stone-700 transition-colors ${
              editor.isActive("underline") ? "bg-stone-300 text-stone-900 shadow-xs" : "hover:bg-stone-200"
            }`}
            title="Gạch chân (Underline - Ctrl+U)"
          >
            <UnderlineIcon size={15} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded-lg text-stone-700 transition-colors ${
              editor.isActive("strike") ? "bg-stone-300 text-stone-900 shadow-xs" : "hover:bg-stone-200"
            }`}
            title="Gạch ngang (Strikethrough)"
          >
            <Strikethrough size={15} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded-lg text-stone-700 transition-colors ${
              editor.isActive("code") ? "bg-stone-300 text-stone-900 shadow-xs" : "hover:bg-stone-200"
            }`}
            title="Mã Code"
          >
            <Code size={15} />
          </button>

          {/* Text Color Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorMenu(!showColorMenu)}
              className="p-1.5 rounded-lg text-stone-700 hover:bg-stone-200 flex items-center gap-1"
              title="Màu chữ (Text Color)"
            >
              <Palette size={15} />
              <span
                className="w-3 h-3 rounded-full border border-stone-300 inline-block"
                style={{ backgroundColor: editor.getAttributes("textStyle").color || "#1c1917" }}
              />
            </button>

            {showColorMenu && (
              <div className="absolute left-0 top-full mt-1 p-2 bg-white border border-stone-200 rounded-xl shadow-lg z-30 flex gap-1.5">
                {COLOR_PRESETS.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => {
                      editor.chain().focus().setColor(col.hex).run();
                      setShowColorMenu(false);
                    }}
                    className="w-5 h-5 rounded-full border border-stone-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  />
                ))}
              </div>
            )}
          </div>

          <span className="w-px h-5 bg-stone-300 mx-1" />

          {/* Full Alignment Tools */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`p-1.5 rounded-lg text-stone-700 transition-colors ${
              editor.isActive({ textAlign: "left" }) ? "bg-[#0d9488] text-white shadow-xs" : "hover:bg-stone-200"
            }`}
            title="Canh trái (Left Align)"
          >
            <AlignLeft size={15} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`p-1.5 rounded-lg text-stone-700 transition-colors ${
              editor.isActive({ textAlign: "center" }) ? "bg-[#0d9488] text-white shadow-xs" : "hover:bg-stone-200"
            }`}
            title="Canh giữa (Center Align)"
          >
            <AlignCenter size={15} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`p-1.5 rounded-lg text-stone-700 transition-colors ${
              editor.isActive({ textAlign: "right" }) ? "bg-[#0d9488] text-white shadow-xs" : "hover:bg-stone-200"
            }`}
            title="Canh phải (Right Align)"
          >
            <AlignRight size={15} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={`p-1.5 rounded-lg text-stone-700 transition-colors ${
              editor.isActive({ textAlign: "justify" }) ? "bg-[#0d9488] text-white shadow-xs" : "hover:bg-stone-200"
            }`}
            title="Canh đều 2 bên (Justify Align)"
          >
            <AlignJustify size={15} />
          </button>

          <span className="w-px h-5 bg-stone-300 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-lg text-stone-700 transition-colors ${
              editor.isActive("bulletList") ? "bg-stone-300 text-stone-900 shadow-xs" : "hover:bg-stone-200"
            }`}
            title="Danh sách dấu chấm"
          >
            <List size={15} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-lg text-stone-700 transition-colors ${
              editor.isActive("orderedList") ? "bg-stone-300 text-stone-900 shadow-xs" : "hover:bg-stone-200"
            }`}
            title="Danh sách số thứ tự"
          >
            <ListOrdered size={15} />
          </button>

          <span className="w-px h-5 bg-stone-300 mx-1" />

          {/* Links & Quotes & Table */}
          <button
            type="button"
            onClick={setLink}
            className={`p-1.5 rounded-lg text-stone-700 transition-colors ${
              editor.isActive("link") ? "bg-stone-300 text-stone-900 shadow-xs" : "hover:bg-stone-200"
            }`}
            title="Chèn liên kết URL"
          >
            <LinkIcon size={15} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded-lg text-stone-700 transition-colors ${
              editor.isActive("blockquote") ? "bg-stone-300 text-stone-900 shadow-xs" : "hover:bg-stone-200"
            }`}
            title="Trích dẫn (Blockquote)"
          >
            <Quote size={15} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            className="p-1.5 rounded-lg text-stone-700 hover:bg-stone-200"
            title="Tạo bảng 3x3 (Table)"
          >
            <TableIcon size={15} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-1.5 rounded-lg text-stone-700 hover:bg-stone-200"
            title="Đường phân cách (Horizontal Line)"
          >
            <Minus size={15} />
          </button>

          <span className="w-px h-5 bg-stone-300 mx-1" />

          {/* History Undo / Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-lg text-stone-700 hover:bg-stone-200 disabled:opacity-30"
            title="Hoàn tác (Undo - Ctrl+Z)"
          >
            <Undo size={15} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-lg text-stone-700 hover:bg-stone-200 disabled:opacity-30"
            title="Làm lại (Redo - Ctrl+Y)"
          >
            <Redo size={15} />
          </button>
        </div>

        {/* Action Button: Insert Image from Media Gallery */}
        {onOpenMediaPicker && (
          <button
            type="button"
            onClick={onOpenMediaPicker}
            className="px-3 py-1.5 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
          >
            <ImageIcon size={14} /> + Chèn ảnh từ Thư viện Media
          </button>
        )}
      </div>

      {/* DYNAMIC IMAGE QUICK-CONTROL TOOLBAR WITH BUTTON ANIMATION EFFECTS */}
      {isImageActive && (
        <div className="bg-teal-900 text-white px-3 py-2 border-b border-teal-800 flex flex-wrap items-center justify-between gap-2 text-xs font-sans sticky top-[152px] z-20 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1">
              <Sliders size={13} /> Chỉnh Ảnh / Nút Bấm:
            </span>

            {/* Size Presets */}
            <div className="flex items-center gap-1 bg-teal-950 p-1 rounded-xl border border-teal-800">
              <button
                type="button"
                onClick={() => editor.chain().focus().updateAttributes("image", { width: "auto" }).run()}
                className="px-2 py-1 rounded-lg hover:bg-teal-800 font-semibold transition-colors text-[11px]"
                title="Kích thước ảnh gốc tự nhiên"
              >
                Gốc (Auto)
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().updateAttributes("image", { width: "250px" }).run()}
                className="px-2 py-1 rounded-lg hover:bg-teal-800 font-semibold transition-colors text-[11px]"
                title="Kích thước nhỏ (Dành cho nút bấm hotline/đăng ký)"
              >
                Nhỏ (250px)
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().updateAttributes("image", { width: "450px" }).run()}
                className="px-2 py-1 rounded-lg hover:bg-teal-800 font-semibold transition-colors text-[11px]"
                title="Kích thước vừa"
              >
                Vừa (450px)
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().updateAttributes("image", { width: "650px" }).run()}
                className="px-2 py-1 rounded-lg hover:bg-teal-800 font-semibold transition-colors text-[11px]"
                title="Kích thước lớn"
              >
                Lớn (650px)
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().updateAttributes("image", { width: "100%" }).run()}
                className="px-2 py-1 rounded-lg hover:bg-teal-800 font-semibold transition-colors text-[11px]"
                title="Tràn toàn chiều rộng 100%"
              >
                Full (100%)
              </button>
              <button
                type="button"
                onClick={handleCustomImageWidth}
                className="px-2 py-1 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-lg font-bold transition-colors text-[11px]"
                title="Nhập kích thước tùy chỉnh"
              >
                ✏️ Tùy chỉnh px
              </button>
            </div>

            {/* BUTTON ANIMATION EFFECT SELECTOR */}
            <div className="flex items-center gap-1 bg-teal-950 px-2 py-1 rounded-xl border border-teal-800">
              <Sparkles size={12} className="text-amber-400" />
              <span className="text-[11px] font-bold text-amber-300">Hiệu ứng CTA:</span>
              <select
                value={currentImageEffect}
                onChange={(e) =>
                  editor.chain().focus().updateAttributes("image", { effect: e.target.value || null }).run()
                }
                className="bg-teal-900 text-white font-bold text-[11px] px-2 py-0.5 rounded-lg border border-teal-700 focus:outline-none"
              >
                <option value="">Bình thường (None)</option>
                <option value="pulse">💓 Nhịp đập thu hút (Pulse)</option>
                <option value="shimmer">💫 Vệt sáng lướt (Shimmer)</option>
                <option value="ripple">🌊 Sóng quầng sáng (Ripple Glow)</option>
                <option value="shake">🔔 Lắc nhẹ chú ý (Shake Wiggle)</option>
              </select>
            </div>
          </div>

          {/* Alignment Controls */}
          <div className="flex items-center gap-1 bg-teal-950 p-1 rounded-xl border border-teal-800">
            <button
              type="button"
              onClick={() => editor.chain().focus().updateAttributes("image", { alignment: "left" }).run()}
              className="px-2 py-1 rounded-lg hover:bg-teal-800 font-semibold transition-colors text-[11px] flex items-center gap-1"
            >
              <MoveLeft size={12} /> Trái
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().updateAttributes("image", { alignment: "center" }).run()}
              className="px-2 py-1 rounded-lg hover:bg-teal-800 font-semibold transition-colors text-[11px]"
            >
              Giữa
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().updateAttributes("image", { alignment: "right" }).run()}
              className="px-2 py-1 rounded-lg hover:bg-teal-800 font-semibold transition-colors text-[11px] flex items-center gap-1"
            >
              Phải <MoveRight size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Editor Content Editable Canvas Area */}
      <div className="p-4 md:p-6 bg-white min-h-[400px]">
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        .ProseMirror {
          min-height: 360px;
          outline: none;
          font-size: 0.9375rem;
          line-height: 1.75;
          color: #1c1917;
        }
        .ProseMirror p {
          margin-bottom: 1rem;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          transition: all 0.2s ease-in-out;
        }
        .ProseMirror img.ProseMirror-selectednode {
          outline: 3px solid #0d9488;
          border-radius: 1rem;
        }
        .ProseMirror h1 {
          font-size: 2rem;
          font-weight: 800;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-family: serif;
        }
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          font-family: serif;
        }
        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #0d9488;
          padding-left: 1rem;
          margin-top: 1rem;
          margin-bottom: 1rem;
          font-style: italic;
          color: #44403c;
          background-color: #f5f5f4;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          border-radius: 0 0.75rem 0.75rem 0;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .ProseMirror table {
          border-collapse: collapse;
          margin: 1rem 0;
          width: 100%;
        }
        .ProseMirror th,
        .ProseMirror td {
          border: 1px solid #d6d3d1;
          padding: 0.5rem 0.75rem;
        }
        .ProseMirror th {
          background-color: #f5f5f4;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
