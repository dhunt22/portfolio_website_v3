/**
 * Props for the PageBackground component
 */
interface PageBackgroundProps {
  backgroundImage: string;
  isMobile: boolean;
  dualBackground?: boolean;
}

/**
 * PageBackground - Reusable SVG background pattern component
 */
export function PageBackground({
  backgroundImage,
  isMobile,
  dualBackground = false
}: PageBackgroundProps) {
  const backgroundSize = isMobile ? '250% auto' : '100% auto';

  if (dualBackground) {
    return (
      <div
        className="absolute -top-[200px] -bottom-[200px] left-0 right-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="w-full opacity-10 dark:opacity-15 absolute top-0 left-0 right-0"
          style={{
            backgroundImage,
            backgroundSize,
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
            height: '56.25%',
          }}
        />
        <div
          className="w-full opacity-10 dark:opacity-15 absolute left-0 right-0"
          style={{
            top: '56.25%',
            backgroundImage,
            backgroundSize,
            backgroundPosition: 'center top',
            backgroundRepeat: 'repeat-y',
            transform: 'scaleY(-1)',
            height: 'calc(100% - 56.25%)',
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="absolute -top-[200px] -bottom-[200px] left-0 right-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="w-full h-full opacity-10 dark:opacity-15"
        style={{
          backgroundImage,
          backgroundSize,
          backgroundPosition: 'center top',
          backgroundRepeat: 'repeat-y',
        }}
      />
    </div>
  );
}
