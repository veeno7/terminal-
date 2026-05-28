export type SkillResult = { success: boolean; data?: unknown; error?: string };

export async function execute(params: Record<string, unknown>): Promise<SkillResult> {
  try {
    const action = params.action as string ?? 'balance';
    const rpcUrl = process.env.ETH_RPC_URL ?? 'https://cloudflare-eth.com';
    if (action === 'balance' && params.address) {
      const res = await fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getBalance', params: [params.address, 'latest'], id: 1 }) });
      const json = await res.json() as { result?: string };
      const weiHex = json.result ?? '0x0';
      const eth = (parseInt(weiHex, 16) / 1e18).toFixed(6);
      return { success: true, data: { address: params.address, balance: eth, unit: 'ETH', network: params.network ?? 'mainnet' } };
    }
    if (action === 'gas') {
      const res = await fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_gasPrice', params: [], id: 1 }) });
      const json = await res.json() as { result?: string };
      const gwei = (parseInt(json.result ?? '0x0', 16) / 1e9).toFixed(2);
      return { success: true, data: { gasPrice: gwei, unit: 'Gwei' } };
    }
    return { success: true, data: { action, network: params.network ?? 'mainnet', note: 'Set ETH_RPC_URL for full blockchain access.' } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
