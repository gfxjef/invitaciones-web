"""
Analiza la relación entre Orders e Invitations en la base de datos
Para entender cómo obtener la URL de invitación desde una orden
"""
import sys
import io
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from extensions import db
from models.order import Order
from models.invitation import Invitation
from app import create_app

app = create_app()

with app.app_context():
    print("=" * 80)
    print("ANÁLISIS DE RELACIÓN: ORDER → INVITATION")
    print("=" * 80)

    # Get sample order with invitation
    print("\n1. BUSCANDO ÓRDENES CON INVITACIONES...")
    print("-" * 80)

    orders_with_invitations = Order.query.filter(Order.invitations.any()).limit(5).all()

    if not orders_with_invitations:
        print("❌ No se encontraron órdenes con invitaciones")
        print("\n2. BUSCANDO ÓRDENES PAGADAS SIN INVITACIÓN...")
        print("-" * 80)

        from models.order import OrderStatus
        paid_orders = Order.query.filter_by(status=OrderStatus.PAID).limit(5).all()

        print(f"✓ Órdenes PAID encontradas: {len(paid_orders)}")
        for order in paid_orders:
            print(f"\n  Order ID: {order.id}")
            print(f"  Order Number: {order.order_number}")
            print(f"  Status: {order.status.value}")
            print(f"  User ID: {order.user_id}")
            print(f"  Total: {order.currency} {order.total}")

            # Check if has invitation
            invitations = Invitation.query.filter_by(order_id=order.id).all()
            print(f"  Invitations linked: {len(invitations)}")
    else:
        print(f"✓ Órdenes con invitaciones encontradas: {len(orders_with_invitations)}")

        for order in orders_with_invitations:
            print(f"\n{'='*80}")
            print(f"ORDER: {order.order_number}")
            print(f"{'='*80}")
            print(f"  ID: {order.id}")
            print(f"  Status: {order.status.value}")
            print(f"  User ID: {order.user_id}")
            print(f"  Total: {order.currency} {order.total}")
            print(f"  Created: {order.created_at}")

            # Get invitations for this order
            invitations = Invitation.query.filter_by(order_id=order.id).all()
            print(f"\n  INVITATIONS ({len(invitations)}):")

            for inv in invitations:
                print(f"\n    Invitation ID: {inv.id}")
                print(f"    Title: {inv.title}")
                print(f"    Unique URL: {inv.unique_url}")
                print(f"    Custom URL: {inv.custom_url or 'N/A'}")
                print(f"    Status: {inv.status}")
                print(f"    Created: {inv.created_at}")

                # Build full URL
                url_slug = inv.custom_url or inv.unique_url
                full_url = f"http://localhost:3000/invitacion/{url_slug}"
                print(f"\n    ✓ FULL URL: {full_url}")

    print("\n" + "=" * 80)
    print("3. ESTRUCTURA DE LA BASE DE DATOS")
    print("=" * 80)

    print("\nTabla: orders")
    print("  - id (PK)")
    print("  - order_number")
    print("  - user_id (FK)")
    print("  - status (PENDING, PAID, CANCELLED, REFUNDED)")
    print("  - total, subtotal, discount_amount")
    print("  - created_at, paid_at")

    print("\nTabla: invitations")
    print("  - id (PK)")
    print("  - order_id (FK) → orders.id")
    print("  - user_id (FK)")
    print("  - plan_id (FK)")
    print("  - unique_url (UUID único)")
    print("  - custom_url (slug personalizado, opcional)")
    print("  - title, groom_name, bride_name")
    print("  - status (draft, published, archived)")
    print("  - created_at, published_at")

    print("\n" + "=" * 80)
    print("4. QUERY PARA OBTENER INVITACIÓN DESDE ORDEN")
    print("=" * 80)

    print("""
    # Método 1: Desde Order object
    order = Order.query.get(order_id)
    invitations = Invitation.query.filter_by(order_id=order.id).all()
    if invitations:
        invitation = invitations[0]  # Primera invitación de la orden
        url = invitation.custom_url or invitation.unique_url
        full_url = f"/invitacion/{url}"

    # Método 2: Join query
    result = db.session.query(Order, Invitation).\\
        join(Invitation, Order.id == Invitation.order_id).\\
        filter(Order.id == order_id).\\
        first()

    if result:
        order, invitation = result
        url = invitation.get_url_slug()  # Helper method
        full_url = f"/invitacion/{url}"
    """)

    print("\n" + "=" * 80)
    print("5. ENDPOINT RECOMENDADO")
    print("=" * 80)

    print("""
    # Backend: GET /api/orders/{order_id}/invitation

    @orders_bp.route('/<int:order_id>/invitation', methods=['GET'])
    @jwt_required()
    def get_order_invitation(order_id):
        current_user_id = get_jwt_identity()

        order = Order.query.filter_by(id=order_id, user_id=current_user_id).first()
        if not order:
            return jsonify({'error': 'Order not found'}), 404

        invitation = Invitation.query.filter_by(order_id=order_id).first()
        if not invitation:
            return jsonify({'error': 'No invitation found for this order'}), 404

        return jsonify({
            'invitation_id': invitation.id,
            'url_slug': invitation.get_url_slug(),
            'full_url': f'/invitacion/{invitation.get_url_slug()}',
            'status': invitation.status
        }), 200
    """)

    print("\n" + "=" * 80)
    print("CONCLUSIÓN")
    print("=" * 80)
    print("""
    Para el botón "Ver invitación" en la tarjeta de orden:

    1. Crear endpoint: GET /api/orders/{order_id}/invitation
    2. Frontend llama a este endpoint cuando se hace clic en "Ver invitación"
    3. Backend retorna: { "full_url": "/invitacion/abc123xyz" }
    4. Frontend redirige: router.push(response.full_url)

    Relación BD:
    Order (id) ← Invitation (order_id)

    URL de invitación:
    /invitacion/{custom_url || unique_url}
    """)
