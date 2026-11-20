/**
 * Gera o JSON v1 da galáxia (mock) com os ids reais das faixas do Jellyfin.
 *
 * Uso:
 *   JELLYFIN_USER=eric JELLYFIN_PASSWORD=... npm run galaxy:mock -- [saida.json]
 *
 * Usa o mesmo gerador do app (src/galaxy/generator.ts), então as posições
 * são idênticas às do mock gerado no aparelho.
 */
import { writeFileSync } from 'node:fs';

import { generateMockGalaxy } from '../src/galaxy/generator.ts';

const SERVER = process.env.JELLYFIN_URL ?? 'https://brunoflix.rizomalivre.com';
const USER = process.env.JELLYFIN_USER;
const PASSWORD = process.env.JELLYFIN_PASSWORD ?? '';
const OUT = process.argv[2] ?? 'galaxy.mock.json';

const AUTH = 'MediaBrowser Client="Nebulosa Script", Device="script", DeviceId="nebulosa-script", Version="0.1.0"';

async function main() {
  if (!USER) {
    console.error('Defina JELLYFIN_USER e JELLYFIN_PASSWORD.');
    process.exit(1);
  }
  const auth = await fetch(`${SERVER}/Users/AuthenticateByName`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: AUTH },
    body: JSON.stringify({ Username: USER, Pw: PASSWORD }),
  });
  if (!auth.ok) throw new Error(`Login falhou: ${auth.status}`);
  const { AccessToken, User } = (await auth.json()) as { AccessToken: string; User: { Id: string } };
  const headers = { Authorization: `${AUTH}, Token="${AccessToken}"` };

  const ids: string[] = [];
  const pageSize = 1000;
  for (let start = 0; ; start += pageSize) {
    const params = new URLSearchParams({
      userId: User.Id,
      includeItemTypes: 'Audio',
      recursive: 'true',
      startIndex: String(start),
      limit: String(pageSize),
      enableImages: 'false',
      enableUserData: 'false',
      fields: '',
    });
    const res = await fetch(`${SERVER}/Items?${params}`, { headers });
    if (!res.ok) throw new Error(`Falha ao listar faixas: ${res.status}`);
    const page = (await res.json()) as { Items: { Id: string }[]; TotalRecordCount: number };
    ids.push(...page.Items.map((i) => i.Id));
    process.stdout.write(`\r${ids.length}/${page.TotalRecordCount}`);
    if (page.Items.length < pageSize) break;
  }
  process.stdout.write('\n');

  const json = generateMockGalaxy(ids);
  writeFileSync(OUT, JSON.stringify(json));
  console.log(`Gravado ${OUT} com ${json.count} pontos (versão ${json.version}).`);

  await fetch(`${SERVER}/Sessions/Logout`, { method: 'POST', headers }).catch(() => undefined);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
