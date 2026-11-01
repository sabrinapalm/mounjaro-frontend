import './LinearLoader.css';

type LinearLoaderVariant = 'primary' | 'accent';

type LinearLoaderSize = 'sm' | 'md' | 'lg';

type LinearLoaderProps = {
  isLoading?: boolean;
  label?: string;
  variant?: LinearLoaderVariant;
  size?: LinearLoaderSize;
  fullWidth?: boolean;
  className?: string;
};

export const LinearLoader = ({
  isLoading = true,
  label,
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  className = '',
}: LinearLoaderProps) => {
  if (!isLoading) {
    return null;
  }

  const loaderClassName = [
    'linear-loader',
    `linear-loader--${variant}`,
    `linear-loader--${size}`,
    fullWidth ? 'linear-loader--full-width' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={loaderClassName} role='status' aria-live='polite'>
      {label && <span className='linear-loader__label'>{label}</span>}

      <div className='linear-loader__track' aria-hidden='true'>
        <div className='linear-loader__bar' />
      </div>
    </div>
  );
};
