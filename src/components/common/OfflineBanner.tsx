type Props = { message: string };

export function OfflineBanner({ message }: Props) {
  return (
    <div className="notice notice--warning" role="status">
      <span className="notice__icon" aria-hidden="true">!</span>
      {message}
    </div>
  );
}
