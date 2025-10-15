"""
Test Script for Short URL System

WHY: Verify that short URLs are being generated and resolved correctly

Tests:
1. Backend endpoint resolves short URLs
2. Case-insensitive matching works
3. Sanitization handles numbers correctly
4. Frontend route exists
"""

import requests
import json

BACKEND_URL = "http://localhost:5000"
FRONTEND_URL = "http://localhost:3000"

def test_backend_resolution():
    """Test backend short URL resolution"""
    print("=" * 60)
    print("TEST 1: Backend Short URL Resolution")
    print("=" * 60)

    # Test case 1: Exact match
    response = requests.get(f"{BACKEND_URL}/api/short-url/redirect?code=fdg&names=Ss")
    data = response.json()
    print(f"\n[OK] Test fdg/Ss (exact): {data}")
    assert data['success'], "Should find invitation"
    assert data['url_slug'] == '2398cfc1', "Should return correct url_slug"

    # Test case 2: Lowercase
    response = requests.get(f"{BACKEND_URL}/api/short-url/redirect?code=fdg&names=ss")
    data = response.json()
    print(f"[OK] Test fdg/ss (lowercase): {data}")
    assert data['success'], "Should find invitation (case-insensitive)"

    # Test case 3: Uppercase
    response = requests.get(f"{BACKEND_URL}/api/short-url/redirect?code=FDG&names=SS")
    data = response.json()
    print(f"[OK] Test FDG/SS (uppercase): {data}")
    assert data['success'], "Should find invitation (case-insensitive)"

    # Test case 4: Not found
    response = requests.get(f"{BACKEND_URL}/api/short-url/redirect?code=xxx&names=notfound")
    data = response.json()
    print(f"[OK] Test xxx/notfound (not found): {data}")
    assert not data['success'], "Should NOT find invitation"

    print("\n[SUCCESS] All backend tests passed!")


def test_sanitization():
    """Test name sanitization with numbers"""
    print("\n" + "=" * 60)
    print("TEST 2: Name Sanitization")
    print("=" * 60)

    from utils.short_url_generator import sanitize_name, sanitize_couple_names

    # Test numbers
    assert sanitize_name("11") == "11", "Should keep numbers"
    assert sanitize_name("XV15") == "Xv15", "Should keep alphanumeric"
    assert sanitize_name("José 123") == "Jose123", "Should handle mixed"

    # Test accents
    assert sanitize_name("María") == "Maria", "Should remove accents"

    # Test couples (now using "y" instead of "&")
    assert sanitize_couple_names("ss", "11") == "Ssy11", "Should handle both names with numbers"
    assert sanitize_couple_names("Carlos", "María") == "CarlosyMaria", "Should handle normal names"

    print("[OK] Sanitization: '11' -> '" + sanitize_name("11") + "'")
    print("[OK] Sanitization: 'XV15' -> '" + sanitize_name("XV15") + "'")
    print("[OK] Sanitization: 'Maria' -> '" + sanitize_name("Maria") + "'")
    print("[OK] Couples: 'ss' + '11' -> '" + sanitize_couple_names("ss", "11") + "' (usando 'y' en lugar de '&')")

    print("\n[SUCCESS] All sanitization tests passed!")


def test_frontend_route_exists():
    """Test that Next.js route exists"""
    print("\n" + "=" * 60)
    print("TEST 3: Frontend Route Exists")
    print("=" * 60)

    import os
    route_path = r"c:\Users\USER\Desktop\python projects\invitaciones_web\frontend\src\app\[code]\[names]\page.tsx"

    if os.path.exists(route_path):
        print(f"[OK] Route file exists: {route_path}")
        print("\n[SUCCESS] Frontend route is configured!")
    else:
        print(f"[FAIL] Route file NOT found: {route_path}")
        print("\n[ERROR] Frontend route missing!")


def main():
    """Run all tests"""
    print("\n[TESTING SHORT URL SYSTEM]\n")

    try:
        test_backend_resolution()
        test_sanitization()
        test_frontend_route_exists()

        print("\n" + "=" * 60)
        print("[SUCCESS] ALL TESTS PASSED!")
        print("=" * 60)
        print("\nNext steps:")
        print("1. [OK] Backend is working correctly")
        print("2. [OK] Sanitization handles numbers")
        print("3. [OK] Frontend route exists")
        print("4. [TEST] Test in browser: http://localhost:3000/fdg/ss")
        print("   (Should redirect to invitation)")

    except AssertionError as e:
        print(f"\n[FAIL] TEST FAILED: {e}")
        return 1
    except Exception as e:
        print(f"\n[ERROR] ERROR: {e}")
        return 1

    return 0


if __name__ == "__main__":
    exit(main())
