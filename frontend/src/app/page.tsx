import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-50 to-purple-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 mb-6">
              Invitaciones digitales para tu boda
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Crea invitaciones únicas y memorables que tus invitados amarán
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/planes"
                className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition"
              >
                Ver Planes
              </Link>
              <a
                href="https://wa.me/51980046616"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Preview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-display font-bold text-center mb-12">
            Nuestros Planes
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Standard Plan */}
            <div className="border rounded-lg p-8 hover:shadow-lg transition">
              <h3 className="text-2xl font-bold mb-2">Plan Standard</h3>
              <div className="mb-4">
                <span className="text-gray-400 line-through">S/ 440</span>
                <span className="text-3xl font-bold text-primary-600 ml-2">S/ 290</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Plantillas pre-diseñadas</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Ubicación con Google Maps</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Dominio gratuito por 6 meses</span>
                </li>
              </ul>
              <Link
                href="/planes/standard"
                className="block w-full text-center bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition"
              >
                Ver más detalles
              </Link>
            </div>

            {/* Exclusive Plan */}
            <div className="border-2 border-primary-500 rounded-lg p-8 hover:shadow-lg transition relative">
              <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary-500 text-white px-4 py-1 rounded-full text-sm">
                Más Popular
              </span>
              <h3 className="text-2xl font-bold mb-2">Plan Exclusivo</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-primary-600">S/ 690</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Diseño 100% personalizado</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Invitaciones con nombre de cada invitado</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Integración con Google Sheets</span>
                </li>
              </ul>
              <Link
                href="/planes/exclusivo"
                className="block w-full text-center bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition"
              >
                Ver más detalles
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}