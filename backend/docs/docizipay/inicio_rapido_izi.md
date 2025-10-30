Inicio rápido
Consulte esta página para una integración rápida en 3 etapas. Consulte este enlace para leer la guía completa: Integración del formulario de pago. Visualice el modo de funcionamiento: Secuencia.

I. Crear el formToken
Autentifíquese con las claves de la API REST. Más información: Etapa 2: Autentificarse.
Utilice el Web Service Charge/CreatePayment con los datos del pago (monto, divisa, número de pedido, datos del comprador, etc.).
Ejemplo de solicitud
json
Request

POST 
https://api.micuentaweb.pe/api-payment/V4/Charge/CreatePayment
Headers

Authorization: 
ODkyODk3NTg6dGVzdHBhc3N3b3JkXzd2QXR2TjQ5RThBZDZlNmloTXFJT3ZPSEM2UVY1WUttSVhneGlzTW0wVjdFcQ==
Content-Type: 
application/json
Body

{
  "amount": 10000,
  "currency": "PEN",
  "paymentMethods": [
    "PAGOEFECTIVO", 
    "CARDS"
  ],
  "customer": {
    "email": "sample@example.com"
  },
  "orderId": "myOrderId-1234"
}
Si no utiliza el campo 'paymentMethods' se ofrecen TODOS los medios de pago admisibles asociados a la tienda (divisas, restricciones técnicas,etc.). Ver:
Seleccionar los medios de pago
. Consulte todos los campos y su descripción en nuestro playground (menú a la izquierda):
Charge/CreatePayment
.
Recupere elformToken(campoanswer.formtoken) para mostrar el formulario de pago
json

{
    "status": "SUCCESS",
    "_type": "V4/WebService/Response",
    "webService": "Charge/CreatePayment",
    "applicationProvider": "MCW",
    "version": "V4",
    "applicationVersion": "4.1.0",
    "answer": {
        "formToken": "DEMO-TOKEN-TO-BE-REPLACED",
        "_type": "V4/Charge/PaymentForm"
    }
}
El formToken generado es Processing...

II. Mostrar el formulario
Tras generar el token:

En el HEAD,
A. cargue nuestra biblioteca de JavaScript : src="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js"
B. Integreobligatoriamente la clave públicaen el parámetrokr-public-key(3°CLAVEde la tabla de claves de la API REST).
C. Integreotros parámetros de inicialización, como parámetrokr-post-url-successen caso de pago aceptado.
D. Elija un tema. Más información en Temas.
Ejemplo de código para la tienda TEST
html

<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<!--
A. load the JS librairy
B. add the kr-public-key
C. add parameters as kr-post-url-success (optionnal)
-->
<script type="text/javascript"
  src="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js"
  kr-public-key="89289758:testpublickey_TxzPjl9xKlhM0a6tfSVNilcLTOUZ0ndsTogGTByPUATcE"
  kr-post-url-success="[SUCCESS PAYMENT URL]";>
</script>
<!-- 
D. add a theme néon should be loaded in the HEAD section 
-->
<link rel="stylesheet" href="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/neon-reset.min.css">
<script type="text/javascript" src="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/neon.js">
</script>
</head>
(...)
</html>
En el BODY,
establezca el valorel formTokenen el atributokr-form-token(Ver:I. Crear el formToken)
Elija el modo de presentación:
Modo lista (por defecto)

html

1
2
3
4
<body>
  <div class="kr-smart-form" kr-form-token="[GENERATED FORMTOKEN]"></div>
  (...)
</body>
Más información :
Modo lista
Modo Pop-in
html

1
2
3
4
<body>
  <div class="kr-smart-form" kr-popin kr-form-token="[GENERATED FORMTOKEN]"></div>
  (...)
</body>
Más información :
Modo pop-in
Modo lista con tarjeta incrustada

html

1
2
3
4
<body>
  <div class="kr-smart-form" kr-card-form-expanded kr-form-token="[GENERATED FORMTOKEN]"></div>
  (...)
</body>
Más información :
Modo lista con tarjeta incrustada
Ejemplo de código para la tienda de TEST
Modo lista con tarjeta incrustada
html

<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<!-- STEP :
1 : load the JS librairy
2 : required public key and the JS parameters as url sucess -->
<script type="text/javascript"
  src="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js"
  kr-public-key="89289758:testpublickey_TxzPjl9xKlhM0a6tfSVNilcLTOUZ0ndsTogGTByPUATcE"
  kr-post-url-success="[SUCCESS PAYMENT URL]";>
</script>
<!-- 3 : theme néon should be loaded in the HEAD section   -->
<link rel="stylesheet" href="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/neon-reset.min.css">
<script type="text/javascript" src="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/neon.js">
</script>
</head>
<body>
<!-- 4 : display the form payment -->
<div class="kr-smart-form" kr-card-form-expanded kr-form-token="[GENERATED FORMTOKEN]">
</div>
</body>
</html>
También tiene la opción :
Destacar un medio de pago.
Destacar varios medios de pago.
III. Analizar el resultado del pago
Analice el resultado del pago desde la IPN o desde el retorno del navegador.
Al finalizar el pago, puede analizar el resultado del mismo desde:
Notificación de pago instantáneo: IPN: Análisis de la IPN (URL de notificación) .
la respuesta enviada al navegador: Análisis del resultado del pago mediante devolución a la tienda.
Un mecanismo de seguridad verifica la autenticidad de la información enviada, con el kr-hash . En el objeto PAYMENT , un ejemplo de kr-answer, :

json

{
  "shopId": "89289758",
  "orderCycle": "CLOSED",
  "orderStatus": "PAID",
  "serverDate": "2022-01-21T09:28:17+00:00",
  "orderDetails": {
    "orderTotalAmount": 180,
    "orderEffectiveAmount": 180,
    "orderCurrency": "PEN",
    "mode": "TEST",
    "orderId": "myOrderId-475882",
    "metadata": null,
    "_type": "V4/OrderDetails"
  },
  "customer": {
    "billingDetails": {
      "address": null,
      "category": null,
      "cellPhoneNumber": null,
      "city": null,
      "country": null,
      "district": null,
      "firstName": null,
      "identityCode": null,
      "language": "FR",
      "lastName": null,
      "phoneNumber": null,
      "state": null,
      "streetNumber": null,
      "title": null,
      "zipCode": null,
      "legalName": null,
      "_type": "V4/Customer/BillingDetails"
    },
    "email": "sample@example.com",
    "reference": null,
    "shippingDetails": {
      "address": null,
      "address2": null,
      "category": null,
      "city": null,
      "country": null,
      "deliveryCompanyName": null,
      "district": null,
      "firstName": null,
      "identityCode": null,
      "lastName": null,
      "legalName": null,
      "phoneNumber": null,
      "shippingMethod": null,
      "shippingSpeed": null,
      "state": null,
      "streetNumber": null,
      "zipCode": null,
      "_type": "V4/Customer/ShippingDetails"
    },
    "extraDetails": {
      "browserAccept": null,
      "fingerPrintId": null,
      "ipAddress": "185.244.73.2",
      "browserUserAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
      "_type": "V4/Customer/ExtraDetails"
    },
    "shoppingCart": {
      "insuranceAmount": null,
      "shippingAmount": null,
      "taxAmount": null,
      "cartItemInfo": null,
      "_type": "V4/Customer/ShoppingCart"
    },
    "_type": "V4/Customer/Customer"
  },
  "transactions": [
    {
      "shopId": "89289758",
      "uuid": "1c8356b0e24442b2acc579cf1ae4d814",
      "amount": 180,
      "currency": "PEN",
      "paymentMethodType": "CARD",
      "paymentMethodToken": null,
      "status": "PAID",
      "detailedStatus": "AUTHORISED",
      "operationType": "DEBIT",
      "effectiveStrongAuthentication": "ENABLED",
      "creationDate": "2022-01-21T09:28:16+00:00",
      "errorCode": null,
      "errorMessage": null,
      "detailedErrorCode": null,
      "detailedErrorMessage": null,
      "metadata": null,
      "transactionDetails": {
        "liabilityShift": "YES",
        "effectiveAmount": 180,
        "effectiveCurrency": "PEN",
        "creationContext": "CHARGE",
        "cardDetails": {
          "paymentSource": "EC",
          "manualValidation": "NO",
          "expectedCaptureDate": "2022-01-27T09:38:10+00:00",
          "effectiveBrand": "VISA",
          "pan": "497011XXXXXX1003",
          "expiryMonth": 12,
          "expiryYear": 2025,
          "country": "FR",
          "issuerCode": 17807,
          "issuerName": "Banque Populaire Occitane",
          "effectiveProductCode": null,
          "legacyTransId": "929936",
          "legacyTransDate": "2022-01-21T09:28:16+00:00",
          "paymentMethodSource": "NEW",
          "authorizationResponse": {
            "amount": 180,
            "currency": "PEN",
            "authorizationDate": "2022-01-21T09:28:16+00:00",
            "authorizationNumber": "3fe205",
            "authorizationResult": "0",
            "authorizationMode": "FULL",
            "_type": "V4/PaymentMethod/Details/Cards/CardAuthorizationResponse"
          },
          "captureResponse": {
            "refundAmount": null,
            "refundCurrency": null,
            "captureDate": null,
            "captureFileNumber": null,
            "effectiveRefundAmount": null,
            "effectiveRefundCurrency": null,
            "_type": "V4/PaymentMethod/Details/Cards/CardCaptureResponse"
          },
          "threeDSResponse": {
            "authenticationResultData": {
              "transactionCondition": null,
              "enrolled": null,
              "status": null,
              "eci": null,
              "xid": null,
              "cavvAlgorithm": null,
              "cavv": null,
              "signValid": null,
              "brand": null,
              "_type": "V4/PaymentMethod/Details/Cards/CardAuthenticationResponse"
            },
            "_type": "V4/PaymentMethod/Details/Cards/ThreeDSResponse"
          },
          "authenticationResponse": {
            "id": "30eaa40d-dd76-4617-b527-4bed6240b81c",
            "operationSessionId": "ae6f2ad3ffea41bb8faf1aefabad87b9",
            "protocol": {
              "name": "THREEDS",
              "version": "2.1.0",
              "network": "VISA",
              "challengePreference": "NO_PREFERENCE",
              "simulation": true,
              "_type": "V4/Charge/Authenticate/Protocol"
            },
            "value": {
              "authenticationType": "CHALLENGE",
              "authenticationId": {
                "authenticationIdType": "dsTransId",
                "value": "bafdb21f-e3d6-4d1c-b4f6-d1668b7f7f21",
                "_type": "V4/Charge/Authenticate/AuthenticationId"
              },
              "authenticationValue": {
                "authenticationValueType": "CAVV",
                "value": "BqLgDBHYRaCBpip3Fn3+erKT9vg=",
                "_type": "V4/Charge/Authenticate/AuthenticationValue"
              },
              "status": "SUCCESS",
              "commerceIndicator": "05",
              "extension": {
                "authenticationType": "THREEDS_V2",
                "threeDSServerTransID": "30eaa40d-dd76-4617-b527-4bed6240b81c",
                "dsTransID": "bafdb21f-e3d6-4d1c-b4f6-d1668b7f7f21",
                "acsTransID": "bd6e58b4-6f37-4993-b428-9096766d83a6",
                "_type": "V4/Charge/Authenticate/AuthenticationResultExtensionThreedsV2"
              },
              "reason": {
                "_type": "V4/Charge/Authenticate/AuthenticationResultReason"
              },
              "_type": "V4/Charge/Authenticate/AuthenticationResult"
            },
            "_type": "V4/AuthenticationResponseData"
          },
          "installmentNumber": null,
          "installmentCode": null,
          "markAuthorizationResponse": {
            "amount": null,
            "currency": null,
            "authorizationDate": null,
            "authorizationNumber": null,
            "authorizationResult": null,
            "_type": "V4/PaymentMethod/Details/Cards/MarkAuthorizationResponse"
          },
          "cardHolderName": null,
          "identityDocumentNumber": null,
          "identityDocumentType": null,
          "_type": "V4/PaymentMethod/Details/CardDetails"
        },
        "fraudManagement": {
          "_type": "V4/PaymentMethod/Details/FraudManagement"
        },
        "subscriptionDetails": {
          "subscriptionId": null,
          "_type": "V4/PaymentMethod/Details/SubscriptionDetails"
        },
        "parentTransactionUuid": null,
        "mid": "9999999",
        "sequenceNumber": 1,
        "taxAmount": null,
        "preTaxAmount": null,
        "taxRate": null,
        "externalTransactionId": null,
        "nsu": null,
        "tid": "001",
        "acquirerNetwork": "CB",
        "taxRefundAmount": null,
        "userInfo": "JS Client",
        "paymentMethodTokenPreviouslyRegistered": null,
        "occurrenceType": "UNITAIRE",
        "_type": "V4/TransactionDetails"
      },
      "_type": "V4/PaymentTransaction"
    }
  ],
  "subMerchantDetails": null,
  "_type": "V4/Payment"
}
Para más información, Etapa 5: Analizar el resultado del pago ).