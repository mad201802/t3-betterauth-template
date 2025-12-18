import React from "react";

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout(props: AccountLayoutProps) {
  return <div className="container mx-auto max-w-4xl">{props.children}</div>;
}
