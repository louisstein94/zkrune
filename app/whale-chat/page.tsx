import WhaleChatVerifier from '@/components/WhaleChatVerifier';
import { WHALE_TOKENS } from '@/lib/whaleTokens';

export default function WhaleChatPage() {
  return <WhaleChatVerifier config={WHALE_TOKENS.zkrune} />;
}