'use client';
import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
}

const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
    return (
        <Editor
            apiKey='15sok0wr1zbg0h0wyl9pjha6dxkyd84r6eiyd3qq6wbuzlc1' // Replace with your TinyMCE API key
            value={value}
            onEditorChange={onChange}

            init={{
                height: 300,
                readonly: false,
                menubar: false,
                editable_root: true,
                plugins: [
                    'anchor', 'code', 'autolink', 'charmap', 'codesample', 'emoticons',
                    'link', 'lists', 'media', 'searchreplace', 'table',
                    'visualblocks', 'wordcount',
                    // ✅ REQUIRED for HTML source view
                ],
                toolbar: `
                    undo redo | blocks fontfamily fontsize | code |
                    bold italic underline strikethrough |
                    link media table |
                    align lineheight |
                    numlist bullist indent outdent |
                    emoticons charmap |
                    removeformat
                    `,
                uploadcare_public_key: 'd4951fe062c575aedef8',
            }}
        />
    );
};

export default RichTextEditor;
