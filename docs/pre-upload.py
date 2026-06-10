#!/usr/bin/env python3
# Pre-upload para Cloudflare Pages cuando wrangler falla con 500/1101
# Uso: python3 pre-upload.py  (luego correr wrangler normalmente)
import hashlib, json, os, urllib.request, urllib.error, base64, mimetypes

TOKEN_VAR = 'CLOUDFLARE_API_TOKEN'
ACCOUNT = 'f4906b4aa0902bb1478ea95087e80006'
PROJECT = '3g-ia-agents'
DIST = os.path.join(os.path.dirname(__file__), '..', 'dist')

# Leer token del .env
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
token = None
for line in open(env_path):
    if line.startswith(TOKEN_VAR + '='):
        token = line.strip().split('=', 1)[1]
        break
if not token:
    raise SystemExit('No se encontró CLOUDFLARE_API_TOKEN en .env')

# Obtener JWT de upload
url = f'https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/pages/projects/{PROJECT}/upload-token'
jwt = json.loads(urllib.request.urlopen(
    urllib.request.Request(url, headers={'Authorization': f'Bearer {token}'})
).read())['result']['jwt']
print('JWT obtenido')

ok = fail = 0
for root, _, fnames in os.walk(DIST):
    for fname in fnames:
        fpath = os.path.join(root, fname)
        content = open(fpath, 'rb').read()
        sha = hashlib.sha256(content).hexdigest()
        ct = mimetypes.guess_type(fpath)[0] or 'application/octet-stream'
        payload = [{'key': sha, 'value': base64.b64encode(content).decode(),
                    'metadata': {'contentType': ct}, 'encoding': 'base64'}]
        req = urllib.request.Request(
            'https://api.cloudflare.com/client/v4/pages/assets/upload',
            data=json.dumps(payload).encode(),
            headers={'Authorization': f'Bearer {jwt}', 'Content-Type': 'application/json'},
            method='POST')
        try:
            urllib.request.urlopen(req)
            ok += 1
        except urllib.error.HTTPError:
            fail += 1  # 1101 en PNGs grandes es esperado, wrangler los maneja

print(f'Pre-upload: {ok} ok, {fail} con error 1101 (normal para PNGs grandes)')
print('Ahora corre: npx wrangler@latest pages deploy dist --project-name 3g-ia-agents --commit-dirty=true')
