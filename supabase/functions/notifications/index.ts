import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// --- ENVIRONMENT DETECTION ---
const IS_STAGING = SUPABASE_URL?.includes('tcfnwbyjxrgkwsjwgbdy');
const APP_NAME = IS_STAGING ? "WishPeti Staging" : "WishPeti";
const FROM_EMAIL = IS_STAGING ? "hello-staging@wishpeti.com" : "hello@wishpeti.com";
const BASE_URL = IS_STAGING ? "https://wishpeti-staging.vercel.app" : "https://wishpeti.com";
const COMPANY_NAME = "Peti Collective Pvt Ltd";

/**
 * Clean, Truncated Item Name Helper
 */
const formatItemName = (name: string) => name.length > 35 ? name.substring(0, 32) + "..." : name;

/**
 * PhonePe-Inspired Transactional Layout
 */
const emailLayout = (title: string, subtitle: string, amount: string | number, currency: string, details: any[] = [], buttonText: string | null = null, buttonUrl: string = "#") => {
  const detailRows = details.map(d => `
    <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px;">
      <span style="color: #64748b;">${d.label}</span>
      <span style="color: #1e293b; font-weight: 600; text-align: right;">${d.value}</span>
    </div>
  `).join('');

  return `
  <!DOCTYPE html>
  <html>
  <body style="font-family: -apple-system, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
    <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background: #000000; padding: 24px; text-align: center;">
        <span style="color: #ffffff; font-weight: 800; font-size: 20px; letter-spacing: -0.5px;">${APP_NAME.toUpperCase()}</span>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="margin: 0; color: #0f172a; font-size: 18px; text-align: center; font-weight: 700;">${title}</h2>
        <p style="margin: 10px 0 0; color: #64748b; font-size: 14px; text-align: center; line-height: 1.5;">${subtitle}</p>
        <div style="margin: 28px 0; padding: 24px; background: #fdfdfd; border-radius: 12px; border: 1.5px dashed #cbd5e1; text-align: center;">
          <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Transaction Amount</span>
          <div style="font-size: 34px; font-weight: 800; color: #1e293b; margin-top: 4px;">
            ${currency === 'INR' ? '₹' : currency}${amount}
          </div>
        </div>
        <div style="margin-bottom: 24px;">${detailRows}</div>
        ${buttonText ? `
        <div style="text-align: center; margin-top: 32px;">
          <a href="${buttonUrl}" style="display: inline-block; background: #000000; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px;">
            ${buttonText}
          </a>
        </div>` : ''}
      </div>
      <div style="padding: 24px; background: #f8fafc; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
        <p style="margin: 0 0 10px;">Regards, <br><strong style="color: #475569;">Team Peti Collective</strong></p>
        <p style="margin: 0; line-height: 1.5;">&copy; 2026 ${COMPANY_NAME}. <br> ${BASE_URL.replace('https://', '')} | Secure Gifting Platform</p>
        ${IS_STAGING ? `<p style="color: #ef4444; font-weight: bold; margin-top: 10px;">[STAGING ENVIRONMENT]</p>` : ''}
      </div>
    </div>
  </body>
  </html>
  `;
}

serve(async (req) => {
  try {
    const payload = await req.json()
    const { record, old_record } = payload
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const [{ data: profile }, { data: itemData }] = await Promise.all([
      supabase.from('creator_profiles').select('email, display_name').eq('id', record.creator_id).single(),
      record.item_id ? supabase.from('wishlist_items').select('title, price').eq('id', record.item_id).single() : Promise.resolve({ data: null })
    ]);

    const creatorName = profile?.display_name || "Creator";
    const creatorEmail = profile?.email;
    const rawItemName = itemData?.title || "a gift";
    const displayItemName = formatItemName(rawItemName);
    const trackingPage = `${BASE_URL}/track/${record.id}`;
    const notifications = [];

    const isCrowdfund = record.is_crowdfund === true;

    // --- SCENARIO 1: PAYMENT SUCCESS (PAID) ---
    if (record.payment_status === 'paid' && old_record?.payment_status !== 'paid') {
      
      // To SENDER (Supporter)
      if (record.buyer_email) {
        const title = isCrowdfund ? "Contribution Successful! 📈" : "Gift Payment Successful! 🎁";
        const subtitle = isCrowdfund 
          ? `You have fueled the collective goal for <strong>${creatorName}</strong>.` 
          : `Your personal gift for <strong>${creatorName}</strong> has been securely processed.`;

        notifications.push(sendEmail({
          to: record.buyer_email,
          subject: `[${APP_NAME}] Confirmation: ${displayItemName}`,
          html: emailLayout(title, subtitle, record.total_amount, record.currency_code, [
            { label: "Beneficiary", value: creatorName },
            { label: "Item/Goal", value: displayItemName },
            { label: "Type", value: isCrowdfund ? "Collective Peti" : "Personal Wish" },
            { label: "Ref ID", value: record.id.slice(0, 8).toUpperCase() }
          ], "Track Your Impact", trackingPage)
        }));
      }

      // To CREATOR
      if (creatorEmail) {
        const title = isCrowdfund ? "Peti Updated! 📈" : "You've got a gift! 🎈";
        const subtitle = isCrowdfund 
          ? `Someone contributed to your collective goal for <strong>${rawItemName}</strong>.` 
          : `A supporter just fulfilled <strong>${rawItemName}</strong> from your wishlist!`;

        notifications.push(sendEmail({
          to: creatorEmail,
          subject: `[${APP_NAME}] New support for ${displayItemName}`,
          html: emailLayout(title, subtitle, record.total_amount, record.currency_code, [
            { label: "From", value: record.buyer_name || "Anonymous Supporter" },
            { label: "Project", value: displayItemName },
            { label: "Status", value: record.is_crowdfund_master ? "Goal Met" : "In Progress" }
          ], "Manage My Gifts", `${BASE_URL}/manage-gifts`)
        }));
      }
    }

    // --- SCENARIO 2: REFUNDED ---
    if (record.payment_status === 'refunded' && old_record?.payment_status !== 'refunded' && record.buyer_email) {
        notifications.push(sendEmail({
            to: record.buyer_email,
            subject: `[${APP_NAME}] Refund Confirmation: ${displayItemName}`,
            html: emailLayout("Refund Processed ✅", "The transaction has been reversed. Funds are returning to your original payment method.", record.total_amount, record.currency_code, [
                { label: "Item", value: displayItemName },
                { label: "Refund ID", value: record.id.slice(0, 8).toUpperCase() }
            ], "Contact Support", `${BASE_URL}/support`)
        }));
    }

    // --- SCENARIO 3: SHIPPED ---
    if (record.gift_status === 'shipped' && old_record?.gift_status !== 'shipped' && record.buyer_email) {
        notifications.push(sendEmail({
            to: record.buyer_email,
            subject: `[${APP_NAME}] Shipping Update: ${displayItemName}`,
            html: emailLayout("Gift is on the way! 🚚", `The ${rawItemName} has been dispatched to ${creatorName}.`, record.total_amount, record.currency_code, [
                { label: "Recipient", value: creatorName },
                { label: "Status", value: "In Transit" }
            ], "Track Delivery", trackingPage)
        }));
    }

    await Promise.all(notifications);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
})

async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  const senderIdentity = `${APP_NAME} <${FROM_EMAIL}>`;
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: senderIdentity, reply_to: 'support@wishpeti.com', to: [to], subject, html })
  });
}