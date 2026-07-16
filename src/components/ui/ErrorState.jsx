import { AlertTriangle, RotateCcw } from 'lucide-react';
import Button from './Button';

/**
 * Design-system error state — one consistent "couldn't load" surface.
 * Error copy states the cause and the next step, never codes.
 */
export default function ErrorState({
  title = 'Unable to load data',
  description = 'Something went wrong while fetching this content. Check your connection and try again.',
  onRetry,
  className = '',
}) {
  return (
    <div className={`text-center py-16 px-4 ${className}`.trim()} role="alert">
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-error-tint dark:bg-error/15 flex items-center justify-center">
        <AlertTriangle className="w-7 h-7 text-error-text dark:text-red-300" aria-hidden="true" />
      </div>
      <h3 className="text-h3">{title}</h3>
      <p className="mt-1 text-support max-w-md mx-auto">{description}</p>
      {onRetry && (
        <div className="mt-5 flex justify-center">
          <Button variant="outline" onClick={onRetry}>
            <RotateCcw className="w-4 h-4" aria-hidden="true" /> Try again
          </Button>
        </div>
      )}
    </div>
  );
}
