"""
Test del endpoint GET /api/orders/{order_id}/invitation
Verifica que el botón "Ver invitación" funcione correctamente
"""
import sys
import io
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import requests
import json

BASE_URL = 'http://localhost:5000/api'
EMAIL = 'gfxjef@gmail.com'
PASSWORD = 'TestPassword123'

def test_order_invitation_endpoint():
    print("=" * 80)
    print("TEST: GET /api/orders/{order_id}/invitation")
    print("=" * 80)

    # Step 1: Login
    print("\n[1/4] Login...")
    try:
        login_response = requests.post(
            f'{BASE_URL}/auth/login',
            json={'email': EMAIL, 'password': PASSWORD},
            timeout=5
        )

        if login_response.status_code != 200:
            print(f"✗ Login failed: {login_response.status_code}")
            print(login_response.text)
            return

        print(f"✓ Login successful")
        access_token = login_response.json()['access_token']

    except Exception as e:
        print(f"✗ Login error: {e}")
        return

    # Step 2: Get orders
    print("\n[2/4] Fetching orders...")
    headers = {'Authorization': f'Bearer {access_token}'}

    try:
        orders_response = requests.get(
            f'{BASE_URL}/orders/',
            headers=headers,
            timeout=10
        )

        if orders_response.status_code != 200:
            print(f"✗ Orders fetch failed: {orders_response.status_code}")
            print(orders_response.text)
            return

        data = orders_response.json()
        orders = data.get('orders', [])
        print(f"✓ Orders fetched: {len(orders)}")

        if not orders:
            print("✗ No orders found")
            return

        # Find a PAID order
        paid_orders = [o for o in orders if o.get('status') == 'PAID']
        if not paid_orders:
            print("⚠ No PAID orders found, using first order anyway")
            test_order = orders[0]
        else:
            test_order = paid_orders[0]

        print(f"\n  Using order: {test_order.get('order_number')}")
        print(f"  Order ID: {test_order.get('id')}")
        print(f"  Status: {test_order.get('status')}")

    except Exception as e:
        print(f"✗ Error fetching orders: {e}")
        return

    # Step 3: Test invitation endpoint
    print("\n[3/4] Testing invitation endpoint...")
    order_id = test_order.get('id')

    try:
        invitation_response = requests.get(
            f'{BASE_URL}/orders/{order_id}/invitation',
            headers=headers,
            timeout=5
        )

        print(f"  Status Code: {invitation_response.status_code}")
        response_data = invitation_response.json()

        if invitation_response.status_code == 200:
            print(f"✓ Invitation found!")
            invitation = response_data.get('invitation', {})
            print(f"\n  Invitation Details:")
            print(f"    ID: {invitation.get('id')}")
            print(f"    URL Slug: {invitation.get('url_slug')}")
            print(f"    Full URL: {invitation.get('full_url')}")
            print(f"    Status: {invitation.get('status')}")
            print(f"    Title: {invitation.get('title')}")

            # Step 4: Verify full URL format
            print("\n[4/4] Verifying URL format...")
            full_url = invitation.get('full_url')
            if full_url and full_url.startswith('/invitacion/'):
                print(f"✓ URL format is correct")
                print(f"\n  Complete URL: http://localhost:3000{full_url}")
            else:
                print(f"✗ URL format is incorrect: {full_url}")

        elif invitation_response.status_code == 404:
            print(f"⚠ No invitation found for this order")
            print(f"  Error: {response_data.get('error')}")
            print(f"  Message: {response_data.get('message')}")
            print(f"\n  This is expected if the order doesn't have an invitation yet")

        else:
            print(f"✗ Unexpected response: {invitation_response.status_code}")
            print(json.dumps(response_data, indent=2))

    except Exception as e:
        print(f"✗ Error testing invitation endpoint: {e}")
        return

    print("\n" + "=" * 80)
    print("TEST COMPLETE")
    print("=" * 80)

    print("\nExpected Frontend Behavior:")
    print("1. User clicks 'Ver invitación' button")
    print("2. Frontend calls: GET /api/orders/{order_id}/invitation")
    print("3. Backend returns: { full_url: '/invitacion/abc123' }")
    print("4. Frontend redirects: router.push(full_url)")
    print("5. User sees their invitation")

if __name__ == '__main__':
    test_order_invitation_endpoint()
