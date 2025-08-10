#!/bin/bash

# Credenciales de Izipay
HASH_KEY='tYHquE9FmG3O3ml68VHE7QEqx7skKsnKKO6ZDTGGKqMTI'

# Payload de prueba (simulando lo que enviaría Izipay)
PAYLOAD='{"response":{"order":[{"orderNumber":"TEST-001","stateMessage":"PAID","amount":1000,"currency":"PEN","transactionId":"abc123"}]}}'

# Calcular la firma HMAC-SHA256 en Base64
SIG=$(printf '%s' "$PAYLOAD" | openssl dgst -sha256 -hmac "$HASH_KEY" -binary | openssl base64 -A)

echo "=== PRUEBA DE WEBHOOK IZIPAY ==="
echo "Payload: $PAYLOAD"
echo "Signature: $SIG"
echo ""
echo "Enviando webhook a Render..."

# Enviar el webhook
curl -X POST https://invitaciones-web-za3f.onrender.com/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d "{\"payloadHttp\": $(echo "$PAYLOAD" | sed 's/"/\\"/g' | sed 's/^/"/;s/$/"/'), \"signature\": \"$SIG\"}" \
  -v

echo ""
echo "=== FIN DE PRUEBA ==="