import type { ReactNode } from 'react';
import './AuthLayout.css';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <main className='auth-layout'>
      <section className='auth-hero' aria-labelledby='auth-hero-title'>
        <div className='auth-hero-badge'>Mounjaro Shot & Weight Tracker</div>

        <h1 id='auth-hero-title'>Keep track.</h1>

        <p>Log your weekly Mounjaro shots, weight, and goal progress in one simple place.</p>

        <ul className='auth-hero-pills'>
          <li>Shots</li>
          <li>Weight</li>
          <li>Goal</li>
        </ul>
      </section>

      <section className='auth-form-panel' aria-label='Authentication form'>
        {children}
      </section>
    </main>
  );
};
