interface PriceBreakdownProps {
  basePrice: number;
  discountAmount?: number;
  creditUsed?: number;
  finalPrice: number;
  currency?: string;
  isDark?: boolean;
}

export default function PriceBreakdown({
  basePrice,
  discountAmount = 0,
  creditUsed = 0,
  finalPrice,
  currency = 'VND',
}: PriceBreakdownProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  return (
    <div className="bg-bg-panel rounded-xl p-4 border border-border-dark">
      <h4 className="text-xs font-medium text-muted uppercase tracking-wider mb-3">Price Breakdown</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Base price</span>
          <span className="text-text-base">{formatPrice(basePrice)} {currency}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-green">Discount</span>
            <span className="text-green">-{formatPrice(discountAmount)} {currency}</span>
          </div>
        )}
        {creditUsed > 0 && (
          <div className="flex justify-between">
            <span className="text-green">Credit used</span>
            <span className="text-green">-{formatPrice(creditUsed)} {currency}</span>
          </div>
        )}
        <div className="border-t border-border-dark pt-2 flex justify-between font-semibold">
          <span className="text-text-base">Total</span>
          <span className="text-indigo">{formatPrice(finalPrice)} {currency}</span>
        </div>
      </div>
    </div>
  );
}
