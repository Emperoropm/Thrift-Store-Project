"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSellerOrderEmail = buildSellerOrderEmail;
function buildSellerOrderEmail(params) {
    const { sellerName, buyer, shippingInfo, items, orderId, orderTotal } = params;
    const itemRows = items.map(item => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #333;">${item.title}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; text-align: center; color: #333;">${item.quantity}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #333;">Rs. ${item.price.toFixed(2)}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 600; color: #27500A;">Rs. ${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');
    const shippingSection = shippingInfo ? `
    <div style="background: #f9f9f9; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 12px; font-size: 15px; color: #444; font-weight: 600;">📦 Shipping Address</h3>
      <p style="margin: 4px 0; color: #555; font-size: 14px;"><strong>Name:</strong> ${shippingInfo.fullName}</p>
      <p style="margin: 4px 0; color: #555; font-size: 14px;"><strong>Phone:</strong> ${shippingInfo.phone}</p>
      <p style="margin: 4px 0; color: #555; font-size: 14px;"><strong>Email:</strong> ${shippingInfo.email}</p>
      <p style="margin: 4px 0; color: #555; font-size: 14px;"><strong>Address:</strong> ${shippingInfo.address}</p>
    </div>
  ` : `
    <div style="background: #f9f9f9; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 12px; font-size: 15px; color: #444; font-weight: 600;">👤 Buyer Information</h3>
      <p style="margin: 4px 0; color: #555; font-size: 14px;"><strong>Name:</strong> ${buyer.name || 'N/A'}</p>
      <p style="margin: 4px 0; color: #555; font-size: 14px;"><strong>Email:</strong> ${buyer.email}</p>
      ${buyer.phone ? `<p style="margin: 4px 0; color: #555; font-size: 14px;"><strong>Phone:</strong> ${buyer.phone}</p>` : ''}
    </div>
  `;
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order Received</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08); max-width: 600px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6aa84f 0%, #38761d 100%); padding: 28px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">🛍️ ThriftTreasure</h1>
              <p style="margin: 6px 0 0; color: #d4edbe; font-size: 13px;">Seller Notification</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">

              <!-- Greeting -->
              <h2 style="margin: 0 0 8px; font-size: 20px; color: #222;">🎉 New Order Received!</h2>
              <p style="margin: 0 0 24px; color: #666; font-size: 14px; line-height: 1.6;">
                Hi <strong>${sellerName || 'there'}</strong>, great news! Someone just purchased your item(s) on ThriftTreasure.
              </p>

              <!-- Order ID badge -->
              <div style="background: #EAF3DE; border-left: 4px solid #6aa84f; border-radius: 6px; padding: 12px 16px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 14px; color: #27500A;">
                  <strong>Order ID:</strong> #${orderId} &nbsp;·&nbsp;
                  <strong>Date:</strong> ${new Date().toLocaleDateString('en-NP', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <!-- Items ordered -->
              <h3 style="margin: 0 0 12px; font-size: 15px; color: #444; font-weight: 600;">🧾 Items Ordered</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
                <thead>
                  <tr style="background: #f7f7f7;">
                    <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #888; font-weight: 600; text-transform: uppercase;">Product</th>
                    <th style="padding: 10px 12px; text-align: center; font-size: 12px; color: #888; font-weight: 600; text-transform: uppercase;">Qty</th>
                    <th style="padding: 10px 12px; text-align: right; font-size: 12px; color: #888; font-weight: 600; text-transform: uppercase;">Unit Price</th>
                    <th style="padding: 10px 12px; text-align: right; font-size: 12px; color: #888; font-weight: 600; text-transform: uppercase;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
                <tfoot>
                  <tr style="background: #EAF3DE;">
                    <td colspan="3" style="padding: 12px 12px; font-weight: 700; color: #27500A; font-size: 14px;">Total Amount</td>
                    <td style="padding: 12px 12px; text-align: right; font-weight: 700; color: #27500A; font-size: 16px;">Rs. ${orderTotal.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>

              <!-- Shipping / Buyer info -->
              ${shippingSection}

              <!-- CTA -->
              <div style="text-align: center; margin-top: 8px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile.html"
                   style="display: inline-block; background: linear-gradient(135deg, #6aa84f 0%, #38761d 100%); color: #fff; text-decoration: none; padding: 13px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                  View Order in Dashboard
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f7f7f7; padding: 20px 32px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0; color: #aaa; font-size: 12px;">
                You received this email because you are a seller on ThriftTreasure.<br>
                Please ship the item(s) promptly and update the order status in your dashboard.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
//# sourceMappingURL=email-templates.js.map