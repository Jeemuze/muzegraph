type Props = {
  children: React.ReactNode;
  className?: string;
};

export function Heading({ children, className }: Props) {
  return (
    <h1 className={`text-3xl md:text-4xl font-bold text-primary ${className || ""}`}>
      {children}
    </h1>
  );
}

export function Subheading({ children, className }: Props) {
  return (
    <h2 className={`text-2xl font-semibold text-primary ${className || ""}`}>
      {children}
    </h2>
  );
}

export function Text({ children, className }: Props) {
  return (
    <p className={`text-muted-foreground ${className || ""}`}>
      {children}
    </p>
  );
}

export function Muted({ children, className }: Props) {
  return (
    <p className={`text-sm text-muted-foreground ${className || ""}`}>
      {children}
    </p>
  );
}
