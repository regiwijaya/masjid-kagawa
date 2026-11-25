import { forwardRef, useCallback, useMemo } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { sanitizeHtml } from "../../utils/sanitizeHtml";

// Sanitize both persisted HTML entering Quill and semantic HTML leaving it.
// Quill 2.0.3's HTML export advisory has no upstream patched release yet.
const RichTextEditor = forwardRef(function RichTextEditor({ value, onChange, ...props }, ref) {
  const safeValue = useMemo(() => sanitizeHtml(value), [value]);
  const handleChange = useCallback((html, delta, source, editor) => {
    onChange?.(sanitizeHtml(html), delta, source, editor);
  }, [onChange]);

  return <ReactQuill
    {...props}
    ref={ref}
    value={safeValue}
    onChange={handleChange}
    useSemanticHTML
  />;
});

export default RichTextEditor;
