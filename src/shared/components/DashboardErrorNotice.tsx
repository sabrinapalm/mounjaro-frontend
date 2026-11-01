import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import './DashboardErrorNotice.css';
import { Button } from './Button';

interface DashboardErrorNoticeProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const DashboardErrorNotice = ({
  title = 'Something could not be loaded',
  message,
  onRetry,
}: DashboardErrorNoticeProps) => {
  return (
    <section className='dashboard-error-notice' role='alert'>
      <div className='dashboard-error-notice__icon' aria-hidden='true'>
        <FiAlertCircle size={20} />
      </div>

      <div className='dashboard-error-notice__content'>
        <h2 className='dashboard-error-notice__title'>{title}</h2>
        <p className='dashboard-error-notice__message'>{message}</p>
      </div>

      {onRetry ? (
        <Button icon={<FiRefreshCw size={16} />} variant='outline' color='danger' onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </section>
  );
};
