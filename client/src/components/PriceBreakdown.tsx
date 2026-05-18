import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

interface PriceBreakdownProps {
  basePrice: number;
  discountAmount?: number;
  creditUsed?: number;
  finalPrice: number;
  currency?: string;
}

const LOCALE_BY_LANG: Record<string, string> = {
  en: 'en-US',
  ko: 'ko-KR',
  ja: 'ja-JP',
  vi: 'vi-VN',
  ru: 'ru-RU',
};

export default function PriceBreakdown({
  basePrice,
  discountAmount = 0,
  creditUsed = 0,
  finalPrice,
  currency = 'VND',
}: PriceBreakdownProps) {
  const { t } = useTranslation();
  const { lang = 'en' } = useParams<{ lang: string }>();
  const locale = LOCALE_BY_LANG[lang] ?? 'en-US';

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(locale).format(price);

  return (
    <div className="sport-card p-5">
      <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-ink-muted mb-4">
        {t('booking.priceBreakdown', 'Price breakdown')}
      </h4>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-ink-muted">{t('booking.basePrice', 'Base price')}</span>
          <span className="text-ink font-medium tabular-nums">
            {formatPrice(basePrice)} {currency}
          </span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-status-success-text">{t('booking.discount', 'Discount')}</span>
            <span className="text-status-success-text font-medium tabular-nums">
              −{formatPrice(discountAmount)} {currency}
            </span>
          </div>
        )}
        {creditUsed > 0 && (
          <div className="flex justify-between">
            <span className="text-info">{t('booking.creditUsed', 'Credit used')}</span>
            <span className="text-info font-medium tabular-nums">
              −{formatPrice(creditUsed)} {currency}
            </span>
          </div>
        )}
        <div className="border-t border-border pt-3 flex justify-between items-baseline">
          <span className="text-ink font-semibold">{t('booking.total', 'Total')}</span>
          <span className="text-primary font-display text-xl font-bold tabular-nums">
            {formatPrice(finalPrice)} {currency}
          </span>
        </div>
      </div>
    </div>
  );
}
