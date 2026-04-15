'use client';

// Small client island so app/page.tsx can stay a Server Component.
// The rest of the landing page is static markup; extracting this one
// onClick handler into its own component avoids bailing the whole route
// out of the server render and restores SEO-friendly streaming.

interface Props {
  address: string;
}

export default function CopyContractAddress({ address }: Props) {
  if (!address) return null;
  const short = `${address.substring(0, 8)}...${address.substring(address.length - 5)}`;
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(address);
        alert('Contract address copied!');
      }}
      className="text-xs text-zk-accent font-mono hover:text-zk-primary transition-colors cursor-pointer"
      title="Click to copy"
    >
      {short}
    </button>
  );
}
