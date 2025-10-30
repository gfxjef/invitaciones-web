# Documentación Completa de Implementación del SDK Web de Izipay

## Introducción general del sistema

El SDK Web de Izipay es una solución JavaScript desarrollada para facilitar la integración de formularios de pago seguros en aplicaciones web. **A diferencia de los SDK tradicionales que requieren conocimientos avanzados en integración API, el SDK de Izipay proporciona una API simple que abstrae la complejidad**, eliminando la necesidad de administración compleja de flujos y permitiendo que los desarrolladores integren sistemas de pago de manera rápida y eficiente.

El SDK permite a los clientes ingresar de forma segura sus datos sensibles como número de tarjeta, fecha de vencimiento, CVV, nombres, apellidos y correo electrónico. **Esta información se envía a los servidores de Izipay de manera segura y confidencial**, sin que el comercio tenga que manejar directamente datos sensibles. El sistema acepta tarjetas Visa, MasterCard, Diners Club y American Express, además de métodos alternativos como billeteras digitales (Yape, Plin Interbank) y pagos mediante código QR.

### Ventajas principales del SDK

**Simplificación radical del proceso de integración**. El SDK proporciona una capa de abstracción que reduce drásticamente la complejidad del código necesario para interactuar con APIs de pago. Los desarrolladores pueden implementar un sistema completo de pagos en cuestión de minutos, no días.

**Seguridad mejorada por diseño**. El SDK maneja automáticamente el cifrado y la transmisión segura de datos sensibles, eliminando la carga de cumplimiento PCI DSS del comercio. Los datos de tarjeta nunca tocan los servidores del comercio.

**Módulos completamente independientes**. Cada método de pago funciona de forma autónoma. Si Yape experimenta problemas técnicos, los pagos con tarjeta y QR continúan operando normalmente. Esta arquitectura modular garantiza mayor disponibilidad del sistema.

**Actualizaciones automáticas y continuas**. El SDK se mantiene y actualiza regularmente por Izipay, garantizando acceso constante a las últimas mejoras, correcciones de seguridad y nuevas funcionalidades sin necesidad de actualizar el código del comercio.

**Compatibilidad universal**. El SDK es compatible con cualquier lenguaje de programación que ejecute JavaScript en el cliente: JavaScript puro, TypeScript, Angular, React, Vue.js y otros frameworks modernos. También puede integrarse en aplicaciones móviles mediante React Native o Flutter a través de vistas web.

**Sin dependencias externas**. El SDK de Izipay no depende de ninguna librería externa, lo que simplifica su integración y reduce conflictos potenciales con otras dependencias del proyecto.

## Requisitos previos y configuración inicial

### Proceso de afiliación

Antes de iniciar la integración técnica, debes completar el proceso de afiliación como comercio electrónico con Izipay. Este proceso se realiza con el soporte de un asesor comercial de Izipay quien te guiará en la configuración de tu cuenta. Una vez completada la afiliación, recibirás por correo electrónico las credenciales de acceso al Panel de Comercio: usuario y contraseña que te permitirán gestionar tu cuenta y obtener las claves de integración.

### Obtención de credenciales

Accede al Panel de Comercio de Izipay con las credenciales recibidas y dirígete a la sección "Desarrolladores" ubicada en la parte superior derecha de la interfaz. Desde allí podrás obtener las siguientes credenciales esenciales para la integración:

**Código de comercio (merchantCode)**. Es el identificador único de tu negocio generado por Izipay durante la afiliación. Este código se utiliza en todas las transacciones para identificar al comercio.

**Clave API del nuevo botón de pagos (publickey)**. Esta clave se utiliza exclusivamente para generar el token de sesión desde tu backend. Tiene una longitud de 0-50 caracteres y es fundamental para inicializar el proceso de pago.

**Clave Hash**. Se emplea para calcular la firma de las peticiones, garantizando la integridad y autenticidad de las comunicaciones entre tu sistema y los servidores de Izipay.

**Clave pública RSA de Izipay (keyRSA)**. Esta llave RSA se utiliza para la encriptación de datos sensibles durante la transmisión, asegurando que la información de pago viaje cifrada y protegida.

### Requisitos técnicos del sistema

**Protocolos de seguridad**. El sistema requiere obligatoriamente TLS 1.2 para todas las comunicaciones. No se soportan versiones anteriores de SSL o TLS. Todas las comunicaciones deben realizarse a través de conexiones HTTPS seguras.

**Compatibilidad de navegadores**. El SDK es compatible con las versiones más recientes de Chrome, Firefox, Safari y Edge. Es importante destacar que **Internet Explorer 11 de Microsoft está obsoleto desde junio de 2022 y no es soportado**.

**Lenguajes de programación**. No existen restricciones en cuanto a los lenguajes de programación utilizados en el backend, siempre y cuando la aplicación pueda realizar peticiones REST. El frontend debe ser capaz de ejecutar JavaScript.

**Configuración de red**. El sistema funciona tanto a través de Internet directo como de VPN. Si tu comercio opera con restricciones de firewall o salida a Internet, debes garantizar permisos de salida a los dominios de Izipay. En algunos casos puede ser necesario proporcionar acceso a rangos específicos de direcciones IP.

### Ambientes disponibles

Izipay proporciona dos ambientes claramente diferenciados para el desarrollo y operación:

**Ambiente Sandbox (Desarrollo)**. Utiliza la URL `https://sandbox-checkout.izipay.pe/payments/v1/js/index.js` para incluir el SDK. Este ambiente permite realizar todas las pruebas necesarias sin procesar transacciones reales. Debes marcar la opción "Modo de Prueba" en la configuración y utilizar las credenciales de prueba proporcionadas.

**Ambiente Producción**. Una vez validada la integración, utiliza la URL `https://checkout.izipay.pe/payments/v1/js/index.js` para operaciones reales. Actualiza las credenciales a las de producción (publickey, clave hash, código de comercio) antes de lanzar.

## Pasos de implementación detallados

### Paso 1: Inclusión del SDK en tu página

El primer paso para integrar el SDK es incluir la etiqueta de script en el elemento `<head>` de tu archivo HTML. Esta inclusión carga el SDK completo de Izipay y hace disponible la clase global `Izipay` en el contexto de tu aplicación.

**Para desarrollo y pruebas:**
```html
<script src="https://sandbox-checkout.izipay.pe/payments/v1/js/index.js"></script>
```

**Para producción:**
```html
<script src="https://checkout.izipay.pe/payments/v1/js/index.js"></script>
```

La diferencia entre ambos entornos radica únicamente en la URL utilizada. El SDK funciona de manera idéntica en ambos casos, pero el ambiente sandbox no procesa transacciones reales.

### Paso 2: Generar el token de sesión desde el backend

**Este paso es crítico para la seguridad de la integración**. El token de sesión debe generarse siempre desde tu backend, nunca desde el frontend. Exponer las credenciales en el código del cliente representaría un grave riesgo de seguridad.

Desde tu servidor backend, realiza una petición a la API de Token de Sesión de Izipay utilizando tu clave API (publickey) y la clave hash para firmar la solicitud. La API retornará un token de sesión único para esa transacción específica. Este token tiene validez temporal y debe ser utilizado para inicializar el formulario de pago.

El transactionId utilizado para generar el token de sesión debe ser exactamente el mismo que utilizarás en la configuración del formulario (objeto iziConfig). Esta consistencia es fundamental para que Izipay pueda correlacionar correctamente la transacción.

### Paso 3: Crear el objeto de configuración

El objeto `iziConfig` es el corazón de la configuración del formulario de pago. Contiene toda la información necesaria sobre la transacción, el cliente, la apariencia del formulario y el comportamiento del checkout.

**Ejemplo de configuración básica:**

```javascript
const iziConfig = {
  config: {
    transactionId: '16881500822750',
    action: 'pay',
    merchantCode: '4000498',
    order: {
      orderNumber: 'ORDEN-2024-001',
      currency: 'PEN',
      amount: '150.00',
      processType: 'AT',
      merchantBuyerId: 'CLIENTE-12345',
      dateTimeTransaction: '1670258741603000',
      payMethod: 'all'
    },
    billing: {
      firstName: 'Juan',
      lastName: 'Pérez Quispe',
      email: 'jperez@ejemplo.com',
      phoneNumber: '987654321',
      street: 'Av. Jorge Chávez 275',
      city: 'Lima',
      state: 'Lima',
      country: 'PE',
      postalCode: '15038',
      documentType: 'DNI',
      document: '12345678'
    },
    render: {
      typeForm: 'embedded',
      container: 'contenedor-pago',
      showButtonProcessForm: true
    },
    appearance: {
      theme: 'blue',
      logo: 'https://www.mitienda.com/logo.png'
    }
  }
};
```

Este objeto debe personalizarse según las necesidades específicas de tu comercio y la transacción que se está procesando.

### Paso 4: Inicializar el formulario de pago

Una vez configurado el objeto iziConfig, debes crear una instancia del SDK de Izipay. Esta instancia inicializa el formulario con toda la configuración proporcionada.

```javascript
try {
  const checkout = new Izipay({ config: iziConfig });
} catch ({Errors, message, date}) {
  console.log('Error al inicializar:', {Errors, message, date});
}
```

El bloque try-catch es importante para capturar errores de validación en la configuración. Si algún parámetro requerido falta o tiene un formato incorrecto, el error será capturado aquí con información detallada sobre el problema.

### Paso 5: Cargar y mostrar el formulario

El último paso es cargar el formulario de pago llamando al método `LoadForm`. Este método recibe el token de sesión generado en el backend, la clave RSA pública y opcionalmente una función callback para recibir la respuesta.

```javascript
const callbackResponsePayment = (response) => {
  console.log('Respuesta de la transacción:', response);
  if (response.code === '00') {
    console.log('Pago aprobado');
  } else {
    console.log('Pago rechazado:', response.message);
  }
};

try {
  checkout && checkout.LoadForm({
    authorization: 'TOKEN_SESSION_DESDE_BACKEND',
    keyRSA: 'CLAVE_RSA_PUBLICA_IZIPAY',
    callbackResponse: callbackResponsePayment
  });
} catch ({Errors, message, date}) {
  console.log('Error al cargar el formulario:', {Errors, message, date});
}
```

En este momento, el formulario de pago se renderiza en tu página y está listo para que el usuario ingrese sus datos de pago y complete la transacción.

## Modalidades de integración

El SDK de Izipay ofrece tres modalidades principales de integración, cada una diseñada para diferentes necesidades y casos de uso.

### Modalidad Embebida (Embedded)

**La modalidad embebida integra el formulario de pago directamente en una sección de tu página web**. El formulario se renderiza dentro de un contenedor específico que tú defines, manteniéndose el usuario en tu sitio durante todo el proceso de pago. Esta modalidad proporciona el mayor control sobre la experiencia de usuario y permite una integración visual perfecta con el diseño de tu sitio.

**Configuración para modo embebido:**

```javascript
const iziConfig = {
  config: {
    render: {
      typeForm: 'embedded',
      container: 'mi-contenedor-pago',
      showButtonProcessForm: true
    }
  }
};
```

El parámetro `container` debe coincidir con el ID de un elemento HTML en tu página (por ejemplo, `<div id="mi-contenedor-pago"></div>`). El formulario se renderizará dentro de este elemento, adaptándose automáticamente a su tamaño.

**Precarga del formulario embebido**. Si deseas precargar el SDK con la configuración embebida optimizando el tiempo de carga, puedes incluir parámetros directamente en la URL del script:

```html
<!-- Sandbox con precarga -->
<script src="https://sandbox-checkout.izipay.pe/payments/v1/js/index.js?mode=embedded&container=contenedor-pago"></script>

<!-- Producción con precarga -->
<script src="https://checkout.izipay.pe/payments/v1/js/index.js?mode=embedded&container=contenedor-pago"></script>
```

**Control manual del botón de pago**. Una característica poderosa del modo embebido es la posibilidad de ocultar el botón de pago predeterminado y controlarlo manualmente:

```javascript
const iziConfig = {
  config: {
    render: {
      typeForm: 'embedded',
      container: 'mi-contenedor-pago',
      showButtonProcessForm: false
    }
  }
};

let botonPersonalizado = document.querySelector('#mi-boton-pagar');
botonPersonalizado.addEventListener('click', async (event) => {
  event.preventDefault();
  checkout.form.events.submit();
});
```

### Modalidad Redirect (Redireccionamiento)

**La modalidad redirect redirige a los usuarios a una página externa de Izipay para completar el proceso de pago**. Esta modalidad es ideal cuando prefieres que Izipay maneje completamente el formulario de pago o cuando necesitas procesar la respuesta del lado del servidor.

**Configuración para modo redirect:**

```javascript
const iziConfig = {
  config: {
    render: {
      typeForm: 'redirect',
      redirectUrls: {
        onSuccess: 'https://www.mitienda.com/pago-exitoso',
        onError: 'https://www.mitienda.com/pago-error',
        onCancel: 'https://www.mitienda.com/carrito'
      }
    }
  }
};
```

**Las tres URLs de redirección son obligatorias** y deben ser capaces de recibir datos mediante POST. En la modalidad redirect, el parámetro `callbackResponse` NO se utiliza. La respuesta de la transacción se envía mediante POST a la URL correspondiente. Tu página de destino debe estar preparada para recibir estos datos mediante tecnologías del lado del servidor como PHP, ASP.NET, Node.js u otras.

### Modalidad Pop-up

La modalidad pop-up muestra el formulario de pago en una ventana emergente sobre tu página actual. Para activar esta modalidad, configura `typeForm: 'pop-up'` en las opciones de render.

### Comparativa de modalidades

**Usa el modo embebido cuando**: Necesites control total sobre la experiencia de usuario, quieras mantener al usuario en tu página durante todo el proceso, desarrolles una aplicación de una sola página (SPA), o requieras personalizar completamente el flujo de pago.

**Usa el modo redirect cuando**: Necesites redireccionamiento después de recibir la respuesta, prefieras una integración más simple, tengas limitaciones técnicas en el frontend, o necesites procesar la respuesta exclusivamente del lado del servidor.

**Usa el modo pop-up cuando**: Quieras un balance entre integración y separación visual, desees mantener el contexto de la página pero con el formulario destacado.

## Definición completa de parámetros

### Objeto config - Estructura principal

El objeto `config` es el contenedor principal que almacena toda la información de la transacción y la configuración del formulario.

#### Parámetros principales de configuración

**publickey** (String - requerido). Clave API obtenida desde el Panel de Comercio. Se utiliza únicamente para generar el token de sesión desde tu backend. Longitud: 0-50 caracteres.

**transactionId** (String - requerido). Identificador único por cada transacción. Debe ser exactamente el mismo que fue enviado al generar el token de sesión. Longitud: 5-40 caracteres. Formato: Solo números y letras (mayúsculas o minúsculas), sin espacios ni caracteres especiales. Regex: `/^[0-9a-zA-Z]+$/`.

**action** (String - requerido). Indica el tipo de operación:
- `pay`: Compras con tarjeta sin tokenización
- `register`: Solo registra la tarjeta (tokenización)
- `pay_register`: Compra y registro simultáneo de tarjeta
- `pay_token`: Compra utilizando un token de tarjeta previamente registrada

**merchantCode** (String - requerido). Código del comercio generado por Izipay durante la afiliación.

### Objeto order - Información de la orden

**orderNumber** (String). Número de pedido único de la transacción. Debe ser el mismo que fue enviado al generar el token de sesión.

**currency** (String - requerido). Código de moneda de la transacción (ISO 4217). Para Perú: `'PEN'`.

**amount** (String - requerido). Monto de la transacción. Debe ser exactamente el mismo enviado al generar el token de sesión. Formato: Enteros con 2 decimales, usando punto como separador decimal, sin delimitador de miles. Ejemplo: `'1500.50'`.

**processType** (String - requerido). Tipo de proceso:
- `'AT'`: Autorización (el monto se cobra inmediatamente)
- `'PA'`: Pre-Autorización (el monto se reserva pero no se cobra hasta confirmación posterior)

**merchantBuyerId** (String). Identificador único del comprador en tu sistema.

**dateTimeTransaction** (String). Fecha y hora de la transacción en formato timestamp de milisegundos. Ejemplo: `'1670258741603000'`.

**payMethod** (String). Especifica qué métodos de pago mostrar:
- `'all'`: Todos los métodos disponibles
- `'CARD'`: Solo tarjetas
- `'QR'`: Solo código QR
- `'APPLE_PAY'`: Solo Apple Pay
- `'YAPE_CODE'`: Solo Yape
- `'PAGO_PUSH'`: Solo Plin Interbank
- Múltiples métodos: `'CARD,QR,YAPE_CODE'` (separados por coma)

**installment** (String). Número de cuotas. `'00'` indica pago al contado.

**deferred** (String). Número de meses diferidos. `'0'` indica sin diferimiento.

**showAmount** (Boolean). Si es `true`, visualiza el monto en el botón "Pagar".

### Objeto billing - Datos de facturación (requerido)

**firstName** (String - requerido). Nombres del tarjetahabiente. Longitud: 2-50 caracteres. Formato: Solo letras (mayúsculas/minúsculas), incluyendo acentuadas y ñ, más espacios. Regex: `/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]+$/`.

**lastName** (String - requerido). Apellidos del tarjetahabiente. Longitud: 2-50 caracteres. Mismo formato que firstName.

**email** (String - requerido). Correo electrónico. Longitud: 5-50 caracteres.

**phoneNumber** (String - requerido). Teléfono. Longitud: 7-15 caracteres. **Importante**: Para Plin Interbank, debe tener exactamente 9 dígitos.

**street** (String - requerido). Dirección de facturación. Longitud: 5-40 caracteres. Ejemplo: `'Av. Jorge Chávez 275'`. Formato: Letras, números, espacios y caracteres: - / . ' ´. Regex: `/^[a-zA-Z\u00C0-\u017F\u00F1\u00D1\-\/.\-'´`0-9 ]+$/u`.

**city** (String - requerido). Ciudad. Longitud: 3-25 caracteres. Formato: Solo letras y espacios.

**state** (String - requerido). Departamento o estado. Si el país es US o CA, usar código de 2 caracteres (ejemplo: California = `'CA'`).

**country** (String - requerido). País. Código ISO de 2 caracteres. Ejemplo: `'PE'` para Perú.

**postalCode** (String). Código Postal. Reglas especiales:
- US: formato de 5 dígitos (NNNNN) o 9 dígitos (NNNNN-NNNN)
- CA: formato de 6 caracteres (ANA NAN)

**documentType** (String - requerido). Tipo de documento: `'DNI'`, `'CE'`, `'PASAPORTE'`, `'RUC'`, `'OTROS'`.

**document** (String - requerido). Número de documento. Longitud según tipo:
- DNI: 8 caracteres
- CE: 9-12 caracteres
- PASAPORTE: 8-12 caracteres
- RUC: 11 caracteres
- OTROS: 8-12 caracteres

**companyName** (String - opcional). Razón social. Longitud: 2-25 caracteres.

### Objeto shipping - Datos de envío (opcional)

Estructura similar al objeto billing. Todos los campos son opcionales pero siguen los mismos formatos y validaciones.

### Objeto token - Tokenización

**cardToken** (String - requerido para pay_token). Token que identifica la tarjeta. Longitud: 0-64 caracteres.

**alias** (String - opcional). Alias descriptivo de la tarjeta.

### Objeto render - Configuración de visualización

**typeForm** (String - requerido). Tipo de visualización: `'embedded'`, `'redirect'`, `'pop-up'`.

**container** (String - requerido para embedded). ID del elemento HTML donde se renderizará el formulario. Longitud: 2-50 caracteres.

**showButtonProcessForm** (Boolean). Muestra u oculta el botón de pago. **Solo para método tarjeta en modalidad embebido**.

**redirectUrls** (Object - requerido para redirect). URLs de redireccionamiento:
- **onSuccess**: URL tras pago exitoso
- **onError**: URL cuando ocurre un error
- **onCancel**: URL si el usuario cancela

**urlIPN** (String). URL de notificación (IPN - Webhook). Longitud: 5-400 caracteres. Ejemplo: `'https://www.mitienda.com/api/notificaciones-izipay'`.

### Objeto appearance - Personalización de apariencia

**theme** (String). Tema predefinido. Valores: `'red'`, `'lightred'`, `'green'`, `'purple'`, `'black'`, `'blue'`, `'ligthgreen'`.

**logo** (String). URL del logo. Formato JPG, PNG o SVG. Tamaño máximo: 100 KB. Dimensiones recomendadas: 20x20 píxeles. Longitud: 10-200 caracteres.

**inputStyle** (String). Estilo de los inputs. Longitud: 5-20 caracteres.

**customize** (Object). Personalización avanzada:
- **visibility**: Controla visibilidad de elementos
  - `hideOrderNumber`: Oculta número de orden
  - `hideLogo`: Oculta logo
  - `hideGlobalErrors`: Oculta mensajes de error globales
- **elements**: Array para configurar orden de métodos de pago

Ejemplo de personalización de orden:
```javascript
customize: {
  elements: [
    { paymentMethod: 'QR', order: 1 },
    { paymentMethod: 'YAPE_CODE', order: 2 },
    { paymentMethod: 'CARD', order: 3 }
  ]
}
```

## Métodos y funciones disponibles

### Constructor: new Izipay()

```javascript
const checkout = new Izipay({ config: iziConfig });
```

Crea una nueva instancia del checkout con la configuración proporcionada.

**Manejo de errores:**
```javascript
try {
  const checkout = new Izipay({ config: iziConfig });
} catch ({Errors, message, date}) {
  console.error('Error al inicializar:', Errors, message, date);
}
```

### Método: LoadForm()

```javascript
checkout.LoadForm({
  authorization: 'TOKEN_SESSION',
  keyRSA: 'KEY_RSA',
  callbackResponse: callbackFunction
});
```

Carga y muestra el formulario de pago.

**Parámetros:**
- **authorization** (String - requerido): Token de sesión desde backend
- **keyRSA** (String - requerido): Clave RSA pública de Izipay
- **callbackResponse** (Function - requerido para embedded): Función callback que recibe la respuesta

**Ejemplo completo:**
```javascript
const callbackResponsePayment = (response) => {
  if (response.code === '00') {
    console.log('Transacción exitosa');
    console.log('Autorización:', response.response.order[0].codeAuth);
  } else {
    console.log('Transacción rechazada:', response.messageUser);
  }
};

try {
  checkout && checkout.LoadForm({
    authorization: tokenSesion,
    keyRSA: claveRSA,
    callbackResponse: callbackResponsePayment
  });
} catch ({Errors, message, date}) {
  console.error('Error:', Errors, message, date);
}
```

### Evento: form.events.submit()

Invoca manualmente el procesamiento del formulario:

```javascript
checkout.form.events.submit();
```

**Uso típico con botón personalizado:**
```javascript
let miBotonPagar = document.querySelector('#boton-personalizado');
miBotonPagar.addEventListener('click', async (event) => {
  event.preventDefault();
  if (validarFormulario()) {
    checkout.form.events.submit();
  }
});
```

### Propiedad: Izipay.prototype.Response

Acceso alternativo a la respuesta de la transacción:

```javascript
const respuesta = Izipay.prototype.Response;
console.log('Respuesta global:', respuesta);
```

## Manejo de respuestas y callbacks

### Estructura de la respuesta

Respuesta exitosa con tarjeta:

```javascript
{
  "code": "00",
  "message": "Operación exitosa",
  "messageUser": "Operación exitosa",
  "messageUserEng": "Successful",
  "response": {
    "payMethod": "CARD",
    "order": [{
      "payMethodAuthorization": "CARD",
      "codeAuth": "001612",
      "currency": "PEN",
      "amount": "149.00",
      "installment": "00",
      "deferred": "0",
      "orderNumber": "ORDEN-2024-001",
      "stateMessage": "Autorizado",
      "dateTransaction": "20240115",
      "timeTransaction": "145747",
      "uniqueId": "0115195747812450",
      "referenceNumber": "5178217"
    }],
    "card": {
      "brand": "VS",
      "pan": "489068******2569",
      "save": "false"
    },
    "billing": {
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "jperez@ejemplo.com",
      "phoneNumber": "987654321",
      "street": "Av. Jorge Chávez 275",
      "city": "Lima",
      "state": "Lima",
      "country": "PE",
      "postalCode": "15038",
      "documentType": "DNI",
      "document": "12345678"
    },
    "merchant": {
      "merchantCode": "4000498"
    }
  }
}
```

### Códigos de respuesta

**code: "00"** indica transacción exitosa y autorizada. Cualquier otro código indica problema o rechazo.

Categorías de códigos:
- **Códigos YAPE**: Y06, Y07, Y08, Y09, Y12, Y13
- **Códigos PLIN**: 007
- **Códigos de Tarjeta (T)**: T01 a T33
- **Códigos de Procesamiento (P)**: P01 a P34
- **Códigos de Autorización (A)**: A02 y otros

### Implementación del callback

```javascript
const callbackResponsePayment = (response) => {
  console.log('Respuesta completa:', response);
  
  if (response.code === '00') {
    procesarPagoExitoso(response);
  } else {
    procesarPagoRechazado(response);
  }
};

function procesarPagoExitoso(response) {
  const orden = response.response.order[0];
  const numeroAutorizacion = orden.codeAuth;
  const numeroReferencia = orden.referenceNumber;
  const uniqueId = orden.uniqueId;
  
  // Actualizar base de datos
  actualizarEstadoPedido(orden.orderNumber, 'pagado', {
    autorizacion: numeroAutorizacion,
    referencia: numeroReferencia,
    uniqueId: uniqueId
  });
  
  // Mostrar mensaje de éxito
  mostrarMensajeExito('¡Pago procesado exitosamente!');
  
  // Redirigir
  window.location.href = '/confirmacion?orden=' + orden.orderNumber;
}

function procesarPagoRechazado(response) {
  mostrarMensajeError(response.messageUser || 'El pago no pudo ser procesado');
  registrarIntentoFallido(response);
}
```

### Datos importantes en la respuesta

**codeAuth**: Número de autorización del banco. Confirma que la transacción fue aprobada.

**referenceNumber**: Número de referencia del adquiriente. **Crucial para solicitudes de refund**. Guárdalo en tu base de datos.

**uniqueId**: Identificador único de la transacción generado por Izipay/Cybersource.

**stateMessage**: Mensaje descriptivo del estado: "Autorizado", "Denegado", etc.

**card.pan**: Número de tarjeta enmascarado. Formato: `489068******2569`.

**card.brand**: Marca de tarjeta: `VS` (Visa), `MC` (MasterCard), `DC` (Diners Club), `AX` (American Express).

## Servicio de notificaciones (IPN/Webhook)

### Introducción al servicio IPN

La API de notificaciones (Webhook o IPN - Instant Payment Notification) permite **recibir actualizaciones automáticas y en tiempo real sobre el estado de las transacciones**. Las notificaciones se envían directamente desde los servidores de Izipay a tu servidor backend, garantizando que recibas la confirmación de pago incluso si el usuario cierra el navegador.

### Beneficios del servicio IPN

**Actualización automática** del estado de transacciones sin consultas constantes.

**Mayor confiabilidad**. Comunicación servidor a servidor eliminando dependencia del navegador del usuario.

**Automatización completa**. Actualiza base de datos, envía correos, activa servicios, genera facturas automáticamente.

**Seguridad mejorada**. Comunicación servidor a servidor más segura.

### Configuración del servicio IPN

**Paso 1: Exponer un endpoint en tu servidor**

Crea un endpoint HTTP que pueda recibir peticiones POST de Izipay.

**Ejemplo en Node.js:**

```javascript
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/izipay-notificaciones', async (req, res) => {
  try {
    console.log('Notificación IPN recibida:', req.body);
    await procesarNotificacionIPN(req.body);
    res.status(200).json({ status: 'OK' });
  } catch (error) {
    console.error('Error procesando IPN:', error);
    res.status(500).json({ status: 'ERROR' });
  }
});

async function procesarNotificacionIPN(datos) {
  const {
    orderId,
    orderNumber,
    transactionId,
    authorizationCode,
    status,
    amount,
    currency
  } = datos;
  
  await actualizarEstadoTransaccion(orderNumber, {
    status: status,
    transactionId: transactionId,
    authorizationCode: authorizationCode
  });
  
  if (status === 'Autorizado') {
    await enviarEmailConfirmacion(orderNumber);
    await activarProductos(orderNumber);
  }
}
```

**Paso 2: Configurar la URL en el objeto config**

```javascript
const iziConfig = {
  config: {
    render: {
      urlIPN: 'https://www.mitienda.com/api/izipay-notificaciones'
    }
  }
};
```

### Datos enviados en la notificación IPN

- **orderId**: Id único de la transacción (transactionId original)
- **orderNumber**: Número de pedido
- **transactionId**: Identificador Izipay/Cybersource
- **authorizationCode**: Número de referencia (importante para refunds)
- **status**: Estado de la transacción ("Autorizado", "Denegado")
- **currency**: Moneda
- **amount**: Monto
- **installments**: Número de cuotas
- **deferred**: Meses diferidos
- **date**: Fecha (formato yyyymmdd)
- **time**: Hora (formato hhmmss)

### Mejores prácticas para el servicio IPN

**Responder rápidamente**. Responde con HTTP 200 lo más rápido posible. Procesa pesadamente de forma asíncrona.

**Implementar reintentos**. Tu endpoint debe ser idempotente y manejar notificaciones duplicadas.

**Validar la firma**. Implementa validación de firma utilizando la clave hash.

**Logging completo**. Registra todas las notificaciones con timestamp para auditoría.

**Manejo robusto de errores**. Implementa try-catch apropiados.

## Opciones de personalización

### Temas predefinidos

```javascript
appearance: {
  theme: 'blue'  // red, lightred, green, purple, black, blue, ligthgreen
}
```

### Personalización del logo

```javascript
appearance: {
  logo: 'https://www.mitienda.com/assets/logo.png'
}
```

Requisitos: JPG, PNG o SVG. Máximo 100 KB. 20x20 píxeles recomendados.

### Ocultar elementos

```javascript
appearance: {
  customize: {
    visibility: {
      hideOrderNumber: true,
      hideLogo: true,
      hideGlobalErrors: false
    }
  }
}
```

### Ordenar métodos de pago

```javascript
appearance: {
  customize: {
    elements: [
      { paymentMethod: 'QR', order: 1 },
      { paymentMethod: 'YAPE_CODE', order: 2 },
      { paymentMethod: 'CARD', order: 3 }
    ]
  }
}
```

### Visualización del monto en el botón

```javascript
order: {
  showAmount: true  // Botón mostrará "Pagar S/ 150.00"
}
```

### Texto personalizado del botón

```javascript
changeButtonText: {
  actionPay: 'Confirmar Pago'
  // Valores: Pagar, Aceptar pagar, Pague aquí, Cobrar, Comprar, 
  // Continuar, Contribuir, Confirmar Pago, Donar, Efectuar Pago, Recargar
}
```

## Consideraciones de seguridad

### Protección de credenciales

**Nunca expongas las credenciales en el código del frontend**. El publickey, clave hash y otras credenciales deben mantenerse únicamente en tu servidor backend.

### Generación del token de sesión

**El token debe generarse siempre desde el backend**. Este es el principio de seguridad más crítico. Implementa un endpoint backend que genere el token.

**Flujo seguro:**
1. Usuario inicia pago
2. Frontend solicita token a tu backend
3. Backend genera token con credenciales Izipay
4. Backend responde con token al frontend
5. Frontend usa token para inicializar formulario

### Transmisión segura de datos

Todos los datos sensibles se transmiten directamente desde el formulario Izipay a servidores Izipay con encriptación RSA. **Tu servidor nunca recibe datos sensibles de tarjeta**, reduciendo tu responsabilidad PCI DSS.

### Uso obligatorio de HTTPS

Todas las comunicaciones deben usar HTTPS. El SDK requiere TLS 1.2 mínimo. Asegura certificado SSL válido y actualizado.

### Validación del lado del servidor

Siempre valida información crítica en tu servidor backend. Nunca confíes únicamente en validaciones del cliente.

### Verificación de notificaciones IPN

Verifica que:
- El orderId corresponda a transacción válida en tu sistema
- El monto coincida con el monto original
- Implementa verificación de firma con clave hash
- No proceses notificaciones duplicadas

### Manejo seguro de errores

No expongas información técnica sensible en mensajes de error al usuario. Registra detalladamente en logs del servidor, muestra mensajes genéricos al usuario.

### Almacenamiento de datos

- **Nunca almacenes números completos de tarjeta o CVV**
- Almacena solo PAN enmascarado de la respuesta
- Guarda el referenceNumber para facilitar refunds
- Encripta datos sensibles en base de datos
- Implementa controles de acceso apropiados

### Tokenización para pagos recurrentes

Usa la funcionalidad de tokenización de Izipay (`action: 'register'` o `'pay_register'`). **Nunca almacenes datos de tarjeta directamente**. Usa siempre tokens proporcionados por Izipay.

## Proceso de pruebas: Sandbox y Producción

### Ambiente Sandbox

```html
<script src="https://sandbox-checkout.izipay.pe/payments/v1/js/index.js"></script>
```

Utiliza credenciales de prueba del Panel de Comercio. Marca "Modo de Prueba".

### Realización de pruebas

**Pruebas funcionales:**
1. Pago exitoso con tarjeta (usa números de prueba)
2. Pago rechazado
3. Diferentes métodos de pago (Yape, QR, Plin)
4. Cuotas y diferimiento
5. Cancelación de pago

**Pruebas de integración:**
1. Callback de respuesta funcional
2. Notificaciones IPN recibidas
3. Actualización de base de datos
4. Envío de correos electrónicos
5. Flujo de redireccionamiento (modo redirect)

**Pruebas de UI:**
1. Responsividad en diferentes dispositivos
2. Funcionamiento en Chrome, Firefox, Safari, Edge
3. Aplicación de personalizaciones (logo, tema)
4. Mensajes de error apropiados

### Transición a producción

**Paso 1: Obtener credenciales de producción** desde el Panel de Comercio.

**Paso 2: Actualizar el código:**
```html
<script src="https://checkout.izipay.pe/payments/v1/js/index.js"></script>
```

**Paso 3: Actualizar credenciales en backend:**
```javascript
const credenciales = {
  publickey: process.env.IZIPAY_PUBLICKEY_PROD,
  merchantCode: process.env.IZIPAY_MERCHANT_CODE_PROD,
  claveHash: process.env.IZIPAY_HASH_PROD,
  keyRSA: process.env.IZIPAY_KEY_RSA_PROD
};
```

**Paso 4: Desactivar modo de prueba**

**Paso 5: Prueba inicial en producción** con transacción real de monto pequeño.

**Paso 6: Monitoreo continuo** de transacciones, errores y logs.

### Mejores prácticas para producción

**Logging comprehensivo** de todas las transacciones y respuestas.

**Manejo robusto de errores** con reintentos y backoff exponencial.

**Monitoreo de performance** del tiempo de respuesta.

**Seguridad continua** manteniendo dependencias actualizadas.

## Solución de problemas comunes

### El formulario no se muestra

**Posibles causas:**

1. **Error en configuración**: Verifica objeto iziConfig. Revisa consola del navegador.
2. **Contenedor no existe**: Asegura que elemento con ID de `container` existe en DOM.
3. **Token inválido/expirado**: Genera nuevo token.
4. **URL incorrecta**: Verifica URL correcta (sandbox vs producción).
5. **Bloqueo CORS**: Usa HTTPS incluso en desarrollo.

### Error "transactionId does not match"

El `transactionId` en iziConfig debe ser exactamente igual al usado para generar el token de sesión. Verifica que pasas el mismo valor en ambas llamadas.

### El callback no se ejecuta

**Causas:**

1. **Modo redirect**: El callback solo funciona en modo embedded.
2. **Error en función callback**: Verifica sintaxis de la función.
3. **No se pasó callbackResponse**: Asegura incluir el parámetro en LoadForm().

### Error al cargar el token de sesión

Verifica que:
- Las credenciales (publickey, hash) sean correctas
- El endpoint de generación de token esté accesible
- La firma se calcule correctamente
- El transactionId sea único para cada transacción

### Pago rechazado sin motivo claro

Revisa:
- El código de respuesta específico (T01, P01, etc.)
- Logs de Izipay en el Panel de Comercio
- Que el monto sea válido
- Que los datos de facturación estén completos
- Que el método de pago esté habilitado

### No se reciben notificaciones IPN

Verifica:
- URL IPN sea accesible públicamente desde Internet
- Endpoint responda con HTTP 200
- No haya restricciones de firewall
- El endpoint acepte peticiones POST
- Headers CORS configurados apropiadamente

### Problemas de personalización

Si la personalización no se aplica:
- Verifica sintaxis del objeto appearance
- Confirma que el logo sea accesible (URL válida)
- Revisa que el tema sea uno de los valores permitidos
- Asegura formato correcto del objeto customize

### Errores de validación de campos

Si los campos muestran errores de validación:
- Verifica formatos según documentación (regex)
- Para Plin: teléfono debe tener 9 dígitos exactos
- Para postalCode: verifica formato según país
- Para document: longitud debe coincidir con documentType

## Casos de uso específicos

### Pago simple con tarjeta

```javascript
const iziConfig = {
  config: {
    transactionId: 'TXN123456',
    action: 'pay',
    merchantCode: '4000498',
    order: {
      orderNumber: 'ORD001',
      currency: 'PEN',
      amount: '100.00',
      processType: 'AT'
    },
    billing: { /* datos completos */ }
  }
};
```

### Pago con token de tarjeta guardada

```javascript
const iziConfig = {
  config: {
    action: 'pay_token',
    token: {
      cardToken: '27340718bfdf2de6a125d29ecc6ebf279cc4daf20150aee8a3b4911f02d0ef81'
    },
    order: { /* datos de orden */ },
    billing: { /* datos de facturación */ }
  }
};
```

### Registro de tarjeta sin pago

```javascript
const iziConfig = {
  config: {
    action: 'register',
    order: {
      orderNumber: 'REG001',
      currency: 'PEN',
      amount: '0.00'
    },
    billing: { /* datos completos */ }
  }
};
```

### Pago y registro simultáneo

```javascript
const iziConfig = {
  config: {
    action: 'pay_register',
    order: {
      orderNumber: 'ORD002',
      currency: 'PEN',
      amount: '200.00'
    },
    billing: { /* datos completos */ }
  }
};
```

### Pago con Yape

```javascript
const iziConfig = {
  config: {
    action: 'pay',
    order: {
      orderNumber: 'ORD003',
      currency: 'PEN',
      amount: '50.00',
      payMethod: 'YAPE_CODE'
    },
    billing: { /* datos completos */ }
  }
};
```

### Pago con Plin Interbank

```javascript
const iziConfig = {
  config: {
    action: 'pay',
    order: {
      orderNumber: 'ORD004',
      currency: 'PEN',
      amount: '75.00',
      payMethod: 'PAGO_PUSH'
    },
    billing: {
      firstName: 'María',
      lastName: 'García',
      email: 'maria@ejemplo.com',
      phoneNumber: '987654321',  // Exactamente 9 dígitos para Plin
      /* otros datos */
    }
  }
};
```

### Pago con múltiples métodos disponibles

```javascript
const iziConfig = {
  config: {
    order: {
      orderNumber: 'ORD005',
      payMethod: 'CARD,QR,YAPE_CODE'  // Separados por coma
    }
  }
};
```

### Pago en cuotas

```javascript
const iziConfig = {
  config: {
    order: {
      orderNumber: 'ORD006',
      amount: '1200.00',
      installment: '06',  // 6 cuotas
      deferred: '0'
    }
  }
};
```

### Pago diferido

```javascript
const iziConfig = {
  config: {
    order: {
      orderNumber: 'ORD007',
      amount: '800.00',
      installment: '00',
      deferred: '3'  // 3 meses diferido
    }
  }
};
```

## Preguntas frecuentes

### ¿El SDK requiere dependencias externas?

No, el SDK de Izipay no depende de ninguna librería externa. Es completamente independiente.

### ¿Puedo usar el SDK en aplicaciones móviles?

Sí, puedes integrar el SDK en aplicaciones móviles usando React Native o Flutter mediante vistas web (WebView).

### ¿Qué navegadores son compatibles?

Chrome, Firefox, Safari y Edge en sus versiones más recientes. Internet Explorer 11 no es soportado.

### ¿Cómo obtengo el estado de una transacción?

Usa los métodos proporcionados por el SDK para consultar el servidor con el ID de transacción, o consulta el Panel de Comercio de Izipay.

### ¿Puedo personalizar los colores del formulario?

Sí, usa el objeto `appearance` con temas predefinidos o personalización avanzada con `customize`.

### ¿Los datos de tarjeta pasan por mi servidor?

No, los datos sensibles se transmiten directamente desde el formulario Izipay a los servidores de Izipay con encriptación RSA. Tu servidor nunca los recibe.

### ¿Cómo funciona la tokenización?

Usa `action: 'register'` para solo registrar una tarjeta, o `'pay_register'` para pagar y registrar simultáneamente. Izipay devuelve un token (cardToken) que puedes usar en futuras transacciones con `action: 'pay_token'`.

### ¿Qué hago si una transacción falla?

Revisa el código de respuesta específico, consulta los logs en el Panel de Comercio, verifica que todos los datos sean correctos y que el método de pago esté habilitado.

### ¿Puedo hacer devoluciones (refunds)?

Sí, guarda el `referenceNumber` de cada transacción exitosa. Este número es necesario para solicitar devoluciones a través de la API de Izipay.

### ¿El SDK funciona con VPN?

Sí, el sistema es funcional tanto a través de Internet directo como de VPN. Asegura permisos de salida a los dominios de Izipay.

### ¿Cómo actualizo de sandbox a producción?

Cambia la URL del script de sandbox a producción, actualiza las credenciales (publickey, merchantCode, hash, keyRSA) a las de producción, y desactiva el modo de prueba.

### ¿Qué métodos de pago están disponibles?

Tarjetas (Visa, MasterCard, Diners Club, American Express), QR, Yape, Plin Interbank y Apple Pay.

### ¿Cómo funciona el IPN/Webhook?

Configura una URL en `urlIPN`. Izipay enviará notificaciones POST a esa URL con el estado de cada transacción, permitiendo automatización completa del flujo post-pago.

## Resumen ejecutivo

El SDK Web de Izipay es una solución integral y segura para integrar pagos en aplicaciones web. Ofrece:

**Facilidad de implementación**: API simple que abstrae complejidad, permitiendo integración en minutos.

**Seguridad robusta**: Encriptación RSA, transmisión segura de datos, cumplimiento PCI DSS simplificado.

**Flexibilidad total**: Tres modalidades de integración (embedded, redirect, pop-up), múltiples métodos de pago, amplia personalización.

**Compatibilidad universal**: Funciona con cualquier framework JavaScript, todos los navegadores modernos, y puede integrarse en apps móviles.

**Arquitectura modular**: Cada método de pago funciona independientemente, garantizando mayor disponibilidad.

**Sin dependencias**: No requiere librerías externas.

**Soporte múltiple**: Tarjetas, billeteras digitales (Yape, Plin), QR, Apple Pay.

**Automatización completa**: Sistema IPN/Webhook para notificaciones en tiempo real y automatización de procesos.

Para comenzar solo necesitas:
1. Afiliarte con Izipay y obtener credenciales
2. Incluir el script del SDK en tu HTML
3. Configurar el objeto iziConfig con datos de la transacción
4. Generar token de sesión desde tu backend
5. Inicializar con `new Izipay()` y llamar `LoadForm()`

La documentación completa está disponible en developers.izipay.pe/web-core/

---

**Fuente**: Documentación oficial extraída exclusivamente de developers.izipay.pe  
**Versión del SDK**: 1.10.0  
**Fecha de compilación**: Octubre 2025