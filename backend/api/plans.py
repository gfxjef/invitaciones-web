from flask import Blueprint, jsonify
from models import Plan, PlanFeature

plans_bp = Blueprint('plans', __name__)


@plans_bp.route('/', methods=['GET'])
def get_plans():
    # Placeholder - implement after models are complete
    return jsonify({
        'plans': [
            {
                'id': 1,
                'name': 'Standard',
                'price': 290,
                'original_price': 440,
                'currency': 'PEN',
                'features': [
                    'Plantillas pre-diseñadas',
                    'Ubicación con Google Maps',
                    'Música estándar',
                    'Dominio gratuito por 6 meses',
                    'Carrusel de fotos y videos',
                    'Confirmación vía WhatsApp'
                ]
            },
            {
                'id': 2,
                'name': 'Exclusivo',
                'price': 690,
                'currency': 'PEN',
                'features': [
                    'Diseño personalizado',
                    'Invitaciones con nombre y dedicatoria',
                    'Confirmación con formulario adaptable',
                    'Integración con Google Sheets',
                    'Música personalizada (YouTube)',
                    'Hasta 3 variaciones de invitación'
                ]
            }
        ]
    }), 200


@plans_bp.route('/<int:plan_id>', methods=['GET'])
def get_plan(plan_id):
    # Placeholder - implement after models are complete
    return jsonify({
        'message': f'Plan {plan_id} details'
    }), 200