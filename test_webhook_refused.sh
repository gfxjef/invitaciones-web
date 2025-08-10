#!/bin/bash

# Credenciales de Izipay
HASH_KEY='tYHquE9FmG3O3ml68VHE7QEqx7skKsnKKO6ZDTGGKqMTI'

# Payload de pago RECHAZADO
PAYLOAD='{"response":{"order":[{"orderNumber":"TEST-002","stateMessage":"REFUSED","amount":500,"currency":"PEN","transactionId":"xyz789"}]}}'

# Calcular la firma
SIG=$(printf '%s' "$PAYLOAD" | openssl dgst -sha256 -hmac "$HASH_KEY" -binary | openssl base64 -A)

echo "=== PRUEBA WEBHOOK - PAGO RECHAZADO ==="
echo "Enviando estado: REFUSED"

# Enviar el webhook
curl -X POST https://invitaciones-web-za3f.onrender.com/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d "{\"payloadHttp\": $(echo "$PAYLOAD" | sed 's/"/\\"/g' | sed 's/^/"/;s/$/"/'), \"signature\": \"$SIG\"}" \
  -s | python -m json.tool 2>/dev/null || echo "Response received"