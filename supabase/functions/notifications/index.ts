import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// --- ENVIRONMENT DETECTION ---
// Staging Project Reference: tcfnwbyjxrgkwsjwgbdy
const IS_STAGING = SUPABASE_URL?.includes('tcfnwbyjxrgkwsjwgbdy');

const APP_NAME = IS_STAGING ? "Wishpeti Staging" : "Wishpeti";
const FROM_EMAIL = IS_STAGING ? "hello-staging@wishpeti.com" : "hello@wishpeti.com";
const BASE_URL = IS_STAGING ? "https://wishpeti-staging.vercel.app" : "https://wishpeti.com";
const BRAND_COLOR = "#6366f1";

const emailLayout = (title, body, buttonText, buttonUrl, imageUrl) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
    <h2 style="color: #0f172a; margin-top: 0;">${title}</h2>
    ${imageUrl ? `<div style="text-align: center; margin-bottom: 20px;"><img src="${imageUrl}" style="max-width: 100%; max-height: 200px; border-radius: 8px;" /></div>` : ''}
    <div style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
      ${body}
    </div>
    ${buttonText ? `
    <a href="${buttonUrl}" style="background-color: ${BRAND_COLOR}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
      ${buttonText}
    </a>` : ''}
    <p style="margin-top: 30px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px;">
      © 2026 ${APP_NAME}. Keeping your connections private and secure.
      ${IS_STAGING ? `<br><span style="color: #ef4444; font-weight: bold;">[STAGING ENVIRONMENT]</span>` : ''}
    </p>
  </div>
`;

serve(async (req) => {
  try {
    const payload = await req.json();
    const { record, old_record } = payload;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Fetch Creator Details
    const { data: profile } = await supabase
      .from('creator_profiles')
      .select('email, display_name')
      .eq('id', record.creator_id)
      .single();

    // 2. Fetch Item Details from wishlist_items
    let itemName = "a gift from your wishlist";
    let itemImage = null;
    if (record.item_id) {
      const { data: itemData, error: itemError } = await supabase
        .from('wishlist_items')
        .select('title, image_url')
        .eq('id', record.item_id)
        .single();
        
      if (itemError) console.error("Lookup Error:", itemError.message);
      if (itemData?.title) itemName = itemData.title;
      if (itemData?.image_url) itemImage = itemData.image_url;
    }

    const creatorEmail = profile?.email;
    const creatorName = profile?.display_name || "Creator";
    const senderEmail = record.buyer_email;
    const trackingPage = `${BASE_URL}/track/${record.id}`;
    const notifications = [];

    const isCrowdfund = record.is_crowdfund === true;

    // SCENARIO: PAYMENT SUCCESS
    if (record.payment_status === 'paid' && old_record?.payment_status !== 'paid') {
      
      // ONLY send notifications if this is the designated primary item
      if (record.send_notification !== false) {
        
        // --- SENDER NOTIFICATION ---
        if (senderEmail) {
          const subject = isCrowdfund 
            ? `Confirmed! Your contribution for ${creatorName}`
            : `Thanks! Your gift for ${creatorName} is confirmed`;
          
          const title = isCrowdfund ? "Contribution Confirmed! 💰" : "Gift Confirmed! 🎁";
          
          const body = isCrowdfund
            ? `Hi ${record.buyer_name || 'there'}, <br><br>your contribution towards <strong>${itemName}</strong> was successful. Thank you for supporting this goal!`
            : `Hi ${record.buyer_name || 'there'}, <br><br>your payment for <strong>${itemName}</strong> was successful. We'll let you know once the creator accepts it.`;

          notifications.push(sendEmail({
            to: senderEmail,
            subject,
            html: emailLayout(title, body, "Track Status", trackingPage, itemImage)
          }));
        }

        // --- CREATOR NOTIFICATION ---
        if (creatorEmail) {
          const subject = isCrowdfund
            ? `Goal Progress! Someone contributed to ${itemName}`
            : `Good news! Someone just sent you a gift`;
          
          const title = isCrowdfund ? "Contribution Received! 📈" : "You've got a gift! 🎈";
          
          const body = isCrowdfund
            ? `Hi ${creatorName}, <br><br>someone just contributed towards your goal: <strong>${itemName}</strong>. Check your dashboard to see your updated progress!`
            : `Hi ${creatorName}, <br><br>someone just fulfilled <strong>${itemName}</strong> from your wishlist. Check it out in your management panel.`;

          notifications.push(sendEmail({
            to: creatorEmail,
            subject,
            html: emailLayout(title, body, isCrowdfund ? "View Goal Progress" : "Manage Gifts", `${BASE_URL}/manage-gifts`, itemImage)
          }));
        }
      }
    }

    // SCENARIO: ORDER ACCEPTED
    if (record.gift_status === 'accepted' && old_record?.gift_status !== 'accepted' && senderEmail) {
      notifications.push(sendEmail({
        to: senderEmail,
        subject: `Good news! ${creatorName} accepted your gift`,
        html: emailLayout("Gift Accepted! 🥳", `${creatorName} has accepted your gift (<strong>${itemName}</strong>). It's now being processed for shipping!`, "Track Status", trackingPage, itemImage)
      }));
    }

    // SCENARIO: REFUNDED / DISPUTED
    if (record.payment_status === 'refunded' && old_record?.payment_status !== 'refunded') {
      if (creatorEmail) {
        notifications.push(sendEmail({
          to: creatorEmail,
          subject: `Update: Status change for a gift`,
          html: emailLayout("Important Delivery Update ℹ️", `Hi ${creatorName}, <br><br>we're letting you know that due to a processing issue with the sender's payment, the delivery for <strong>"${itemName}"</strong> has been cancelled. 
            <br><br>
            <strong>What happens now?</strong><br>
            • If the item hasn't reached you yet, we have stopped the delivery.<br>
            • If you have already received the item, please keep it packaged. Our team will reach out shortly to arrange a complimentary pickup at your convenience.`, "View Dashboard", `${BASE_URL}/dashboard`, itemImage)
        }));
      }
      if (senderEmail) {
        notifications.push(sendEmail({
          to: senderEmail,
          subject: `Refund Confirmation`,
          html: emailLayout("Refund Processed ✅", `Hi ${record.buyer_name || 'there'},<br><br> we've processed a reversal for your gift (<strong>${itemName}</strong>) to ${creatorName}. Funds are returning to your original payment method.`, "Support", `${BASE_URL}/support`, itemImage)
        }));
      }
    }

    // SCENARIO: SHIPPED
    if (record.gift_status === 'shipped' && old_record?.gift_status !== 'shipped' && senderEmail) {
      notifications.push(sendEmail({
        to: senderEmail,
        subject: `Update on your gift for ${creatorName}`,
        html: emailLayout("Your gift is moving! ✅", `The <strong>${itemName}</strong> has been shipped to ${creatorName}!`, "Track Delivery Status", trackingPage, itemImage)
      }));
    }

    await Promise.all(notifications);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });

  } catch (err) {
    console.error("Critical Function Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});

async function sendEmail({ to, subject, html }) {
  // Use the dynamic APP_NAME and FROM_EMAIL based on environment detection
  const senderIdentity = `${APP_NAME} <${FROM_EMAIL}>`;

  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: senderIdentity,
      reply_to: 'support@wishpeti.com',
      to: [to],
      subject,
      html
    })
  });
}