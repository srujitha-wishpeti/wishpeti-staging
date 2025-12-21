import PolicyLayout from './PolicyLayout';

export default function RefundPolicy() {
  return (
    <PolicyLayout title="Refund Policy">
      <p>At WishPeti, we strive to ensure a smooth gifting experience. Please note:</p>
      <ul>
        <li><strong>Physical Gifts:</strong> Since gifts are purchased by fans for creators, refunds are handled according to the original merchant's policy (e.g., Amazon).</li>
        <li><strong>Cash Contributions:</strong> Cash gifts are generally non-refundable once the payout has been initiated to the creator.</li>
        <li><strong>Technical Errors:</strong> If a double-payment occurs due to a technical glitch, please contact us within 48 hours for a reversal.</li>
      </ul>
    </PolicyLayout>
  );
}