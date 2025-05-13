import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const orderData = await request.json();
    
    // For now, just log the order
    console.log('New order:', orderData);
    
    // Return a mock order ID
    const orderId = 'order_' + Date.now();
    
    return NextResponse.json({ 
      orderId, 
      success: true,
      message: 'Order received! (Mock response)'
    });
  } catch (error) {
    console.error('Order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

