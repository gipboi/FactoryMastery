import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import styles from "./styles.module.scss";

interface IEditorProps {
  value: string;
  setValue: (value: string) => void;
}

export const Editor = ({ value, setValue, ...props }: IEditorProps) => {
  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
  ];

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image"],
      ["clean"],
    ],
  };

  const QuillComponent = ReactQuill as any;

  return (
    <div className={styles.editorContainer}>
      <QuillComponent
        theme="snow"
        className={styles.editor}
        value={value}
        modules={modules}
        formats={formats}
        onChange={setValue}
        {...props}
      />
    </div>
  );
};
