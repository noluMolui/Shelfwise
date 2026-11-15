import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

type Props = {
  title: string;
  value: string | number;
  Icon: LucideIcon;
  to?: string;
  warning?: boolean;
  children?: ReactNode;
};

function CardContent({ title, value, Icon, warning, children }: Omit<Props, 'to'>) {
  return (
    <>
      <span className="dashboard-card__icon" aria-hidden="true"><Icon size={22} /></span>
      <span className="dashboard-card__title">{title}</span>
      <span className="dashboard-card__value">{value}</span>
      {warning ? (
        <span className="dashboard-card__warning">
          <span aria-hidden="true">!</span> Warning
        </span>
      ) : null}
      {children}
    </>
  );
}

export function SummaryCard(props: Props) {
  const className = `dashboard-card${props.to ? ' dashboard-card--link' : ''}`;
  if (props.to) {
    return (
      <Link className={className} to={props.to}>
        <CardContent {...props} />
      </Link>
    );
  }

  return (
    <article className={className}>
      <CardContent {...props} />
    </article>
  );
}
