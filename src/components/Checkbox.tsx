
import React from 'react';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => {
  return (
    <label className="flex items-center space-x-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
      />
      <span className="text-gray-700 capitalize">{label}</span>
    </label>
  );
};

export default Checkbox;