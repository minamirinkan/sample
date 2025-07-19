// SubjectSelect.jsx
import CreatableSelect from 'react-select/creatable';

const SubjectSelect = ({ value, onChange, subjectOptions }) => {
    // react-select 用に変換
    const options = subjectOptions.map((s) => ({ value: s, label: s }));

    const handleChange = (selectedOption) => {
        onChange(selectedOption?.value || '');
    };

    return (
        <CreatableSelect
            isClearable
            onChange={handleChange}
            options={options}
            value={value ? { value, label: value } : null}
            placeholder="科目を選択または入力"
        />
    );
};

export default SubjectSelect;
