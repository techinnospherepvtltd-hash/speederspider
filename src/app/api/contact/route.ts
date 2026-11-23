import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { saveContactMessage, getEnquiries, updateEnquiryStatus } from '@/lib/data/db';

const contactSchema = z.object({
  customerName: z.string().min(2, 'Name is required').max(150),
  email: z.string().email('Valid email is required').max(255),
  phone: z.string().min(7, 'Valid phone number is required').max(50),
  serviceId: z.string().optional().nullable(),
  message: z.string().max(2000).optional().default(''),
  preferredLanguage: z.enum(['en', 'ar']).default('en'),
  hpToken: z.string().optional().default(''), // Honeypot field
});

// Simple in-memory rate limiting map: ip -> timestamps
const rateLimitMap = new Map<string, number[]>();

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown-ip';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 10;

    const timestamps = (rateLimitMap.get(ip) || []).filter((t) => now - t < windowMs);
    if (timestamps.length >= maxRequests) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many requests. Please message us directly via WhatsApp at 0565694440.',
        },
        { status: 429 }
      );
    }
    timestamps.push(now);
    rateLimitMap.set(ip, timestamps);

    const body = await req.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errors: result.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const { customerName, email, phone, serviceId, message, preferredLanguage, hpToken } = result.data;

    // Check honeypot
    if (hpToken && hpToken.trim() !== '') {
      // Bot detected, silently succeed without storing or notifying
      return NextResponse.json({ success: true, message: 'Message received.' });
    }

    // Save to database
    const savedMessage = await saveContactMessage({
      customer_name: customerName,
      email,
      phone,
      service_id: serviceId || null,
      message,
      preferred_language: preferredLanguage,
      status: 'new',
    });

    // Send transactional email if API key is provided
    const resendKey = process.env.RESEND_API_KEY;
    const recipient = process.env.CONTACT_NOTIFICATION_EMAIL || 'info@speederspider.com';

    if (resendKey && !resendKey.includes('your_api_key')) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: process.env.NOTIFICATIONS_FROM_EMAIL || 'enquiries@speederspider.com',
            to: [recipient],
            subject: `[SpeederSpider Enquiry] New request from ${customerName}`,
            text: `Name: ${customerName}\nEmail: ${email}\nPhone: ${phone}\nService: ${serviceId || 'General'}\nLanguage: ${preferredLanguage}\nMessage:\n${message}`,
          }),
        });
      } catch (emailErr) {
        // Log email error safely without exposing to client or losing saved message
        console.error('Transactional email delivery failed:', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Enquiry received successfully. Our workshop team will contact you shortly.',
      id: savedMessage.id,
    });
  } catch (err) {
    console.error('Contact form submission error:', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error processing enquiry. Please message WhatsApp directly.',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const enquiries = await getEnquiries();
    return NextResponse.json({ success: true, enquiries });
  } catch (err: any) {
    console.error('Error fetching enquiries:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to fetch enquiries' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, internalNotes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: 'Both id and status are required' },
        { status: 400 }
      );
    }

    const success = await updateEnquiryStatus(id, status, internalNotes);
    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Enquiry not found or update failed' },
        { status: 404 }
      );
    }

    try {
      revalidatePath('/admin', 'page');
      revalidatePath('/admin/enquiries', 'page');
    } catch (e) {}

    return NextResponse.json({ success: true, message: 'Enquiry updated successfully', status });
  } catch (err: any) {
    console.error('Error updating enquiry:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to update enquiry' },
      { status: 500 }
    );
  }
}
