#!/usr/bin/env python3
"""
Simple PDF Service Test (no emojis for Windows compatibility)
"""

import sys
import asyncio
from services.pdf_service.pdf_generator import PDFGenerator, PLAYWRIGHT_AVAILABLE

async def test_basic_pdf():
    if not PLAYWRIGHT_AVAILABLE:
        print("ERROR: Playwright not available")
        return False

    print("SUCCESS: Playwright is available")

    generator = PDFGenerator()

    try:
        print("Initializing PDF generator...")
        await generator.initialize()
        print("SUCCESS: PDF generator initialized")

        # Test with a real URL (Google homepage as simple test)
        test_url = "https://www.google.com"

        print("Generating test PDF from Google homepage...")
        pdf_bytes = await generator.generate_pdf(
            url=test_url,
            device_type="invitation_mobile",
            quality_preset="draft"
        )

        if pdf_bytes and len(pdf_bytes) > 0:
            print(f"SUCCESS: PDF generated! Size: {len(pdf_bytes)} bytes")

            # Save test file
            with open("test_simple.pdf", "wb") as f:
                f.write(pdf_bytes)
            print("SUCCESS: Test PDF saved as 'test_simple.pdf'")

            return True
        else:
            print("ERROR: PDF generation returned empty content")
            return False

    except Exception as e:
        print(f"ERROR: PDF generation failed: {e}")
        return False
    finally:
        await generator.cleanup()
        print("PDF generator cleaned up")

def main():
    print("PDF Service Simple Test")
    print("=" * 30)

    try:
        result = asyncio.run(test_basic_pdf())

        print("\n" + "=" * 30)
        if result:
            print("RESULT: PDF service is working!")
            print("Ready to replace frontend html2canvas")
        else:
            print("RESULT: PDF service test failed")

        return result
    except Exception as e:
        print(f"TEST ERROR: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)