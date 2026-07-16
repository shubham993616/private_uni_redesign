/**
 * Page container — THE single content width (1280px) with the standard page
 * padding (24px desktop / 16px mobile). Every page-level layout uses this so
 * grid rhythm is identical everywhere.
 */
export default function Container({ as: Comp = 'div', className = '', children, ...props }) {
  return (
    <Comp className={`max-w-content mx-auto px-4 md:px-6 ${className}`.trim()} {...props}>
      {children}
    </Comp>
  );
}
