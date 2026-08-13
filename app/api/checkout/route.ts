import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/checkout — Creates a LemonSqueezy checkout URL
 * for freelancers upgrading to ClientSpace Pro.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json();

    if (!email || !userId) {
      return NextResponse.json({ error: 'Missing email or userId' }, { status: 400 });
    }

    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'LemonSqueezy API key not configured' }, { status: 500 });
    }

    const storeId = process.env.LEMONSQUEEZY_STORE_ID || '';
    const variantId = process.env.LEMONSQUEEZY_VARIANT_ID || '';

    // If no store/variant configured, return a test mode checkout
    if (!storeId || !variantId) {
      return NextResponse.json({
        checkoutUrl: null,
        testMode: true,
        message: 'LemonSqueezy store/variant not configured. Use the sandbox upgrade button for now.',
      });
    }

    // Create a checkout session via LemonSqueezy API
    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email,
              custom: {
                user_id: userId,
              },
            },
            product_options: {
              redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://clientspace-iota.vercel.app'}/dashboard/billing?success=true`,
            },
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: storeId,
              },
            },
            variant: {
              data: {
                type: 'variants',
                id: variantId,
              },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('LemonSqueezy checkout error:', errBody);
      return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
    }

    const result = await response.json();
    const checkoutUrl = result.data?.attributes?.url;

    return NextResponse.json({ checkoutUrl, testMode: false });
  } catch (err: unknown) {
    console.error('Checkout API error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
