import { LuArrowRight, LuCheck, LuPlus, LuSave, LuSettings, LuTrash2, LuX } from 'react-icons/lu';

import { Button } from './Button';
import './ButtonShowcase.css';

export const ButtonShowcase = () => {
  return (
    <section className='button-showcase'>
      <header className='button-showcase__header'>
        <p className='button-showcase__eyebrow'>Design system</p>
        <h1>Tracksy Buttons</h1>
        <p>All reusable button variants, colors, sizes and icon options.</p>
      </header>

      <div className='button-showcase__grid'>
        <article className='button-showcase__card'>
          <h2>Outline buttons</h2>
          <p>Use these for secondary actions like add, edit or filter.</p>

          <div className='button-showcase__row'>
            <Button variant='outline' color='secondary'>
              Secondary outline
            </Button>

            <Button variant='outline' color='primary'>
              Primary outline
            </Button>

            <Button variant='outline' color='muted'>
              Muted outline
            </Button>

            <Button variant='outline' color='danger'>
              Danger outline
            </Button>
          </div>
        </article>

        <article className='button-showcase__card'>
          <h2>Outline with icons</h2>
          <p>Use for actions like adding a check-in or opening settings.</p>

          <div className='button-showcase__row'>
            <Button variant='outline' color='secondary' icon={<LuPlus />}>
              Add check-in
            </Button>

            <Button variant='outline' color='primary' icon={<LuSettings />}>
              Settings
            </Button>

            <Button variant='outline' color='danger' icon={<LuTrash2 />}>
              Delete
            </Button>
          </div>
        </article>

        <article className='button-showcase__card'>
          <h2>Text buttons</h2>
          <p>Use these for quiet actions, links and cancel buttons.</p>

          <div className='button-showcase__row'>
            <Button variant='text' color='primary'>
              View all
            </Button>

            <Button variant='text' color='secondary'>
              Add another
            </Button>

            <Button variant='text' color='muted'>
              Cancel
            </Button>

            <Button variant='text' color='danger'>
              Remove
            </Button>
          </div>
        </article>

        <article className='button-showcase__card'>
          <h2>Solid buttons</h2>
          <p>Use these for primary submit actions.</p>

          <div className='button-showcase__row'>
            <Button variant='solid' color='secondary'>
              secondary solid
            </Button>

            <Button variant='solid' color='primary'>
              Primary solid
            </Button>

            <Button variant='solid' color='danger'>
              Danger solid
            </Button>
          </div>
        </article>

        <article className='button-showcase__card'>
          <h2>Large full-width buttons</h2>
          <p>Use these in forms and modals for the main submit action.</p>

          <div className='button-showcase__stack'>
            <Button variant='solid' color='secondary' size='lg' fullWidth icon={<LuSave />}>
              Save changes
            </Button>

            <Button
              variant='solid'
              color='secondary'
              size='lg'
              fullWidth
              icon={<LuArrowRight />}
              iconPosition='end'
            >
              Continue to dashboard
            </Button>

            <Button variant='outline' color='primary' size='lg' fullWidth>
              Secondary full width
            </Button>
          </div>
        </article>

        <article className='button-showcase__card'>
          <h2>Sizes</h2>
          <p>Small, medium and large buttons.</p>

          <div className='button-showcase__row button-showcase__row--align-center'>
            <Button variant='outline' color='primary' size='sm'>
              Small
            </Button>

            <Button variant='outline' color='primary' size='md'>
              Medium
            </Button>

            <Button variant='outline' color='primary' size='lg'>
              Large
            </Button>
          </div>
        </article>

        <article className='button-showcase__card'>
          <h2>Loading and disabled</h2>
          <p>Use loading while saving, creating or deleting.</p>

          <div className='button-showcase__row'>
            <Button variant='solid' color='secondary' isLoading>
              Saving
            </Button>

            <Button variant='outline' color='primary' disabled>
              Disabled
            </Button>

            <Button variant='text' color='muted' disabled>
              Disabled text
            </Button>
          </div>
        </article>

        <article className='button-showcase__card'>
          <h2>Modal actions</h2>
          <p>A typical modal footer setup.</p>

          <div className='button-showcase__modal-actions'>
            <Button variant='text' color='muted' icon={<LuX />}>
              Cancel
            </Button>

            <Button variant='solid' color='secondary' icon={<LuCheck />}>
              Confirm
            </Button>
          </div>
        </article>
      </div>
    </section>
  );
};
