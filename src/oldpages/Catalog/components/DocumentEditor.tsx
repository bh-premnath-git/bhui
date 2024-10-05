import { useState } from "react";
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css'; 
// import 'src/styles/DocumentEditor.css'
export default function DocumentEditor(){
    const [value, setValue] = useState('');

    const modules = {
        toolbar: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          ['link', 'image'],
          ['clean']
        ]
      };
    
      const formats = [
        'header',
        'bold',
        'italic',
        'underline',
        'strike',
        'blockquote',
        'list',
        'bullet',
        'indent',
        'link',
        'image'
      ];
    const handleChange = (content:any, delta:any, source:any, editor:any) => {
      // Update the state with the new content 
      setValue(content);
    };
    return(<></>
      //   <ReactQuill
      //   theme="snow" // Specify theme ('snow' or 'bubble')
      //   value={value}
      //   modules={modules}
      //   formats={formats}
      //   onChange={handleChange}
      //   style={{ height: '400px' }} // Specify the height of the editor
      // />
    )
}