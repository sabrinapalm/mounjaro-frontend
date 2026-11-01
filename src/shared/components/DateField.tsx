import { useRef } from 'react';
import { FiCalendar } from 'react-icons/fi';
import './DateField.css';
import { formatDateLabel } from '../utils/dateHelpers';

interface DateFieldProps {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  required?: boolean;
  onChange: (value: string) => void;
}

type DateInputElement = HTMLInputElement & {
  showPicker?: () => void;
};

export const DateField = ({
  id,
  label,
  value,
  disabled = false,
  required = true,
  onChange,
}: DateFieldProps) => {
  const inputRef = useRef<DateInputElement | null>(null);
  const displayDate = value ? formatDateLabel(value) : 'Select date';

  const handleOpenPicker = () => {
    if (disabled) {
      return;
    }

    const input = inputRef.current;

    if (!input) {
      return;
    }

    input.focus();

    if (input.showPicker) {
      input.showPicker();
      return;
    }

    input.click();
  };

  return (
    <div className='date-field'>
      <label className='date-field__label' htmlFor={id}>
        {label}
      </label>

      <div className='date-field__control'>
        <button
          type='button'
          className='date-field__button'
          onClick={handleOpenPicker}
          disabled={disabled}
          aria-label={`${label}: ${displayDate}`}
        >
          <FiCalendar className='date-field__icon' size={20} aria-hidden='true' />
          <span>{displayDate}</span>
        </button>

        <input
          ref={inputRef}
          id={id}
          className='date-field__native-input'
          type='date'
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          required={required}
          tabIndex={-1}
          aria-hidden='true'
        />
      </div>
    </div>
  );
};
