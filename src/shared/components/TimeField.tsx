import { FiClock } from 'react-icons/fi';
import './TimeField.css';

interface TimeFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

const formatTimeLabel = (value: string) => {
  if (!value) {
    return 'Select time';
  }

  return value;
};

export const TimeField = ({
  id,
  label,
  value,
  onChange,
  disabled = false,
  required = true,
}: TimeFieldProps) => {
  return (
    <div className='time-field'>
      <label className='time-field__label' htmlFor={id}>
        {label}
      </label>

      <div className='time-field__control'>
        <div className='time-field__mobile-display' aria-hidden='true'>
          <FiClock className='time-field__icon' size={19} />
          <span>{formatTimeLabel(value)}</span>
        </div>

        <input
          id={id}
          className='time-field__native-input'
          type='time'
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          required={required}
          aria-label={label}
        />
      </div>
    </div>
  );
};
