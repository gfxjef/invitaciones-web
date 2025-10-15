"""
Test script to call GET /api/invitations/ and see debug logs
"""
import requests
import json

# Test user credentials
EMAIL = "gfxjef@gmail.com"
PASSWORD = "Kmachin!1"

BASE_URL = "http://localhost:5000/api"

def login():
    """Login and get access token"""
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": EMAIL,
        "password": PASSWORD
    })

    if response.status_code == 200:
        data = response.json()
        return data.get('access_token')
    else:
        print(f"Login failed: {response.status_code}")
        print(response.text)
        return None

def get_invitations(token):
    """Get invitations with auth token"""
    headers = {
        "Authorization": f"Bearer {token}"
    }

    response = requests.get(f"{BASE_URL}/invitations/", headers=headers)

    if response.status_code == 200:
        data = response.json()
        print(f"\nSuccess! Got {data.get('total', 0)} invitations")

        # Show first invitation's event_date
        invitations = data.get('invitations', [])
        if invitations:
            first_inv = invitations[0]
            print(f"\nFirst invitation:")
            print(f"   ID: {first_inv.get('id')}")
            print(f"   Title: {first_inv.get('title')}")
            print(f"   Event Date: {first_inv.get('event_date')}")
            print(f"   Event Type: {first_inv.get('event_type')}")
    else:
        print(f"Failed: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    print("Logging in...")
    token = login()

    if token:
        print(f"Got token: {token[:20]}...")
        print("\nFetching invitations...")
        get_invitations(token)
    else:
        print("Could not get token. Check credentials.")
